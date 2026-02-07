'use server';

import { db } from '@/lib/db';
import { smartQrs, smartQrScans, qrClaims, partyUsers, type SmartQr, type NewSmartQr, type QrClaim } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ensureSmartQrSchema } from '@/lib/db/ensure-smart-qr-schema';

// Scan result types for the UI
export type ScanStatus = 'SUCCESS' | 'FIRST_FINDER' | 'TRAP' | 'ALREADY_CLAIMED' | 'NOT_FOUND' | 'EXPIRED' | 'ERROR';

export interface ScanResult {
  status: ScanStatus;
  message: string;
  points?: number; // Positive for reward, negative for trap
  totalBalance?: number;
  qr?: SmartQr;
  isFirstFinder?: boolean;
}

// Generate a random 6-character token
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Get current user ID from cookie
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('party_user_id')?.value || cookieStore.get('partyUserId')?.value || null;
  } catch {
    return null;
  }
}

// ============================================
// CREATE SMART QR (with gamification options)
// ============================================
export async function createSmartQrAction(data: {
  title: string;
  content: string;
  type: 'CLUE' | 'TASK' | 'INFO' | 'TRAP';
  points?: number;
  isTrap?: boolean;
  bonusFirstFinder?: number;
  createdBy?: string;
}): Promise<{ success: boolean; qr?: SmartQr; shortUrl?: string; error?: string }> {
  try {
    await ensureSmartQrSchema();
    // Generate unique token
    let token = generateToken();
    let attempts = 0;
    
    // Ensure token is unique (rare collision case)
    while (attempts < 5) {
      const existing = await db.query.smartQrs.findFirst({
        where: eq(smartQrs.token, token),
      });
      if (!existing) break;
      token = generateToken();
      attempts++;
    }
    
    const [qr] = await db.insert(smartQrs).values({
      token,
      title: data.title,
      content: data.content,
      type: data.type,
      points: data.points ?? 100,
      isTrap: data.isTrap ?? false,
      bonusFirstFinder: data.bonusFirstFinder ?? 200,
      createdBy: data.createdBy || 'admin',
    }).returning();
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alphatraders.co.za';
    const shortUrl = `${baseUrl}/q/${token}`;
    
    revalidatePath('/admin/qr-studio');
    
    return { success: true, qr, shortUrl };
  } catch (error) {
    console.error('Failed to create Smart QR:', error);
    return { success: false, error: 'Failed to create Smart QR' };
  }
}

// ============================================
// GET SMART QR BY TOKEN
// ============================================
export async function getSmartQrByTokenAction(token: string): Promise<SmartQr | null> {
  try {
    await ensureSmartQrSchema();
    const qr = await db.query.smartQrs.findFirst({
      where: eq(smartQrs.token, token.toUpperCase()),
    });
    return qr || null;
  } catch (error) {
    console.error('Failed to fetch Smart QR:', error);
    return null;
  }
}

