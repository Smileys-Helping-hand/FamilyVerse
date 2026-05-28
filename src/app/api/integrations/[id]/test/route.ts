import { getAppIntegration, testAppIntegration } from '@/lib/db/app-integrations';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-auth-uid')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const integration = await getAppIntegration(id);
    if (!integration.integration || integration.integration.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const result = await testAppIntegration(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing integration:', error);
    return NextResponse.json({ error: 'Failed to test integration' }, { status: 500 });
  }
}
