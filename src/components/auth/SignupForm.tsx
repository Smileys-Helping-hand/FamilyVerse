'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, User, Mail, Lock, Sparkles, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
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
        title: 'Configuration Error',
        description: 'Firebase is not properly initialized. Please refresh the page.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      // Create user profile in PostgreSQL
      await getOrCreateUserAction(user.uid, user.email || '', values.name);

      toast({
        title: 'Account created!',
        description: 'Welcome to FamilyVerse. Let\'s set up your family.',
      });

      router.push('/welcome');
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during signup.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign-up is not enabled. Please contact support.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase project is not properly configured. Please check your Firebase Console and ensure the project exists.';
      } else if (error.code === 'auth/api-key-not-valid') {
        errorMessage = 'Invalid Firebase API key. Please verify your Firebase configuration.';
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
    <Card className={cn(
      "border-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700",
      "bg-gradient-to-br from-card via-card to-secondary/5"
    )}>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-accent">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          Create Account
        </CardTitle>
        <CardDescription className="text-base">
          Join FamilyVerse and start building your family tree
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="John Doe" 
                        className={cn(
                          "pl-10 h-11 border-2 transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20"
                        )}
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="name@example.com" 
                        className={cn(
                          "pl-10 h-11 border-2 transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20"
                        )}
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className={cn(
                          "pl-10 h-11 border-2 transition-all duration-300",
                          "focus:border-primary focus:ring-2 focus:ring-primary/20"
                        )}
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className={cn(
                "w-full h-11 text-base font-semibold",
                "bg-gradient-to-r from-secondary to-accent",
                "hover:shadow-xl transition-all duration-300 hover:scale-105",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Sign Up
                </>
              )}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Already a member?
                </span>
              </div>
            </div>
            <div className="text-center">
              <Link href="/login" className="group inline-flex items-center gap-2">
                <span className="text-base font-medium text-primary group-hover:underline">
                  Sign in to your account
                </span>
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
