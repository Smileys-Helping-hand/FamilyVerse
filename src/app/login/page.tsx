import { LoginForm } from '@/components/auth/LoginForm';
import { Leaf, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Leaf className="h-16 w-16 text-primary drop-shadow-2xl animate-bounce-slow" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent animate-pulse" />
            <Heart className="absolute -bottom-1 -left-1 h-5 w-5 text-secondary fill-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <h1 className={cn(
            "mt-6 text-4xl font-bold tracking-tight text-center",
            "bg-gradient-to-r from-primary via-secondary to-accent",
            "bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
          )}>
            Welcome back!
          </h1>
          <p className="mt-3 text-center text-lg text-muted-foreground">
            Sign in to continue to your <span className="font-semibold text-primary">FamilyVerse</span>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
