import { LoginForm } from '@/components/auth/LoginForm';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 60% 20%, #3b1060 0%, #1a0b2e 45%, #0d0520 100%)' }}
    >
      {/* Subtle ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[10%] w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & heading */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)' }}>
              <span className="text-3xl">🌿</span>
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-center text-white mb-2"
            style={{ textShadow: '0 0 40px rgba(249,115,22,0.4)' }}>
            Welcome back!
          </h1>
          <p className="text-center text-sm text-purple-300/80">
            Sign in to continue to your{' '}
            <span className="font-semibold" style={{ background: 'linear-gradient(90deg,#f97316,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FamilyVerse</span>
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
