'use server';

import { db } from '@/lib/db';
import { smartQrs, smartQrScans, type SmartQr, type NewSmartQr } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

// Generate a random 6-character token
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ============================================
// CREATE SMART QR
// ============================================
export async function createSmartQrAction(data: {
  title: string;
  content: string;
  type: 'CLUE' | 'TASK' | 'INFO';
  createdBy?: string;
}): Promise<{ success: boolean; qr?: SmartQr; shortUrl?: string; error?: string }> {
  try {
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
// RECORD A SCAN (Called when someone visits /q/[token])
// ============================================
export async function recordSmartQrScanAction(
  token: string,
  scannerName: string = 'Guest',
  userAgent?: string
): Promise<{ success: boolean; qr?: SmartQr; error?: string }> {
  try {
    // Get the QR
    const qr = await db.query.smartQrs.findFirst({
      where: eq(smartQrs.token, token.toUpperCase()),
    });
    
    if (!qr) {
      return { success: false, error: 'QR not found' };
    }
    
    if (!qr.isActive) {
      return { success: false, error: 'This clue has expired' };
    }
    
    // Update scan count and last scanned
    const [updatedQr] = await db.update(smartQrs)
      .set({
        scanCount: qr.scanCount + 1,
        lastScannedAt: new Date(),
        lastScannedBy: scannerName,
      })
      .where(eq(smartQrs.id, qr.id))
      .returning();
    
    // Record scan in history
    await db.insert(smartQrScans).values({
      qrId: qr.id,
      scannerName,
      userAgent,
    });
    
    // TODO: Trigger Pusher event for live feed
    // await triggerScanEvent(updatedQr);
    
    return { success: true, qr: updatedQr };
  } catch (error) {
    console.error('Failed to record scan:', error);
    return { success: false, error: 'Failed to record scan' };
  }
}

// ============================================
// GET ALL SMART QRS (Admin)
// ============================================
export async function getAllSmartQrsAction(): Promise<SmartQr[]> {
  try {
    const qrs = await db.select().from(smartQrs).orderBy(desc(smartQrs.createdAt));
    return qrs;
  } catch (error) {
    console.error('Failed to fetch Smart QRs:', error);
    return [];
  }
}

// ============================================
// GET RECENT SCANS (Admin Live Feed)
// ============================================
export async function getRecentScansAction(limit: number = 10): Promise<{
  id: number;
  qrTitle: string;
  scannerName: string;
  scannedAt: Date;
}[]> {
  try {
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
    await db.delete(smartQrs).where(eq(smartQrs.id, id));
    revalidatePath('/admin/qr-studio');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete Smart QR:', error);
    return { success: false };
  }
}
