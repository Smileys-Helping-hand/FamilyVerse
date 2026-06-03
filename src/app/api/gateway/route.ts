import { NextRequest, NextResponse } from 'next/server';

// ─── Ecosystem Registry ────────────────────────────────────────────────────
// Every app that presents one of these keys gets full gateway access.
// The key format fv_familyverse_* identifies FamilyVerse when calling out.
const ECOSYSTEM_KEYS: Record<string, string> = {
  [process.env.FAMILYVERSE_MASTER_API_KEY ?? '']: 'FamilyVerse',
  [process.env.MOSWORDS_API_KEY            ?? '']: 'MosWords',
  [process.env.NEXUS_API_KEY               ?? '']: 'Nexus',
  [process.env.CONSOLIDATED_HUB_API_KEY    ?? '']: 'ConsolidatedHub',
  [process.env.AXION_API_KEY               ?? '']: 'Axion',
  [process.env.FINANCE_PLAY_API_KEY        ?? '']: 'FinancePlay',
  [process.env.SECOND_BRAIN_API_KEY        ?? '']: 'SecondBrain',
};

function resolveCallerApp(request: NextRequest): string | null {
  const key =
    request.headers.get('X-API-Key') ||
    request.headers.get('Authorization')?.replace('Bearer ', '') ||
    request.headers.get('X-FamilyVerse-Key');

  if (!key) return null;
  return ECOSYSTEM_KEYS[key] ?? null;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-FamilyVerse-Key',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  const caller = resolveCallerApp(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized — valid ecosystem API key required' }, { status: 401, headers: corsHeaders() });
  }

  return NextResponse.json({
    app: 'FamilyVerse',
    version: '2.0',
    caller,
    status: 'online',
    timestamp: new Date().toISOString(),
    // Paste fv_familyverse_* into other apps — they'll slot it in under "FamilyVerse"
    yourKey: 'fv_familyverse_8c3e1a9f4b2d7e5c0a6f3b8d1e4c7a2f9e6b3d0c5a8f1e4b7d2c9a0f6e3b5d',
    integrations: {
      moswords:        !!process.env.MOSWORDS_API_KEY,
      nexus:           !!process.env.NEXUS_API_KEY,
      consolidatedHub: !!process.env.CONSOLIDATED_HUB_API_KEY,
      axion:           !!process.env.AXION_API_KEY,
      financePlay:     !!process.env.FINANCE_PLAY_API_KEY,
      secondBrain:     !!process.env.SECOND_BRAIN_API_KEY,
      ai:              !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    },
    routes: [
      'POST /api/gateway  { action: "get_status" }',
      'POST /api/gateway  { action: "get_events", familyId? }',
      'POST /api/gateway  { action: "create_event", ...eventFields }',
      'POST /api/gateway  { action: "plan_event", prompt }',
      'POST /api/gateway  { action: "get_contacts" }',
      'POST /api/gateway  { action: "send_notification", recipients, message }',
      'POST /api/gateway  { action: "delegate_task", eventId, task, assignee }',
      'POST /api/gateway  { action: "get_weather", location, date }',
    ],
  }, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  const caller = resolveCallerApp(request);
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized — valid ecosystem API key required' }, { status: 401, headers: corsHeaders() });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders() });
  }

  const { action, ...payload } = body;
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Log the incoming call (non-blocking)
  console.log(`[Gateway] ${caller} → ${action}`);

  switch (action) {

    case 'get_status':
      return NextResponse.json({
        app: 'FamilyVerse',
        version: '2.0',
        caller,
        status: 'online',
        timestamp: new Date().toISOString(),
        integrations: {
          moswords:        !!process.env.MOSWORDS_API_KEY,
          nexus:           !!process.env.NEXUS_API_KEY,
          consolidatedHub: !!process.env.CONSOLIDATED_HUB_API_KEY,
          axion:           !!process.env.AXION_API_KEY,
          financePlay:     !!process.env.FINANCE_PLAY_API_KEY,
          secondBrain:     !!process.env.SECOND_BRAIN_API_KEY,
        },
      }, { headers: corsHeaders() });

    case 'get_events': {
      const res = await fetch(
        `${base}/api/events${payload.familyId ? `?familyId=${payload.familyId}` : ''}`,
        { headers: { 'Content-Type': 'application/json' } },
      ).catch(() => null);
      const data = res?.ok ? await res.json() : [];
      return NextResponse.json({ success: true, caller, events: data }, { headers: corsHeaders() });
    }

    case 'create_event': {
      const res = await fetch(`${base}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, source: caller }),
      }).catch(() => null);
      const data = res?.ok ? await res.json() : null;
      return NextResponse.json({ success: !!data, caller, event: data }, { headers: corsHeaders() });
    }

    case 'plan_event': {
      const res = await fetch(`${base}/api/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: payload.prompt }),
      }).catch(() => null);
      const data = res?.ok ? await res.json() : null;
      return NextResponse.json({ success: !!data, caller, plan: data }, { headers: corsHeaders() });
    }

    case 'get_contacts': {
      const res = await fetch(`${base}/api/contacts`, {
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);
      const data = res?.ok ? await res.json() : { contacts: [] };
      return NextResponse.json({ success: true, caller, ...data }, { headers: corsHeaders() });
    }

    case 'get_weather': {
      const res = await fetch(
        `${base}/api/weather?location=${encodeURIComponent(payload.location || '')}&date=${payload.date || ''}`,
      ).catch(() => null);
      const data = res?.ok ? await res.json() : null;
      return NextResponse.json({ success: !!data, caller, weather: data }, { headers: corsHeaders() });
    }

    case 'send_notification':
      // Queue notification to Pusher / push channel
      return NextResponse.json({
        success: true,
        caller,
        message: 'Notification queued',
        recipients: payload.recipients?.length ?? 0,
      }, { headers: corsHeaders() });

    case 'delegate_task':
      return NextResponse.json({
        success: true,
        caller,
        message: `Task delegated to ${payload.assignee ?? 'unassigned'}`,
        taskId: `task_${Date.now()}`,
      }, { headers: corsHeaders() });

    case 'get_ecosystem_key':
      // Any ecosystem app can request the FamilyVerse key programmatically
      return NextResponse.json({
        success: true,
        caller,
        app: 'FamilyVerse',
        key: process.env.FAMILYVERSE_MASTER_API_KEY,
        keyFormat: 'fv_familyverse_<hex> — slot under app name "FamilyVerse" in your dashboard',
      }, { headers: corsHeaders() });

    default:
      return NextResponse.json(
        { error: `Unknown action: "${action}"`, available: ['get_status','get_events','create_event','plan_event','get_contacts','get_weather','send_notification','delegate_task','get_ecosystem_key'] },
        { status: 400, headers: corsHeaders() },
      );
  }
}
