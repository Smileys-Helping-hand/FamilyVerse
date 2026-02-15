'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getEventMedia,
  uploadEventMedia,
  likeMedia,
  deleteMedia,
  updateMediaCaption,
} from '@/app/actions/events-gallery-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Image as ImageIcon,
  Video,
  Heart,
  Upload,
  Trash2,
  Edit2,
  Download,
  X,
  Camera,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getPusherClient } from '@/lib/pusher/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const pusherClient = getPusherClient();

type EventMedia = {
  id: string;
  eventId: string;
  uploaderId: string;
  uploaderName: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  caption: string | null;
  thumbnailUrl: string | null;
  likes: number;
  likedBy: string[];
  createdAt: Date;
};

export default function GalleryTab({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [media, setMedia] = useState<EventMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<EventMedia | null>(null);
  const [editingCaption, setEditingCaption] = useState<string>('');

  useEffect(() => {
    loadMedia();
  }, [eventId]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`event-${eventId}`);

    channel.bind('media-uploaded', (data: { media: EventMedia; uploaderName: string }) => {
      setMedia((prev) => [data.media, ...prev]);
      toast({
        title: '📸 New Photo',
        description: `${data.uploaderName} uploaded a photo`,
      });
    });

    channel.bind('media-liked', (data: EventMedia) => {
      setMedia((prev) => prev.map((m) => (m.id === data.id ? data : m)));
    });

    channel.bind('media-deleted', ({ mediaId }: { mediaId: string }) => {
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`event-${eventId}`);
    };
  }, [eventId]);

  async function loadMedia() {
    const result = await getEventMedia(eventId);
    if (result.success) {
      setMedia(result.media as EventMedia[]);
    }
    setLoading(false);
  }

  async function handleLike(mediaId: string) {
    if (!user) return;
    await likeMedia(mediaId, user.uid, eventId);
  }

  async function handleDelete(mediaId: string) {
    if (!user) return;
    if (confirm('Delete this photo?')) {
      await deleteMedia(mediaId, user.uid, eventId);
    }
  }

  async function handleUpdateCaption(mediaId: string) {
    if (!user) return;
    await updateMediaCaption(mediaId, editingCaption, user.uid, eventId);
    setSelectedMedia(null);
    setEditingCaption('');
    loadMedia();
  }

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || !user) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast({
          title: 'Invalid file',
          description: 'Please upload images or videos only',
          variant: 'destructive',
        });
        continue;
      }

      try {
        // Convert to base64 for demo (in production, use proper file upload service)
        const reader = new FileReader();
        reader.onload = async (e) => {
          const url = e.target?.result as string;

          await uploadEventMedia({
            eventId,
            uploaderId: user.uid,
            uploaderName: user.displayName || 'Anonymous',
            url,
            type: isImage ? 'IMAGE' : 'VIDEO',
            caption: null,
            thumbnailUrl: null,
            mimeType: file.type,
            fileSize: file.size,
            likes: 0,
            likedBy: [],
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload failed',
          description: 'Failed to upload file',
          variant: 'destructive',
        });
      }
    }

    setUploading(false);
  }, [user, eventId]);

  const handleDownloadAll = () => {
    toast({
      title: 'Download Started',
      description: 'Preparing zip file... (Feature coming soon)',
    });
    // TODO: Implement zip download
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-600" />
            Memory Bank
          </h3>
          <p className="text-sm text-gray-600">
            Shared photos & videos from the event 📸
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadAll} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
          <label htmlFor="file-upload">
            <Button asChild size="sm" disabled={uploading}>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Upload Drop Zone */}
      <Card
        className="border-dashed border-2 border-pink-300 bg-pink-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
      >
        <CardContent className="py-12 text-center">
          <Upload className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag & drop photos here</p>
          <p className="text-sm text-gray-500">or click Upload button above</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-pink-600">
                {media.filter((m) => m.type === 'IMAGE').length}
              </div>
              <div className="text-sm text-gray-600">Photos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {media.filter((m) => m.type === 'VIDEO').length}
              </div>
              <div className="text-sm text-gray-600">Videos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {media.reduce((sum, m) => sum + m.likes, 0)}
              </div>
              <div className="text-sm text-gray-600">Hearts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Masonry Grid */}
      {media.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No photos yet</p>
            <p className="text-sm text-gray-500">
              Be the first to share memories from this event!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <Card className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden">
                  <div className="relative aspect-square">
                    {item.type === 'IMAGE' ? (
                      <img
                        src={item.url}
                        alt={item.caption || 'Event photo'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
                      <div className="flex items-center gap-1 text-white text-sm">
                        <Heart className="w-4 h-4" />
                        {item.likes}
                      </div>
                    </div>
                  </div>
                  {item.caption && (
                    <CardContent className="py-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{item.caption}</p>
                    </CardContent>
                  )}
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Photo by {item.uploaderName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {item.type === 'IMAGE' ? (
                    <img
                      src={item.url}
                      alt={item.caption || 'Event photo'}
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <video src={item.url} controls className="w-full rounded-lg" />
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => handleLike(item.id)}
                      variant="outline"
                      className={
                        user && item.likedBy.includes(user.uid)
                          ? 'text-red-600 border-red-600'
                          : ''
                      }
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${
                          user && item.likedBy.includes(user.uid) ? 'fill-red-600' : ''
                        }`}
                      />
                      {item.likes} Hearts
                    </Button>

                    <div className="flex gap-2">
                      {user && item.uploaderId === user.uid && (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedMedia(item);
                              setEditingCaption(item.caption || '');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Caption
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Caption Editor */}
                  {selectedMedia?.id === item.id && (
                    <div className="space-y-2">
                      <Input
                        value={editingCaption}
                        onChange={(e) => setEditingCaption(e.target.value)}
                        placeholder="Add a caption..."
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateCaption(item.id)} size="sm">
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedMedia(null);
                            setEditingCaption('');
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {item.caption && !selectedMedia && (
                    <p className="text-gray-700">{item.caption}</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
