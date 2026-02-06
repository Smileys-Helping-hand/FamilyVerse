'use server';

import { db } from '@/lib/db';
import { tasks, taskCompletions, gameConfig } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import QRCode from 'qrcode';

type ServerActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================
// TASK CREATION & QR GENERATION
// ============================================

export async function createTask(
  eventId: number,
  taskData: {
    name: string;
    description?: string;
    taskType?: 'qr_scan' | 'mini_game';
    miniGameType?: 'wire_puzzle' | 'code_entry' | 'sequence';
    completionBonusSeconds?: number;
  }
): Promise<ServerActionResponse<{
  task: typeof tasks.$inferSelect;
  qrCodeImage: string; // Base64 data URL
}>> {
  try {
    // Generate unique task URL
    const taskId = crypto.randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const taskUrl = `${baseUrl}/game/task/${taskId}`;

    // Generate QR code as base64 image
    const qrCodeImage = await QRCode.toDataURL(taskUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Insert task into database
    const [task] = await db
      .insert(tasks)
      .values({
        eventId,
        name: taskData.name,
        description: taskData.description,
        taskType: taskData.taskType || 'qr_scan',
        miniGameType: taskData.miniGameType,
        qrCodeData: taskUrl,
        completionBonusSeconds: taskData.completionBonusSeconds || 120,
      })
      .returning();

    revalidatePath('/admin/dashboard');
    return { success: true, data: { task, qrCodeImage } };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

export async function getAllTasks(eventId: number): Promise<ServerActionResponse<typeof tasks.$inferSelect[]>> {
  try {
    const allTasks = await db.query.tasks.findMany({
      where: eq(tasks.eventId, eventId),
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });

    return { success: true, data: allTasks };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { success: false, error: 'Failed to fetch tasks' };
  }
}

export async function getTaskByQrData(qrData: string): Promise<ServerActionResponse<typeof tasks.$inferSelect | null>> {
  try {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.qrCodeData, qrData),
    });

    return { success: true, data: task || null };
  } catch (error) {
    console.error('Error fetching task:', error);
    return { success: false, error: 'Failed to fetch task' };
  }
}

export async function updateTask(
  taskId: number,
  updates: {
    name?: string;
    description?: string;
    completionBonusSeconds?: number;
    isActive?: boolean;
  }
): Promise<ServerActionResponse<typeof tasks.$inferSelect>> {
  try {
    const [updated] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, taskId))
      .returning();

    revalidatePath('/admin/dashboard');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function deleteTask(taskId: number): Promise<ServerActionResponse<void>> {
  try {
    await db.delete(tasks).where(eq(tasks.id, taskId));
    revalidatePath('/admin/dashboard');
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}

// ============================================
// TASK COMPLETION & POWER LEVEL MANAGEMENT
// ============================================

export async function completeTask(
  taskId: number,
  sessionId: string,
  userId: string,
  timeTakenSeconds: number
): Promise<ServerActionResponse<{
  completion: typeof taskCompletions.$inferSelect;
  bonusSeconds: number;
  newPowerLevel: number;
}>> {
  try {
    // Check if already completed by this user
    const existingCompletion = await db.query.taskCompletions.findFirst({
      where: and(
        eq(taskCompletions.taskId, taskId),
        eq(taskCompletions.sessionId, sessionId),
        eq(taskCompletions.userId, userId)
      ),
    });

    if (existingCompletion) {
      return { success: false, error: 'Task already completed' };
    }

    // Get task details
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task || !task.isActive) {
      return { success: false, error: 'Task not found or inactive' };
    }

    // Record completion
    const [completion] = await db
      .insert(taskCompletions)
      .values({
        taskId,
        sessionId,
        userId,
        timeTakenSeconds,
      })
      .returning();

    // Boost power level (each task completion adds to the power gauge)
    const powerBoost = Math.min(20, task.completionBonusSeconds / 6); // 120s = +20 power
    const config = await db.query.gameConfig.findFirst({
      where: eq(gameConfig.eventId, task.eventId),
    });

    let newPowerLevel = 100;
    if (config) {
      newPowerLevel = Math.min(100, config.powerLevel + powerBoost);
      await db
        .update(gameConfig)
        .set({ powerLevel: newPowerLevel })
        .where(eq(gameConfig.eventId, task.eventId));
    }

    revalidatePath('/game/task');
    return { 
      success: true, 
      data: { 
        completion, 
        bonusSeconds: task.completionBonusSeconds, 
        newPowerLevel 
      } 
    };
  } catch (error) {
    console.error('Error completing task:', error);
    return { success: false, error: 'Failed to complete task' };
  }
}

export async function getUserTaskCompletions(
  sessionId: string,
  userId: string
): Promise<ServerActionResponse<Array<typeof taskCompletions.$inferSelect & { task: typeof tasks.$inferSelect }>>> {
  try {
    const completions = await db.query.taskCompletions.findMany({
      where: and(
        eq(taskCompletions.sessionId, sessionId),
        eq(taskCompletions.userId, userId)
      ),
      with: {
        task: true,
      },
    });

    return { success: true, data: completions };
  } catch (error) {
    console.error('Error fetching completions:', error);
    return { success: false, error: 'Failed to fetch completions' };
  }
}

export async function getTaskCompletionStats(
  taskId: number
): Promise<ServerActionResponse<{
  totalCompletions: number;
  averageTimeSeconds: number;
  fastestTimeSeconds: number;
}>> {
  try {
    const result = await db
      .select({
        totalCompletions: sql<number>`count(*)::int`,
        averageTimeSeconds: sql<number>`coalesce(avg(${taskCompletions.timeTakenSeconds})::int, 0)`,
        fastestTimeSeconds: sql<number>`coalesce(min(${taskCompletions.timeTakenSeconds})::int, 0)`,
      })
      .from(taskCompletions)
      .where(eq(taskCompletions.taskId, taskId));

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { success: false, error: 'Failed to fetch stats' };
  }
}

// ============================================
// QR CODE REGENERATION
// ============================================

export async function regenerateQRCode(
  taskId: number
): Promise<ServerActionResponse<string>> {
  try {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    // Generate fresh QR code
    const qrCodeImage = await QRCode.toDataURL(task.qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return { success: true, data: qrCodeImage };
  } catch (error) {
    console.error('Error regenerating QR code:', error);
    return { success: false, error: 'Failed to regenerate QR code' };
  }
}

// ============================================
// DOWNLOADABLE QR CODE (High-Res for Label Printer)
// ============================================

export async function generatePrintableQR(
  taskId: number,
  size: number = 600 // Larger for printing
): Promise<ServerActionResponse<string>> {
  try {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    const qrCodeImage = await QRCode.toDataURL(task.qrCodeData, {
      width: size,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction for printed labels
    });

    return { success: true, data: qrCodeImage };
  } catch (error) {
    console.error('Error generating printable QR:', error);
    return { success: false, error: 'Failed to generate printable QR' };
  }
}
