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
import { createFamilyAction } from '@/app/actions/users';

const formSchema = z.object({
  familyName: z.string().min(2, { message: 'Family name must be at least 2 characters.' }),
});

export function CreateFamilyForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuth();

  console.log('CreateFamilyForm render - userProfile:', userProfile);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      familyName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userProfile) {
      console.error('CreateFamilyForm: userProfile is null');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a family.',
      });
      return;
    }

    if (!userProfile.uid) {
      console.error('CreateFamilyForm: userProfile.uid is missing', userProfile);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User ID is missing. Please try logging out and back in.',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating family with userProfile:', userProfile);
      await createFamilyAction(values.familyName, userProfile.uid, userProfile.name || 'User');
      toast({
        title: 'Family Created!',
        description: `The "${values.familyName}" family is ready.`,
      });
      // Reload the page to refresh the auth context
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('CreateFamily error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create family',
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
          name="familyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., The Smith Family" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Family
        </Button>
      </form>
    </Form>
  );
}
