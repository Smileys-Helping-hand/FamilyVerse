"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Upload, 
  Share2, 
  Camera,
  FileText,
  Download,
  Sparkles,
  PartyPopper
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
}

export function QuickActions() {
  const { toast } = useToast();
  const router = useRouter();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions: QuickAction[] = [
    {
      id: 'party-games',
      label: 'Party Games',
      description: '🎮 Racing, Betting & More',
      icon: PartyPopper,
      color: 'from-purple-500 to-pink-600',
      action: () => {
        router.push('/party/join');
      },
    },
    {
      id: 'add-member',
      label: 'Add Member',
      description: 'Add a new family member',
      icon: UserPlus,
      color: 'from-sky-500 to-blue-600',
      action: () => {
        router.push('/dashboard/tree');
      },
    },
    {
      id: 'upload-photo',
      label: 'Upload Photos',
      description: 'Add family photos',
      icon: Camera,
      color: 'from-purple-500 to-pink-600',
      action: () => {
        router.push('/dashboard/videos');
      },
    },
    {
      id: 'share-tree',
      label: 'Share Tree',
      description: 'Share with family',
      icon: Share2,
      color: 'from-green-500 to-emerald-600',
      action: () => {
        navigator.clipboard.writeText(window.location.origin + '/dashboard/tree');
        toast({
          title: "Link Copied!",
          description: "Family tree link copied to clipboard",
        });
      },
    },
    {
      id: 'export',
      label: 'Export Tree',
      description: 'Download as PDF',
      icon: Download,
      color: 'from-orange-500 to-red-600',
      action: () => {
        toast({
          title: "Coming Soon!",
          description: "Export feature will be available soon",
        });
      },
    },
  ];

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-xl border-2",
      "bg-gradient-to-br from-card via-card to-primary/5"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isHovered = hoveredAction === action.id;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                className={cn(
                  "h-auto flex-col items-start p-4 gap-3",
                  "border-2 transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1",
                  "animate-in fade-in slide-in-from-bottom-4",
                  "group relative overflow-hidden"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={action.action}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                {/* Animated background */}
                <div 
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10",
                    "transition-opacity duration-300",
                    `bg-gradient-to-br ${action.color}`
                  )}
                />
                
                <div className="relative w-full">
                  <div className={cn(
                    "p-2 rounded-lg w-fit transition-all duration-300",
                    "group-hover:scale-110 group-hover:rotate-6",
                    `bg-gradient-to-br ${action.color}`,
                    "shadow-lg"
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="mt-3 text-left w-full">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className={cn(
                      "text-xs text-muted-foreground transition-all duration-300",
                      isHovered ? "opacity-100" : "opacity-70"
                    )}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
