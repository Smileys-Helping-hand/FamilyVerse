import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

const SYSTEM_PROMPT = `You are an event-planning extraction engine for a social logistics platform called Gang Gear.
Your only job is to parse a casual user prompt and return a single, valid JSON object.

Rules:
- Return ONLY raw JSON. No markdown fences, no explanations, no extra text.
- All fields are required. Use null for fields you cannot determine.
- dates must be ISO 8601 strings (e.g. "2026-04-12") or null.
- eventType must be one of: "braai", "hike", "party", "sports", "travel", "dining", "beach", "other".
- requiredGear must be a string array of items the group would need (e.g. ["cooler box", "charcoal", "camp chairs"]).

JSON schema (strict):
{
  "title": string,
  "location": string | null,
  "date": string | null,
  "eventType": "braai" | "hike" | "party" | "sports" | "travel" | "dining" | "beach" | "other",
  "requiredGear": string[]
}`;

export async function POST(req: NextRequest) {
  let prompt: string;

  try {
    const body = await req.json();
    prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!prompt || prompt.length < 3) {
    return NextResponse.json({ error: 'Prompt is too short' }, { status: 400 });
  }

  if (prompt.length > 2000) {
    return NextResponse.json({ error: 'Prompt is too long (max 2000 chars)' }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed: {
      title: string;
      location: string | null;
      date: string | null;
      eventType: string;
      requiredGear: string[];
    };

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'AI returned malformed JSON' }, { status: 502 });
    }

    // Validate required shape
    if (
      typeof parsed.title !== 'string' ||
      !Array.isArray(parsed.requiredGear)
    ) {
      return NextResponse.json({ error: 'AI response missing required fields' }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[/api/plan] Gemini error:', err);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
