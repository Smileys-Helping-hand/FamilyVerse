'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Configuration error',
        description: 'Firebase is not initialized. Refresh and try again.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Signed in',
        description: 'Welcome back. Ready to plan the next outing?',
      });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'An error occurred during sign in.';

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-sm shadow-xl overflow-hidden">
      <div className="h-[3px] w-full bg-gradient-to-r from-[#00FF66] via-[#00FF66]/40 to-transparent" />

      <div className="p-6 sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Event Command Login</h2>
          <p className="text-sm text-zinc-500 mt-1">Sign in to open your Omnibar and launch the next move.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-zinc-300">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        placeholder="name@example.com"
                        className="pl-10 h-11 border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:border-[#00FF66]/60 focus:ring-[#00FF66]/20"
                        {...field}
                      />
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
                  <FormLabel className="text-sm font-medium text-zinc-300">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="........"
                        className="pl-10 pr-10 h-11 border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:border-[#00FF66]/60 focus:ring-[#00FF66]/20"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
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
              className="w-full h-11 text-sm font-semibold bg-[#00FF66] text-zinc-950 hover:bg-[#00FF66]/90 shadow-[0_0_18px_rgba(0,255,102,0.35)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Open Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="pt-2 border-t border-zinc-800 text-center">
              <Link href="/signup" className="text-sm text-zinc-400 hover:text-[#00FF66] transition-colors">
                New here? Create your Gang Gear account
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
