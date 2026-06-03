'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { getOrCreateUserAction } from '@/app/actions/users';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function SignupForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) {
      toast({ variant: 'destructive', title: 'Configuration error', description: 'Firebase not initialized.' });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await getOrCreateUserAction(userCredential.user.uid, userCredential.user.email || '', values.name);
      toast({ title: '🎉 Welcome to FamilyVerse!', description: 'Now create or join a family to start planning.' });
      router.push('/welcome');
    } catch (error: any) {
      let msg = 'An error occurred during signup.';
      if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered. Please sign in.';
      else if (error.code === 'auth/invalid-email') msg = 'Invalid email address format.';
      else if (error.code === 'auth/weak-password') msg = 'Password is too weak. Use at least 6 characters.';
      else if (error.message) msg = error.message;
      toast({ variant: 'destructive', title: 'Signup failed', description: msg });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-card shadow-xl overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-secondary" />
      <div className="p-6 sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">Create your account</h2>
          <p className="text-sm text-foreground/50 mt-1">Free to start. Plan your first event in minutes.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/35" />
                      <Input placeholder="Your name" className="pl-10 h-11" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
              ) : (
                <>Get Started <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            <div className="pt-2 border-t border-border text-center">
              <Link href="/login" className="text-sm text-foreground/50 hover:text-primary transition-colors">
                Already have an account? Sign in →
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
