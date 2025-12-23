import { CreateFamilyForm } from '@/components/family/CreateFamilyForm';
import { JoinFamilyForm } from '@/components/family/JoinFamilyForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Tabs defaultValue="create" className="w-full max-w-lg">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">
            <Users className="mr-2 h-4 w-4" />
            Create Family
          </TabsTrigger>
          <TabsTrigger value="join">
            <UserPlus className="mr-2 h-4 w-4" />
            Join Family
          </TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Family</CardTitle>
              <CardDescription>
                Start your family tree by creating a new family space.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateFamilyForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>Join an Existing Family</CardTitle>
              <CardDescription>
                Enter a join code to connect with your family's tree.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JoinFamilyForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
