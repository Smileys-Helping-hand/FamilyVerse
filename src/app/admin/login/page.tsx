'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const defaultEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'mraaziqp@gmail.com';
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', { redirect: false, email, password });
      setLoading(false);

      if ((res as any)?.ok) {
        // Successful sign-in
        router.push('/admin');
      } else {
        setError((res as any)?.error || 'Sign in failed — check your password');
      }
    } catch (err) {
      setLoading(false);
      setError('Unexpected error during sign-in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
            <h1 className="text-white font-bold text-lg">FamilyVerse — Mission Control</h1>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>

                  {error && <div className="text-sm text-red-400">{error}</div>}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In to Mission Control'}
                  </Button>
                </form>
              </CardContent>
            </div>

            <div className="p-6 bg-slate-900 text-slate-300">
              <h3 className="text-lg font-semibold text-white mb-2">Quick Hints</h3>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Only the admin account can access Mission Control — default: <strong>{defaultEmail}</strong></li>
                <li>Set <code>ADMIN_PASSWORD</code> in your environment to a strong, private value.</li>
                <li>Ensure <code>NEXTAUTH_SECRET</code> is configured for session security.</li>
                <li>If you need SSO or Firebase-based admin auth, I can integrate that.</li>
              </ul>

              <div className="text-xs text-slate-400">
                Need help? Contact the development team or run the migration and restart the server.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
