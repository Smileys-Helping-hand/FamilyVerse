import { linkClaudeAuth } from '@/lib/db/claude-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-auth-uid')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { claudeAuthId, firebaseUid } = body;

    if (!claudeAuthId) {
      return NextResponse.json(
        { error: 'claudeAuthId is required' },
        { status: 400 }
      );
    }

    const result = await linkClaudeAuth(userId, claudeAuthId, firebaseUid);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error linking Claude auth:', error);
    return NextResponse.json(
      { error: 'Failed to link Claude auth' },
      { status: 500 }
    );
  }
}
