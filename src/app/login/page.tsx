import { LoginForm } from '@/components/auth/LoginForm';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Leaf className="h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Welcome back to FamilyVerse
          </h1>
          <p className="mt-2 text-center text-muted-foreground">
            Sign in to continue to your family tree.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
