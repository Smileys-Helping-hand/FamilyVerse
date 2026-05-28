'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Trash2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EventComment } from '@/lib/db/schema';

interface EventCommentCardProps {
  comment: EventComment;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onApprove?: (commentId: string) => void;
  isCreator?: boolean;
  userLiked?: boolean;
  currentUserId?: string;
}

export function EventCommentCard({
  comment,
  onLike,
  onReply,
  onDelete,
  onApprove,
  isCreator,
  userLiked,
  currentUserId,
}: EventCommentCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!onLike) return;
    setIsLoading(true);
    await onLike(comment.id);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!onDelete || !confirm('Delete this comment?')) return;
    setIsLoading(true);
    await onDelete(comment.id);
    setIsLoading(false);
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsLoading(true);
    await onApprove(comment.id);
    setIsLoading(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-gray-900">{comment.userName}</p>
            {comment.isAnonymous && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                Anonymous
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </p>
        </div>

        {!comment.isApproved && isCreator && (
          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
            Pending approval
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700">{comment.content}</p>

      <div className="flex items-center gap-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLoading}
          className="h-8 px-2 text-gray-600 hover:text-red-500"
        >
          <Heart
            size={16}
            className={userLiked ? 'fill-current text-red-500' : ''}
          />
          <span className="text-xs ml-1">{comment.likesCount}</span>
        </Button>

        {onReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id)}
            disabled={isLoading}
            className="h-8 px-2 text-gray-600 hover:text-blue-500"
          >
            <MessageSquare size={16} />
            <span className="text-xs ml-1">Reply</span>
          </Button>
        )}

        {isCreator && !comment.isApproved && onApprove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleApprove}
            disabled={isLoading}
            className="h-8 px-2 text-gray-600 hover:text-green-500"
          >
            <Check size={16} />
            <span className="text-xs ml-1">Approve</span>
          </Button>
        )}

        {(isCreator || currentUserId === comment.userId) && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="h-8 px-2 text-gray-600 hover:text-red-500 ml-auto"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
