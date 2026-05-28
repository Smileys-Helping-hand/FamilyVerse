import { syncDeviceAuth } from '@/lib/db/claude-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'sessionToken is required' },
        { status: 400 }
      );
    }

    const result = await syncDeviceAuth(sessionToken);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error syncing device auth:', error);
    return NextResponse.json(
      { error: 'Failed to sync device auth' },
      { status: 500 }
    );
  }
}
