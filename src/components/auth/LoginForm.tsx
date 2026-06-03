'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function LoginForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Configuration error', description: 'Firebase not initialized.' });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: '👋 Welcome back!', description: 'Ready to plan something amazing?' });
      router.push('/dashboard');
    } catch (error: any) {
      let msg = 'An error occurred during sign in.';
      if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(error.code)) msg = 'Invalid email or password.';
      else if (error.code === 'auth/user-disabled') msg = 'This account has been disabled.';
      else if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
      else if (error.message) msg = error.message;
      toast({ variant: 'destructive', title: 'Sign in failed', description: msg });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-card shadow-xl overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
      <div className="p-6 sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">Sign In</h2>
          <p className="text-sm text-foreground/50 mt-1">Plan your next family event in minutes.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/35" />
                      <Input placeholder="name@example.com" className="pl-10 h-11" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/35" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-11"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/35 hover:text-foreground/60 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-md glow-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            <div className="pt-2 border-t border-border text-center">
              <Link href="/signup" className="text-sm text-foreground/50 hover:text-primary transition-colors">
                New here? Create a FamilyVerse account →
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
