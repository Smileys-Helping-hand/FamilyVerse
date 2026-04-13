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
    defaultValues: {
      name: '',
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
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await getOrCreateUserAction(user.uid, user.email || '', values.name);

      toast({
        title: 'Account created',
        description: 'Now create or join a squad to start planning outings.',
      });

      router.push('/welcome');
    } catch (error: any) {
      let errorMessage = 'An error occurred during signup.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: 'destructive',
        title: 'Signup failed',
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
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Create account</h2>
          <p className="text-sm text-zinc-500 mt-1">Set up your profile and get into event planning mode.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-zinc-300">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        placeholder="Your name"
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
                  Creating account...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="pt-2 border-t border-zinc-800 text-center">
              <Link href="/login" className="text-sm text-zinc-400 hover:text-[#00FF66] transition-colors">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
