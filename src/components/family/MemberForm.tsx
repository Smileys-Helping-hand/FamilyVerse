'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, CalendarIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase/config';
import { addDoc, collection, serverTimestamp, query, getDocs, writeBatch, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MultiSelect, Option } from '@/components/ui/multi-select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  gender: z.enum(['male', 'female', 'other']),
  birthDate: z.date().optional(),
  photo: z.any().optional(),
  parents: z.array(z.string()).optional(),
  spouses: z.array(z.string()).optional(),
  children: z.array(z.string()).optional(),
});

interface MemberFormProps {
  setDialogOpen: (open: boolean) => void;
}

export function MemberForm({ setDialogOpen }: MemberFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile, family } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<Option[]>([]);

  useEffect(() => {
    if (!family?.id) return;
    const fetchMembers = async () => {
      const membersQuery = query(collection(db, `families/${family.id}/members`));
      const querySnapshot = await getDocs(membersQuery);
      const members = querySnapshot.docs.map(doc => ({
        label: doc.data().name,
        value: doc.id
      }));
      setFamilyMembers(members);
    };
    fetchMembers();
  }, [family?.id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      parents: [],
      spouses: [],
      children: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userProfile || !family) return;
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      let photoUrl: string | null = null;
      const newMemberId = doc(collection(db, "tmp")).id;

      if (values.photo && values.photo.length > 0) {
        const file = values.photo[0];
        const storageRef = ref(storage, `families/${family.id}/${newMemberId}_profile`);
        const snapshot = await uploadBytes(storageRef, file);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      const newMemberRef = doc(db, `families/${family.id}/members`, newMemberId);
      batch.set(newMemberRef, {
        name: values.name,
        gender: values.gender,
        birthDate: values.birthDate || null,
        photoUrl,
        parents: values.parents || [],
        spouses: values.spouses || [],
        children: values.children || [],
        addedBy: userProfile.uid,
        createdAt: serverTimestamp(),
      });
      
      const activityLogRef = doc(collection(db, `families/${family.id}/activityLog`));
      batch.set(activityLogRef, {
        user: userProfile.name || userProfile.email,
        action: 'added_member',
        details: `Added "${values.name}" to the family.`,
        timestamp: serverTimestamp(),
      });
      
      await batch.commit();

      toast({
        title: 'Member Added',
        description: `${values.name} has been added to the family tree.`,
      });
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error adding member',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="photo" render={({ field }) => ( <FormItem><FormLabel>Profile Photo</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="birthDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of birth</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="parents" render={({ field }) => (<FormItem><FormLabel>Parents</FormLabel><FormControl><MultiSelect options={familyMembers} selected={field.value || []} onChange={field.onChange} placeholder="Select parents..." /></FormControl><FormDescription>Link to this member's parents.</FormDescription><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="spouses" render={({ field }) => (<FormItem><FormLabel>Spouse(s)</FormLabel><FormControl><MultiSelect options={familyMembers} selected={field.value || []} onChange={field.onChange} placeholder="Select spouses..." /></FormControl><FormDescription>Link to this member's spouse(s).</FormDescription><FormMessage /></FormItem>)} />
        
        <div className="flex justify-end pt-4 space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Member
            </Button>
        </div>
      </form>
    </Form>
  );
}
