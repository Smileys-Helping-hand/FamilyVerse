import { LoginForm } from '@/components/auth/LoginForm';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,255,102,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,102,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FF66]/4 blur-[80px] rounded-full" />

      <div className="w-full max-w-sm relative z-10 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00FF66] flex items-center justify-center shadow-[0_0_24px_rgba(0,255,102,0.5)]">
            <Zap className="h-6 w-6 text-zinc-950" fill="currentColor" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Gang Gear</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Sign into your squad</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
