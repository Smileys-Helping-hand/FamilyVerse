'use server';

import { db } from '@/lib/db';
import { 
  scannables, 
  scannableScans, 
  detectiveNotebook,
  type NewScannable,
  type NewScannableScan,
  type NewDetectiveNotebook
} from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
// Note: Install qrcode package: npm install qrcode @types/qrcode
const QRCode = require('qrcode');

// ============================================
// CREATE & MANAGE SCANNABLES
// ============================================

export async function createScannable(data: {
  eventId: number;
  type: 'TASK' | 'TREASURE_NODE' | 'KILLER_EVIDENCE';
  label: string;
  content?: string;
  solutionCode?: string;
  chainId?: string;
  chainOrder?: number;
  rewardPoints?: number;
}) {
  try {
    // Generate UUID for scannable
    const scannableId = crypto.randomUUID();
    
    // Generate QR code URL (will be scanned by player app)
    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/game/scannable/${scannableId}`;
    
    // Generate QR code data URL for printing
    const qrCodeData = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const newScannable: NewScannable = {
      id: scannableId,
      eventId: data.eventId,
      type: data.type,
      label: data.label,
      content: data.content || '',
      solutionCode: data.solutionCode,
      chainId: data.chainId,
      chainOrder: data.chainOrder,
      isActive: true,
      qrCodeData,
      rewardPoints: data.rewardPoints || 0,
    };

    await db.insert(scannables).values(newScannable);

    return { success: true, scannableId, qrCodeData };
  } catch (error) {
    console.error('Error creating scannable:', error);
    return { success: false, error: 'Failed to create scannable' };
  }
}

export async function getAllScannables(eventId: number, type?: 'TASK' | 'TREASURE_NODE' | 'KILLER_EVIDENCE') {
  try {
    const query = type
      ? db.select().from(scannables).where(
          and(
            eq(scannables.eventId, eventId),
            eq(scannables.type, type)
          )
        ).orderBy(asc(scannables.chainOrder), desc(scannables.createdAt))
      : db.select().from(scannables).where(eq(scannables.eventId, eventId)).orderBy(desc(scannables.createdAt));

    const results = await query;
    return { success: true, scannables: results };
  } catch (error) {
    console.error('Error fetching scannables:', error);
    return { success: false, error: 'Failed to fetch scannables', scannables: [] };
  }
}

export async function updateScannableContent(scannableId: string, content: string) {
  try {
    await db
      .update(scannables)
      .set({ 
        content,
        updatedAt: new Date()
      })
      .where(eq(scannables.id, scannableId));

    return { success: true };
  } catch (error) {
    console.error('Error updating scannable content:', error);
    return { success: false, error: 'Failed to update scannable' };
  }
}

export async function toggleScannableActive(scannableId: string, isActive: boolean) {
  try {
    await db
      .update(scannables)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(eq(scannables.id, scannableId));

    return { success: true };
  } catch (error) {
    console.error('Error toggling scannable:', error);
    return { success: false, error: 'Failed to toggle scannable' };
  }
}

export async function deleteScannable(scannableId: string) {
  try {
    await db.delete(scannables).where(eq(scannables.id, scannableId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting scannable:', error);
    return { success: false, error: 'Failed to delete scannable' };
  }
}

// ============================================
// TREASURE HUNT LOGIC
// ============================================

export async function scanScannable(data: {
  scannableId: string;
  userId: string;
  sessionId: string;
}) {
  try {
    // Get the scannable
    const [scannable] = await db
      .select()
      .from(scannables)
      .where(eq(scannables.id, data.scannableId));

    if (!scannable) {
      return { success: false, error: 'Scannable not found' };
    }

    if (!scannable.isActive) {
      return { success: false, error: 'This scannable is not currently active' };
    }

    // Check if treasure hunt and validate order
    let isCorrectOrder = true;
    if (scannable.type === 'TREASURE_NODE' && scannable.chainId) {
      const previousScans = await db
        .select()
        .from(scannableScans)
        .innerJoin(scannables, eq(scannableScans.scannableId, scannables.id))
        .where(
          and(
            eq(scannableScans.userId, data.userId),
            eq(scannableScans.sessionId, data.sessionId),
            eq(scannables.chainId, scannable.chainId)
          )
        );

      // Find expected order
      const expectedOrder = (scannable.chainOrder || 1) - 1;
      const completedOrders = previousScans
        .map((scan) => scan.scannables.chainOrder || 0)
        .filter((order) => order > 0);

      // Check if previous steps completed
      if (expectedOrder > 0) {
        const hasAllPrevious = Array.from({ length: expectedOrder }, (_, i) => i + 1).every((order) =>
          completedOrders.includes(order)
        );
        isCorrectOrder = hasAllPrevious;
      }
    }

    // Record the scan
    const newScan: NewScannableScan = {
      scannableId: data.scannableId,
      userId: data.userId,
      sessionId: data.sessionId,
      isCorrectOrder,
    };

    await db.insert(scannableScans).values(newScan);

    return {
      success: true,
      scannable,
      isCorrectOrder,
    };
  } catch (error) {
    console.error('Error scanning scannable:', error);
    return { success: false, error: 'Failed to scan scannable' };
  }
}

export async function getTreasureChainProgress(userId: string, sessionId: string, chainId: string) {
  try {
    const scans = await db
      .select()
      .from(scannableScans)
      .innerJoin(scannables, eq(scannableScans.scannableId, scannables.id))
      .where(
        and(
          eq(scannableScans.userId, userId),
          eq(scannableScans.sessionId, sessionId),
          eq(scannables.chainId, chainId),
          eq(scannableScans.isCorrectOrder, true)
        )
      )
      .orderBy(asc(scannables.chainOrder));

    const completedSteps = scans.map((scan) => ({
      order: scan.scannables.chainOrder || 0,
      label: scan.scannables.label,
      scannedAt: scan.scannable_scans.scannedAt,
    }));

    return { success: true, completedSteps };
  } catch (error) {
    console.error('Error fetching treasure chain progress:', error);
    return { success: false, error: 'Failed to fetch progress', completedSteps: [] };
  }
}

// ============================================
// DETECTIVE NOTEBOOK
// ============================================

export async function addToDetectiveNotebook(data: {
  userId: string;
  sessionId: string;
  evidenceId: string;
  notes?: string;
}) {
  try {
    // Check if already in notebook
    const existing = await db
      .select()
      .from(detectiveNotebook)
      .where(
        and(
          eq(detectiveNotebook.userId, data.userId),
          eq(detectiveNotebook.sessionId, data.sessionId),
          eq(detectiveNotebook.evidenceId, data.evidenceId)
        )
      );

    if (existing.length > 0) {
      return { success: true, message: 'Evidence already in notebook' };
    }

    const newEntry: NewDetectiveNotebook = {
      userId: data.userId,
      sessionId: data.sessionId,
      evidenceId: data.evidenceId,
      notes: data.notes || '',
    };

    await db.insert(detectiveNotebook).values(newEntry);

    return { success: true };
  } catch (error) {
    console.error('Error adding to detective notebook:', error);
    return { success: false, error: 'Failed to add evidence' };
  }
}

export async function getDetectiveNotebook(userId: string, sessionId: string) {
  try {
    const entries = await db
      .select()
      .from(detectiveNotebook)
      .innerJoin(scannables, eq(detectiveNotebook.evidenceId, scannables.id))
      .where(
        and(
          eq(detectiveNotebook.userId, userId),
          eq(detectiveNotebook.sessionId, sessionId)
        )
      )
      .orderBy(desc(detectiveNotebook.addedAt));

    const notebook = entries.map((entry) => ({
      id: entry.detective_notebook.id,
      evidence: {
        id: entry.scannables.id,
        label: entry.scannables.label,
        content: entry.scannables.content,
      },
      notes: entry.detective_notebook.notes,
      collectedAt: entry.detective_notebook.addedAt,
    }));

    return { success: true, notebook };
  } catch (error) {
    console.error('Error fetching detective notebook:', error);
    return { success: false, error: 'Failed to fetch notebook', notebook: [] };
  }
}

export async function updateDetectiveNotes(notebookId: number, notes: string) {
  try {
    await db
      .update(detectiveNotebook)
      .set({ notes })
      .where(eq(detectiveNotebook.id, notebookId));

    return { success: true };
  } catch (error) {
    console.error('Error updating detective notes:', error);
    return { success: false, error: 'Failed to update notes' };
  }
}
