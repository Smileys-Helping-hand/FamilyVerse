'use server';

import { db } from '@/lib/db';
import { expenses, expenseSplits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * MODULE 4: Expense Intelligence (OCR + AI Receipt Processing)
 */

interface ExpenseItem {
  name: string;
  price: number;
  quantity: number;
}

interface ExtractedReceiptData {
  total: number;
  merchant: string;
  items: ExpenseItem[];
}

/**
 * Process receipt image with Gemini Vision
 * Extracts total, merchant, and itemized list
 */
export async function processReceiptWithAI(
  imageBase64: string,
  mimeType: string
): Promise<{ success: boolean; data?: ExtractedReceiptData; error?: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
You are an expert receipt parser. Analyze this receipt image and extract information.

Return ONLY valid JSON in this exact format:
{
  "total": 45.99,
  "merchant": "Store Name",
  "items": [
    {
      "name": "Item Name",
      "price": 12.50,
      "quantity": 1
    }
  ]
}

Rules:
- total must be a number (in dollars, not cents)
- merchant should be the store/restaurant name
- items array should include all identifiable line items
- If you can't read something clearly, make your best guess
- Prices should be in decimal format (e.g., 12.99 not 1299)
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
    ]);

    const response = result.response.text();

    // Extract JSON from response
    let jsonText = response;
    if (response.includes('```json')) {
      jsonText = response.split('```json')[1].split('```')[0].trim();
    } else if (response.includes('```')) {
      jsonText = response.split('```')[1].split('```')[0].trim();
    }

    const extractedData: ExtractedReceiptData = JSON.parse(jsonText);

    return { success: true, data: extractedData };
  } catch (error) {
    console.error('Error processing receipt with AI:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process receipt',
    };
  }
}

/**
 * Create expense from FormData (includes image upload)
 * This is called from a client form submission
 */
export async function createExpenseFromReceipt(formData: FormData) {
  try {
    const eventId = parseInt(formData.get('eventId') as string);
    const payerId = formData.get('payerId') as string;
    const file = formData.get('receipt') as File;
    const splitWith = JSON.parse(formData.get('splitWith') as string) as string[]; // User IDs to split with

    if (!file) {
      return { success: false, error: 'No receipt image provided' };
    }

    // Convert file to base64 for Gemini
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Process with AI
    const aiResult = await processReceiptWithAI(base64, file.type);
    
    if (!aiResult.success || !aiResult.data) {
      return { success: false, error: aiResult.error || 'Failed to process receipt' };
    }

    const extractedData = aiResult.data;

    // Upload to Firebase Storage (you'll need to initialize Firebase first)
    // For now, we'll create a placeholder URL
    // TODO: Implement actual Firebase upload
    const receiptUrl = `https://storage.example.com/receipts/${Date.now()}_${file.name}`;

    // Convert total to cents
    const totalInCents = Math.round(extractedData.total * 100);

    // Create expense record
    const [expense] = await db
      .insert(expenses)
      .values({
        eventId,
        payerId,
        totalAmount: totalInCents,
        merchant: extractedData.merchant,
        receiptUrl,
        aiExtractedData: extractedData,
      })
      .returning();

    // Calculate split amount
    const splitCount = splitWith.length + 1; // Include payer
    const amountPerPerson = Math.floor(totalInCents / splitCount);
    const remainder = totalInCents - (amountPerPerson * splitCount);

    // Create splits (payer owes 0)
    const splits = [];
    
    // Payer's split (marked as paid)
    splits.push({
      expenseId: expense.id,
      userId: payerId,
      amountOwed: 0,
      isPaid: true,
      paidAt: new Date(),
    });

    // Other people's splits
    for (let i = 0; i < splitWith.length; i++) {
      const amount = amountPerPerson + (i === 0 ? remainder : 0); // Give remainder to first person
      splits.push({
        expenseId: expense.id,
        userId: splitWith[i],
        amountOwed: amount,
        isPaid: false,
      });
    }

    await db.insert(expenseSplits).values(splits);

    return {
      success: true,
      data: {
        expense,
        extractedData,
        splits,
      },
    };
  } catch (error) {
    console.error('Error creating expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create expense',
    };
  }
}

/**
 * Get all expenses for an event
 */
export async function getEventExpenses(eventId: number) {
  try {
    const eventExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.eventId, eventId));

    // Get splits for each expense
    const expensesWithSplits = await Promise.all(
      eventExpenses.map(async (expense) => {
        const splits = await db
          .select()
          .from(expenseSplits)
          .where(eq(expenseSplits.expenseId, expense.id));

        return {
          ...expense,
          splits,
        };
      })
    );

    return { success: true, data: expensesWithSplits };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch expenses',
    };
  }
}

/**
 * Mark a split as paid
 */
export async function markSplitAsPaid(splitId: number) {
  try {
    const [updated] = await db
      .update(expenseSplits)
      .set({
        isPaid: true,
        paidAt: new Date(),
      })
      .where(eq(expenseSplits.id, splitId))
      .returning();

    return { success: true, data: updated };
  } catch (error) {
    console.error('Error marking split as paid:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as paid',
    };
  }
}

/**
 * Get user's expense summary for an event
 */
export async function getUserExpenseSummary(eventId: number, userId: string) {
  try {
    // Get expenses user paid for
    const paidExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.eventId, eventId))
      .where(eq(expenses.payerId, userId));

    const totalPaid = paidExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);

    // Get what user owes
    const owedSplits = await db
      .select()
      .from(expenseSplits)
      .where(eq(expenseSplits.userId, userId))
      .where(eq(expenseSplits.isPaid, false));

    const totalOwed = owedSplits.reduce((sum, split) => sum + split.amountOwed, 0);

    return {
      success: true,
      data: {
        totalPaid: totalPaid / 100, // Convert cents to dollars
        totalOwed: totalOwed / 100,
        netBalance: (totalPaid - totalOwed) / 100,
        unpaidSplits: owedSplits,
      },
    };
  } catch (error) {
    console.error('Error getting expense summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get summary',
    };
  }
}

/**
 * Manual expense creation (without receipt)
 */
export async function createManualExpense(data: {
  eventId: number;
  payerId: string;
  totalAmount: number; // in cents
  merchant?: string;
  description?: string;
  splitWith: string[];
}) {
  try {
    const { eventId, payerId, totalAmount, merchant, description, splitWith } = data;

    const [expense] = await db
      .insert(expenses)
      .values({
        eventId,
        payerId,
        totalAmount,
        merchant,
        description,
      })
      .returning();

    // Create splits
    const splitCount = splitWith.length + 1;
    const amountPerPerson = Math.floor(totalAmount / splitCount);
    const remainder = totalAmount - (amountPerPerson * splitCount);

    const splits = [
      {
        expenseId: expense.id,
        userId: payerId,
        amountOwed: 0,
        isPaid: true,
        paidAt: new Date(),
      },
      ...splitWith.map((userId, i) => ({
        expenseId: expense.id,
        userId,
        amountOwed: amountPerPerson + (i === 0 ? remainder : 0),
        isPaid: false,
      })),
    ];

    await db.insert(expenseSplits).values(splits);

    return { success: true, data: { expense, splits } };
  } catch (error) {
    console.error('Error creating manual expense:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create expense',
    };
  }
}
