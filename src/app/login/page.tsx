import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full" />

      <div className="w-full max-w-sm relative z-10 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl text-3xl">
            🏡
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-gradient">FamilyVerse</h1>
            <p className="text-sm text-foreground/50 mt-0.5">Welcome back 👋</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
