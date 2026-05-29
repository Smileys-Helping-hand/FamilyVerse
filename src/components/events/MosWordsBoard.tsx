'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { fetchLiveMosWords, slangDictionary, MosWordMessage } from '@/lib/moswords';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function MosWordsBoard() {
  const [messages, setMessages] = useState<MosWordMessage[]>([]);

  useEffect(() => {
    fetchLiveMosWords().then(setMessages);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold">MosWords Live Board</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-orange-400">Slang Dictionary</h3>
            <ul className="space-y-2">
              {Object.entries(slangDictionary).map(([word, meaning]) => (
                <li key={word} className="text-sm">
                  <span className="font-bold text-rose-400">{word}</span>: <span className="text-slate-300">{meaning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-orange-500/10 via-rose-500/5 to-transparent border-none">
                <CardContent className="p-4 flex gap-3">
                  <div className="text-2xl">{msg.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm text-orange-300">{msg.sender}</p>
                    <p className="text-slate-200 mt-1">{msg.text}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