// ============================================
// RESOLVE SMART QR (Full Game Logic)
// Called when someone visits /q/[token]
// ============================================
export async function resolveSmartQrAction(
  token: string,
  scannerName: string = 'Guest',
  userAgent?: string,
  userId?: string
): Promise<ScanResult> {
  try {
    await ensureSmartQrSchema();
    // Get the QR
    const qr = await db.query.smartQrs.findFirst({
      where: eq(smartQrs.token, token.toUpperCase()),
    });
    
    if (!qr) {
      return { status: 'NOT_FOUND', message: 'This clue doesn\'t exist!' };
    }
    
    if (!qr.isActive) {
      return { status: 'EXPIRED', message: 'This clue has expired!', qr };
    }
    
    // Get user ID from parameter or cookie
    const effectiveUserId = userId || await getCurrentUserId() || `guest_${Date.now()}`;
    
    // CHECK 2: Already claimed by this user?
    const existingClaim = await db.query.qrClaims.findFirst({
      where: and(
        eq(qrClaims.qrId, qr.id),
        eq(qrClaims.userId, effectiveUserId)
      ),
    });
    
    if (existingClaim) {
      return { 
        status: 'ALREADY_CLAIMED', 
        message: 'You already found this one!',
        points: 0,
        qr,
      };
    }
    
    // CHECK 3: Is it a TRAP?
    if (qr.isTrap) {
      const trapPoints = -(qr.points || 50); // Deduct points
      
      // Update user wallet (if logged in)
      let newBalance = 0;
      if (effectiveUserId && !effectiveUserId.startsWith('guest_')) {
        const [updatedUser] = await db.update(partyUsers)
          .set({ walletBalance: sql`wallet_balance + ${trapPoints}` })
          .where(eq(partyUsers.id, effectiveUserId))
          .returning();
        newBalance = updatedUser?.walletBalance || 0;
      }
      
      // Record claim
      await db.insert(qrClaims).values({
        qrId: qr.id,
        userId: effectiveUserId,
        userName: scannerName,
        pointsAwarded: trapPoints,
        wasFirstFinder: false,
      });
      
      // Update scan count
      await db.update(smartQrs)
        .set({
          scanCount: qr.scanCount + 1,
          lastScannedAt: new Date(),
          lastScannedBy: scannerName,
        })
        .where(eq(smartQrs.id, qr.id));
      
      // Record scan history
      await db.insert(smartQrScans).values({
        qrId: qr.id,
        scannerName,
        userAgent,
      });
      
      // TODO: Trigger Pusher for TV explosion
      
      return {
        status: 'TRAP',
        message: `💥 BOOM! You lost ${Math.abs(trapPoints)} points!`,
        points: trapPoints,
        totalBalance: newBalance,
        qr,
      };
    }
    
    // CHECK 4: First Finder bonus?
    const isFirstFinder = qr.scanCount === 0;
    const basePoints = qr.points || 100;
    const bonusPoints = isFirstFinder ? (qr.bonusFirstFinder || 200) : 0;
    const totalPoints = basePoints + bonusPoints;
    
    // Update user wallet
    let newBalance = 0;
    if (effectiveUserId && !effectiveUserId.startsWith('guest_')) {
      const [updatedUser] = await db.update(partyUsers)
        .set({ walletBalance: sql`wallet_balance + ${totalPoints}` })
        .where(eq(partyUsers.id, effectiveUserId))
        .returning();
      newBalance = updatedUser?.walletBalance || 0;
    }
    
    // Record claim
    await db.insert(qrClaims).values({
      qrId: qr.id,
      userId: effectiveUserId,
      userName: scannerName,
      pointsAwarded: totalPoints,
      wasFirstFinder: isFirstFinder,
    });
    
    // Update QR scan count
    const [updatedQr] = await db.update(smartQrs)
      .set({
        scanCount: qr.scanCount + 1,
        lastScannedAt: new Date(),
        lastScannedBy: scannerName,
      })
      .where(eq(smartQrs.id, qr.id))
      .returning();
    
    // Record scan history
    await db.insert(smartQrScans).values({
      qrId: qr.id,
      scannerName,
      userAgent,
    });
    
    // TODO: Trigger Pusher for TV celebration
    
    if (isFirstFinder) {
      return {
        status: 'FIRST_FINDER',
        message: `🎉 FIRST FINDER BONUS! +${totalPoints} points!`,
        points: totalPoints,
        totalBalance: newBalance,
        qr: updatedQr,
        isFirstFinder: true,
      };
    }
    
    return {
      status: 'SUCCESS',
      message: `✨ Found it! +${totalPoints} points!`,
      points: totalPoints,
      totalBalance: newBalance,
      qr: updatedQr,
    };
    
  } catch (error) {
    console.error('Failed to resolve Smart QR:', error);
    return { status: 'ERROR', message: 'Something went wrong!' };
  }
}

