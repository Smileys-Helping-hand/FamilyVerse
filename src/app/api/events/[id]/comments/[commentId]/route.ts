import { deleteComment, approveComment } from '@/lib/db/event-comments';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
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

    // TODO: Verify user is event creator or comment author
    const result = await deleteComment(commentId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
