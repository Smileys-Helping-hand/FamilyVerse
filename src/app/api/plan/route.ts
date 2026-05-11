import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

type EventType = 'braai' | 'hike' | 'party' | 'sports' | 'travel' | 'dining' | 'beach' | 'other';

type PlanResponse = {
  title: string;
  location: string | null;
  date: string | null;
  eventType: EventType;
  requiredGear: string[];
};

const EVENT_TYPES: EventType[] = ['braai', 'hike', 'party', 'sports', 'travel', 'dining', 'beach', 'other'];

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nextWeekday(targetDay: number, includeToday: boolean): Date {
  const now = new Date();
  const currentDay = now.getDay();
  let delta = (targetDay - currentDay + 7) % 7;
  if (delta === 0 && !includeToday) {
    delta = 7;
  }
  const next = new Date(now);
  next.setDate(now.getDate() + delta);
  return next;
}

function extractDate(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  const explicitIso = prompt.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (explicitIso) {
    return `${explicitIso[1]}-${explicitIso[2]}-${explicitIso[3]}`;
  }

  if (lower.includes('today')) {
    return toIsoDate(new Date());
  }

  if (lower.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toIsoDate(tomorrow);
  }

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  for (const [day, index] of Object.entries(dayMap)) {
    if (lower.includes(`next ${day}`)) {
      return toIsoDate(nextWeekday(index, false));
    }
    if (lower.includes(`this ${day}`) || lower.includes(day)) {
      return toIsoDate(nextWeekday(index, true));
    }
  }

  return null;
}

function extractLocation(prompt: string): string | null {
  const match = prompt.match(/\b(?:at|in|to)\s+([A-Za-z0-9' .,-]{2,60})/i);
  if (!match) return null;
  return match[1].trim().replace(/[.,!?;:]$/, '') || null;
}

function detectEventType(prompt: string): EventType {
  const lower = prompt.toLowerCase();
  if (/(braai|bbq|barbecue)/.test(lower)) return 'braai';
  if (/(hike|hiking|trail|mountain)/.test(lower)) return 'hike';
  if (/(beach|coast|seaside)/.test(lower)) return 'beach';
  if (/(dinner|lunch|brunch|restaurant|dining)/.test(lower)) return 'dining';
  if (/(soccer|football|tennis|rugby|cricket|sports?)/.test(lower)) return 'sports';
  if (/(trip|travel|flight|road trip|vacation|holiday)/.test(lower)) return 'travel';
  if (/(party|birthday|celebration|hangout|club)/.test(lower)) return 'party';
  return 'other';
}

function defaultGearForType(eventType: EventType): string[] {
  switch (eventType) {
    case 'braai':
      return ['charcoal', 'cooler box', 'tongs'];
    case 'hike':
      return ['water bottles', 'hiking shoes', 'sunblock'];
    case 'beach':
      return ['towels', 'sunblock', 'beach umbrella'];
    case 'dining':
      return ['reservation details'];
    case 'sports':
      return ['sports kit', 'water bottles'];
    case 'travel':
      return ['tickets', 'ID documents', 'luggage'];
    case 'party':
      return ['snacks', 'music speaker', 'decorations'];
    default:
      return ['water', 'phone chargers'];
  }
}

function sanitizePlan(input: Partial<PlanResponse>): PlanResponse {
  const eventType = EVENT_TYPES.includes(input.eventType as EventType)
    ? (input.eventType as EventType)
    : 'other';

  const title = typeof input.title === 'string' && input.title.trim().length > 0
    ? input.title.trim()
    : 'New Outing Plan';

  const location = typeof input.location === 'string' && input.location.trim()
    ? input.location.trim()
    : null;

  const date = typeof input.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.date)
    ? input.date
    : null;

  const requiredGear = Array.isArray(input.requiredGear)
    ? input.requiredGear.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

  return {
    title,
    location,
    date,
    eventType,
    requiredGear: requiredGear.length > 0 ? requiredGear : defaultGearForType(eventType),
  };
}

function buildFallbackPlan(prompt: string): PlanResponse {
  const eventType = detectEventType(prompt);
  const location = extractLocation(prompt);
  const date = extractDate(prompt);
  const words = prompt.trim().split(/\s+/).slice(0, 8).join(' ');
  const title = words.length > 0 ? words : 'New Outing Plan';

  return sanitizePlan({
    title,
    location,
    date,
    eventType,
    requiredGear: defaultGearForType(eventType),
  });
}

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

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(buildFallbackPlan(prompt), {
      status: 200,
      headers: { 'x-ai-fallback': 'not-configured' },
    });
  }
  const genAI = new GoogleGenerativeAI(apiKey);

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

    let parsed: PlanResponse;

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(buildFallbackPlan(prompt), {
        status: 200,
        headers: { 'x-ai-fallback': 'malformed-json' },
      });
    }

    return NextResponse.json(sanitizePlan(parsed));
  } catch (err) {
    console.error('[/api/plan] Gemini error:', err);
    return NextResponse.json(buildFallbackPlan(prompt), {
      status: 200,
      headers: { 'x-ai-fallback': 'service-unavailable' },
    });
  }
}
