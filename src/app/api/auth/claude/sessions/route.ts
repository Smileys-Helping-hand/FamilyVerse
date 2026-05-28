import { getActiveSessions, deactivateClaudeAuthSession, logoutAllDevices } from '@/lib/db/claude-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-auth-uid')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await getActiveSessions(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-auth-uid')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, sessionId } = body;

    if (action === 'logout-all') {
      const result = await logoutAllDevices(userId);
      return NextResponse.json(result);
    } else if (action === 'logout-device' && sessionId) {
      const result = await deactivateClaudeAuthSession(sessionId);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error managing sessions:', error);
    return NextResponse.json(
      { error: 'Failed to manage sessions' },
      { status: 500 }
    );
  }
}
