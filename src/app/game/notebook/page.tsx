'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getDetectiveNotebook, updateDetectiveNotes } from '@/app/actions/scannables';
import { FileText, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function DetectiveNotebook() {
  const router = useRouter();
  const [notebook, setNotebook] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');

  // Mock user/session (replace with real auth)
  const userId = 'player-1'; // TODO: Get from auth context
  const sessionId = 'session-1'; // TODO: Get from URL or context

  useEffect(() => {
    loadNotebook();
  }, []);

  const loadNotebook = async () => {
    setLoading(true);
    const result = await getDetectiveNotebook(userId, sessionId);
    if (result.success) {
      setNotebook(result.notebook);
    }
    setLoading(false);
  };

  const handleSaveNotes = async (notebookId: number) => {
    await updateDetectiveNotes(notebookId, editNotes);
    setEditingId(null);
    setEditNotes('');
    await loadNotebook();
  };

  const startEditing = (id: number, currentNotes: string) => {
    setEditingId(id);
    setEditNotes(currentNotes || '');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading notebook...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold">Detective Notebook</h1>
          </div>
          <p className="text-muted-foreground">
            Collect and analyze evidence to solve the mystery
          </p>
        </motion.div>

        {notebook.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Evidence Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Scan killer evidence QR codes to add clues to your notebook
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notebook.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-red-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{entry.evidence.label}</CardTitle>
                        <CardDescription>
                          Collected: {new Date(entry.collectedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant="destructive">Evidence</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Evidence Content */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-900 mb-1">
                        🔍 Evidence Details:
                      </p>
                      <p className="text-sm text-red-800 whitespace-pre-wrap">
                        {entry.evidence.content || <em>No details available</em>}
                      </p>
                    </div>

                    {/* Detective Notes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">📝 Your Detective Notes:</p>
                        {editingId !== entry.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(entry.id, entry.notes)}
                          >
                            Edit Notes
                          </Button>
                        )}
                      </div>
                      {editingId === entry.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add your observations and theories..."
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNotes(entry.id)}
                            >
                              <Save className="mr-2 h-4 w-4" />
                              Save Notes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null);
                                setEditNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {entry.notes || <em>No notes yet - click &quot;Edit Notes&quot; to add your thoughts</em>}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
