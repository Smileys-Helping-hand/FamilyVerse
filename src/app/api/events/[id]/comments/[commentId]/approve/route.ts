import { approveComment } from '@/lib/db/event-comments';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('firebase-auth-uid')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Verify user is event creator
    const result = await approveComment(commentId, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error approving comment:', error);
    return NextResponse.json({ error: 'Failed to approve comment' }, { status: 500 });
  }
}
