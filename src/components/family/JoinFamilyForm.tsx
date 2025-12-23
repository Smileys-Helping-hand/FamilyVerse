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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { joinFamily } from '@/lib/firebase/firestore';

const formSchema = z.object({
  joinCode: z.string().length(6, { message: 'Join code must be 6 characters.' }),
});

export function JoinFamilyForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      joinCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userProfile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to join a family.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const { familyName } = await joinFamily(values.joinCode, userProfile);
      toast({
        title: 'Welcome to the family!',
        description: `You have successfully joined the "${familyName}" family.`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to join family',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="joinCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>6-Character Join Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="ABC123" 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Join Family
        </Button>
      </form>
    </Form>
  );
}
