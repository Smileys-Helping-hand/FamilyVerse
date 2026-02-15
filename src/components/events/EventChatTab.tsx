'use client';

import { useState, useEffect, useRef } from 'react';
import {
  sendEventMessage,
  getEventMessages,
  deleteEventMessage,
  editEventMessage,
} from '@/app/actions/events-gallery-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  X,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getPusherClient } from '@/lib/pusher/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const pusherClient = getPusherClient();

type EventChatMessage = {
  id: string;
  eventId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  message: string;
  replyToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export default function EventChatTab({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<EventChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [eventId]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`event-${eventId}`);

    channel.bind('chat-message', (data: EventChatMessage) => {
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    });

    channel.bind('chat-message-edited', (data: EventChatMessage) => {
      setMessages((prev) => prev.map((m) => (m.id === data.id ? data : m)));
    });

    channel.bind('chat-message-deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`event-${eventId}`);
    };
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages() {
    const result = await getEventMessages(eventId);
    if (result.success) {
      setMessages(result.messages as EventChatMessage[]);
    }
    setLoading(false);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSend() {
    if (!user || !newMessage.trim()) return;

    await sendEventMessage({
      eventId,
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      senderAvatar: user.photoURL || null,
      message: newMessage.trim(),
      replyToId: null,
      attachments: null,
    });

    setNewMessage('');
  }

  async function handleEdit(messageId: string) {
    if (!user || !editingText.trim()) return;

    await editEventMessage(messageId, editingText.trim(), user.uid, eventId);
    setEditingId(null);
    setEditingText('');
  }

  async function handleDelete(messageId: string) {
    if (!user) return;
    if (confirm('Delete this message?')) {
      await deleteEventMessage(messageId, user.uid, eventId);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Event Discussion
          </CardTitle>
          <p className="text-sm text-gray-600">
            Chat about logistics, updates, and coordination 💬
          </p>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="h-[500px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No messages yet</p>
              <p className="text-sm text-gray-500">
                Start the conversation about this event!
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwn = user && msg.senderId === user.uid;
                const isEditing = editingId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{msg.senderName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEdit(msg.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => handleEdit(msg.id)} size="sm">
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingId(null)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          {msg.updatedAt !== msg.createdAt && (
                            <p className="text-xs opacity-75 mt-1">(edited)</p>
                          )}
                        </div>
                      )}

                      {isOwn && !isEditing && (
                        <div className="flex gap-2 mt-1">
                          <Button
                            onClick={() => {
                              setEditingId(msg.id);
                              setEditingText(msg.message);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(msg.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message... (Enter to send)"
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Use this for quick coordination ("Running 5 mins late!") instead of clogging
            the main family chat
          </p>
        </div>
      </Card>
    </div>
  );
}
