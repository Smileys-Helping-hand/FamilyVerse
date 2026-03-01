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
import { Loader2, Mail, Lock, Sparkles, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        title: 'Configuration Error',
        description: 'Firebase is not properly initialized. Please refresh the page.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase project is not properly configured. Please check your Firebase Console.';
      } else if (error.code === 'auth/api-key-not-valid') {
        errorMessage = 'Invalid Firebase API key. Please verify your Firebase configuration.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden"
      style={{
        background: 'rgba(20, 8, 50, 0.75)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      {/* Top gradient accent bar */}
      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #f97316 0%, #ec4899 50%, #a855f7 100%)' }} />

      <div className="p-8 pt-7">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}
            >
              <Lock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
          </div>
          <p className="text-sm text-purple-300/60 ml-12">Enter your credentials to access your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-purple-200/80 tracking-wide">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/70" />
                      <Input
                        placeholder="name@example.com"
                        className={cn(
                          'pl-10 h-12 text-white text-sm placeholder:text-purple-400/40',
                          'transition-all duration-200',
                          'border border-purple-600/30 hover:border-purple-500/50',
                          'focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20 focus-visible:ring-purple-500/20',
                          'rounded-xl'
                        )}
                        style={{ background: 'rgba(88, 28, 135, 0.2)' }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-pink-400 text-xs" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-purple-200/80 tracking-wide">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400/70" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={cn(
                          'pl-10 pr-10 h-12 text-white text-sm placeholder:text-purple-400/40',
                          'transition-all duration-200',
                          'border border-purple-600/30 hover:border-purple-500/50',
                          'focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20 focus-visible:ring-purple-500/20',
                          'rounded-xl'
                        )}
                        style={{ background: 'rgba(88, 28, 135, 0.2)' }}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400/70 hover:text-purple-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-pink-400 text-xs" />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              className={cn(
                'w-full h-12 text-sm font-bold text-white mt-1 rounded-xl',
                'transition-all duration-300 hover:scale-[1.02]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'border-0 shadow-lg'
              )}
              style={{
                background: 'linear-gradient(90deg, #f97316 0%, #ec4899 55%, #a855f7 100%)',
                boxShadow: '0 4px 24px rgba(249,115,22,0.25)',
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Sign In</>
              )}
            </Button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-700/30" />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-4 text-[11px] uppercase tracking-widest font-medium text-purple-400/50"
                  style={{ background: 'rgba(20, 8, 50, 0.75)' }}
                >
                  New to FamilyVerse?
                </span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center pb-1">
              <Link href="/signup" className="group inline-flex items-center gap-2">
                <span
                  className="text-sm font-semibold group-hover:opacity-80 transition-opacity"
                  style={{ background: 'linear-gradient(90deg, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  Create an account
                </span>
                <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
              </Link>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