// ============================================
// RECORD A SCAN (Legacy - for backwards compatibility)
// ============================================
export async function recordSmartQrScanAction(
  token: string,
  scannerName: string = 'Guest',
  userAgent?: string
): Promise<{ success: boolean; qr?: SmartQr; error?: string }> {
  const result = await resolveSmartQrAction(token, scannerName, userAgent);
  
  if (result.status === 'NOT_FOUND' || result.status === 'ERROR') {
    return { success: false, error: result.message };
  }
  
  return { success: true, qr: result.qr };
}

// ============================================
// GET ALL SMART QRS (Admin)
// ============================================
export async function getAllSmartQrsAction(): Promise<SmartQr[]> {
  try {
    await ensureSmartQrSchema();
    const qrs = await db.select().from(smartQrs).orderBy(desc(smartQrs.createdAt));
    return qrs;
  } catch (error) {
    console.error('Failed to fetch Smart QRs:', error);
    return [];
  }
}

// ============================================
// GET RECENT CLAIMS (Admin Ticker with Points!)
// ============================================
export async function getRecentClaimsAction(limit: number = 10): Promise<{
  id: string;
  qrTitle: string;
  userName: string;
  points: number;
  wasFirstFinder: boolean;
  isTrap: boolean;
  claimedAt: Date;
}[]> {
  try {
    await ensureSmartQrSchema();
    const claims = await db
      .select({
        id: qrClaims.id,
        qrTitle: smartQrs.title,
        userName: qrClaims.userName,
        points: qrClaims.pointsAwarded,
        wasFirstFinder: qrClaims.wasFirstFinder,
        isTrap: smartQrs.isTrap,
        claimedAt: qrClaims.claimedAt,
      })
      .from(qrClaims)
      .innerJoin(smartQrs, eq(qrClaims.qrId, smartQrs.id))
      .orderBy(desc(qrClaims.claimedAt))
      .limit(limit);
    
    return claims;
  } catch (error) {
    console.error('Failed to fetch recent claims:', error);
    return [];
  }
}

// ============================================
// GET RECENT SCANS (Admin Live Feed - Legacy)
// ============================================
export async function getRecentScansAction(limit: number = 10): Promise<{
  id: number;
  qrTitle: string;
  scannerName: string;
  scannedAt: Date;
}[]> {
  try {
    await ensureSmartQrSchema();
    const scans = await db
      .select({
        id: smartQrScans.id,
        qrTitle: smartQrs.title,
        scannerName: smartQrScans.scannerName,
        scannedAt: smartQrScans.scannedAt,
      })
      .from(smartQrScans)
      .innerJoin(smartQrs, eq(smartQrScans.qrId, smartQrs.id))
      .orderBy(desc(smartQrScans.scannedAt))
      .limit(limit);
    
    return scans;
  } catch (error) {
    console.error('Failed to fetch recent scans:', error);
    return [];
  }
}

// ============================================
// TOGGLE QR ACTIVE STATUS (Admin)
// ============================================
export async function toggleSmartQrActiveAction(id: string): Promise<{ success: boolean }> {
  try {
    await ensureSmartQrSchema();
    const qr = await db.query.smartQrs.findFirst({
      where: eq(smartQrs.id, id),
    });
    
    if (!qr) return { success: false };
    
    await db.update(smartQrs)
      .set({ isActive: !qr.isActive })
      .where(eq(smartQrs.id, id));
    
    revalidatePath('/admin/qr-studio');
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle Smart QR:', error);
    return { success: false };
  }
}

// ============================================
// DELETE SMART QR (Admin)
// ============================================
export async function deleteSmartQrAction(id: string): Promise<{ success: boolean }> {
  try {
    await ensureSmartQrSchema();
    await db.delete(smartQrs).where(eq(smartQrs.id, id));
    revalidatePath('/admin/qr-studio');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete Smart QR:', error);
    return { success: false };
  }
}
