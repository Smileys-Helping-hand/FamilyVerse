"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChildProfileCard } from "@/components/parental-controls/ChildProfileCard";
import { AddChildDialog } from "@/components/parental-controls/AddChildDialog";
import { ContentPolicyForm } from "@/components/parental-controls/ContentPolicyForm";
import { ScreenTimeManager } from "@/components/parental-controls/ScreenTimeManager";
import { ActivityReportView } from "@/components/parental-controls/ActivityReportView";
import { Shield, UserPlus, Settings, BarChart3, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChildProfile, ContentPolicy, ScreenTimeRules, ActivityReport } from "@/types";

export default function ParentalControlsPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for demonstration
  const mockScreenTime: Record<string, number> = {};
  const mockReports: Record<string, ActivityReport> = {};

  const handleAddChild = (childData: Omit<ChildProfile, "id" | "createdAt">) => {
    const newChild: ChildProfile = {
      ...childData,
      id: Math.random().toString(36).substring(7),
      parentId: "current-user-id", // Should come from auth context
      createdAt: {
        seconds: Date.now() / 1000,
        nanoseconds: 0,
      } as any,
    };
    setChildren([...children, newChild]);
  };

  const handleManageChild = (childId: string) => {
    setSelectedChild(childId);
    setActiveTab("settings");
  };

  const handleSaveContentPolicy = (policy: Partial<ContentPolicy>) => {
    console.log("Saving content policy:", policy);
    // Here you would save to Firestore
    setActiveTab("overview");
  };

  const handleSaveScreenTimeRules = (rules: Partial<ScreenTimeRules>) => {
    console.log("Saving screen time rules:", rules);
    // Here you would save to Firestore
    setActiveTab("overview");
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 p-6 rounded-2xl bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 border-2 border-sky-200">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-sky-500 animate-pulse" />
            <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Parental Controls</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Protect your children and promote healthy digital habits
          </p>
        </div>
        <Button onClick={() => setAddChildOpen(true)} className="bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Child
        </Button>
      </div>

      {children.length === 0 ? (
        <Card className="border-dashed border-2 hover:border-sky-300 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mb-4 animate-bounce" />
            <h3 className="text-xl font-semibold mb-2">No Children Added Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get started by adding your child's profile to set up parental controls,
              manage screen time, and monitor their digital activities.
            </p>
            <Button onClick={() => setAddChildOpen(true)} className="bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Alert className="border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="h-4 w-4 text-sky-600" />
              <AlertTitle>Digital Wellness Tips</AlertTitle>
              <AlertDescription>
                Encourage outdoor play, family time, and creative activities. The best
                screen time is when it's educational, social, or creative!
              </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <ChildProfileCard
                  key={child.id}
                  child={child}
                  screenTimeToday={mockScreenTime[child.id] || 45}
                  screenTimeLimit={120}
                  onManage={handleManageChild}
                />
              ))}
            </div>

            <Card className="border-2 hover:border-purple-200 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/20">
              <CardHeader>
                <CardTitle>Why Parental Controls Matter</CardTitle>
                <CardDescription>
                  Protecting your child's digital wellbeing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-md transition-all duration-200">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      Content Safety
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Filter inappropriate content and ensure age-appropriate experiences
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 hover:shadow-md transition-all duration-200">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Settings className="h-4 w-4 text-blue-600" />
                      Healthy Habits
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Manage screen time and encourage breaks for physical activity
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-md transition-all duration-200">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      Educational Focus
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Prioritize educational content and track learning progress
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 hover:shadow-md transition-all duration-200">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      Activity Monitoring
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Stay informed about your child's digital activities and interactions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {selectedChild ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Settings for {children.find((c) => c.id === selectedChild)?.name}
                    </h2>
                    <p className="text-muted-foreground">
                      Configure content filters and screen time rules
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedChild(null);
                      setActiveTab("overview");
                    }}
                  >
                    Back to Overview
                  </Button>
                </div>

                <Tabs defaultValue="content" className="w-full">
                  <TabsList>
                    <TabsTrigger value="content">Content Policy</TabsTrigger>
                    <TabsTrigger value="screentime">Screen Time</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="mt-6">
                    <ContentPolicyForm
                      onSave={handleSaveContentPolicy}
                      onCancel={() => setActiveTab("overview")}
                    />
                  </TabsContent>

                  <TabsContent value="screentime" className="mt-6">
                    <ScreenTimeManager
                      onSave={handleSaveScreenTimeRules}
                      onCancel={() => setActiveTab("overview")}
                    />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Child</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Choose a child from the overview to configure their settings
                  </p>
                  <Button onClick={() => setActiveTab("overview")}>
                    Go to Overview
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {selectedChild ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Activity Report for {children.find((c) => c.id === selectedChild)?.name}
                    </h2>
                    <p className="text-muted-foreground">
                      Daily activity summary and insights
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedChild(null);
                    }}
                  >
                    Select Different Child
                  </Button>
                </div>

                {mockReports[selectedChild] ? (
                  <ActivityReportView
                    report={mockReports[selectedChild]}
                    childName={children.find((c) => c.id === selectedChild)?.name || ""}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
                      <p className="text-muted-foreground text-center">
                        Activity reports will appear here once your child starts using the app
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <Card
                    key={child.id}
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-sky-300 bg-gradient-to-br from-white to-sky-50/20"
                    onClick={() => setSelectedChild(child.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5" />
                        {child.name}'s Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        View Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <AddChildDialog
        open={addChildOpen}
        onOpenChange={setAddChildOpen}
        onAdd={handleAddChild}
      />
    </div>
  );
}
