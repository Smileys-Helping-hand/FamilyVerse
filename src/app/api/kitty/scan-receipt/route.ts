import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const RECEIPT_PROMPT = `You are an expert receipt parser for a bill-splitting app called Gang Gear.

Analyze the receipt image and extract ALL line items, totals, and metadata.
Return ONLY valid JSON in exactly this format with NO markdown fences, NO extra text:

{
  "merchant": "Store or Restaurant Name",
  "items": [
    { "name": "Item description", "price": 12.50, "quantity": 1 }
  ],
  "subtotal": 45.00,
  "tax": 4.05,
  "tip": 0,
  "total": 49.05
}

Rules:
- All monetary values as positive decimal numbers (12.99 not 1299)
- Include every identifiable line item — do not skip any
- tip defaults to 0 if not shown on receipt
- subtotal is the pre-tax amount
- total is the final grand total actually paid
- If merchant name is unclear, use "Unknown Merchant"`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  let imageBase64: string;
  let mimeType: string;

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Use JPEG, PNG, or WEBP.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString('base64');
    mimeType = file.type;
  } catch {
    return NextResponse.json({ error: 'Failed to read uploaded image' }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
      maxOutputTokens: 1024,
    },
  });

  try {
    const result = await model.generateContent([
      RECEIPT_PROMPT,
      { inlineData: { data: imageBase64, mimeType } },
    ]);

    const text = result.response.text();

    let parsed: {
      merchant: string;
      items: Array<{ name: string; price: number; quantity: number }>;
      subtotal: number;
      tax: number;
      tip: number;
      total: number;
    };

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'AI returned malformed data. Please try again.' },
        { status: 502 }
      );
    }

    if (!Array.isArray(parsed.items) || typeof parsed.total !== 'number') {
      return NextResponse.json(
        { error: 'AI response missing required fields.' },
        { status: 502 }
      );
    }

    // Sanitize numeric fields to ensure valid numbers
    parsed.subtotal =
      typeof parsed.subtotal === 'number' && parsed.subtotal > 0
        ? parsed.subtotal
        : parsed.total - (parsed.tax ?? 0) - (parsed.tip ?? 0);
    parsed.tax = typeof parsed.tax === 'number' ? Math.max(0, parsed.tax) : 0;
    parsed.tip = typeof parsed.tip === 'number' ? Math.max(0, parsed.tip) : 0;

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[scan-receipt] Gemini error:', err);
    return NextResponse.json(
      { error: 'AI service unavailable. Please try again.' },
      { status: 503 }
    );
  }
}
