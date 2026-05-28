import { getAppIntegrations, createAppIntegration } from '@/lib/db/app-integrations';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-auth-uid')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await getAppIntegrations(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
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
    const { appId, appName, credentials, metadata } = body;

    if (!appId || !appName || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: appId, appName, credentials' },
        { status: 400 }
      );
    }

    const result = await createAppIntegration(userId, appId, appName, credentials, metadata);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
  }
}
