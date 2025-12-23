import { SignupForm } from '@/components/auth/SignupForm';
import { Leaf } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Leaf className="h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Create an account
          </h1>
          <p className="mt-2 text-center text-muted-foreground">
            Join FamilyVerse and start building your family tree today.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
