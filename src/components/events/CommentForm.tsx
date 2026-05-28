'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Loader } from 'lucide-react';

interface CommentFormProps {
  eventId: string;
  onCommentSubmitted?: () => void;
  isAuthenticated?: boolean;
}

export function CommentForm({
  eventId,
  onCommentSubmitted,
  isAuthenticated = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          isAnonymous: isAnonymous || !isAuthenticated,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      setContent('');
      setIsAnonymous(false);
      onCommentSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Add a comment
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isAuthenticated
              ? 'Share your thoughts about this event...'
              : 'Post as anonymous to comment'
          }
          disabled={isLoading}
          className="min-h-24 resize-none"
        />
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            disabled={!isAuthenticated || isLoading}
          />
          <label
            htmlFor="anonymous"
            className="text-sm text-gray-600 cursor-pointer"
          >
            Post anonymously
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !content.trim()}
          size="sm"
          className="gap-2"
        >
          {isLoading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          Post Comment
        </Button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      {!isAuthenticated && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          💡 You can comment anonymously. Register to like and reply to comments.
        </div>
      )}
    </form>
  );
}
