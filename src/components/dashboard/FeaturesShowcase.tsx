"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Users, 
  Shield, 
  Gamepad2, 
  Video, 
  Bell,
  Heart,
  Zap,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Users,
    title: 'Interactive Family Tree',
    description: 'Build and visualize your family connections with beautiful, animated member cards.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Bell,
    title: 'Real-time Updates',
    description: 'Stay connected with activity feeds, notifications, and upcoming events.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Parental Controls',
    description: 'Manage screen time, content filtering, and monitor digital activities.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Gamepad2,
    title: 'Family Games',
    description: '30+ party games and activities for quality family time together.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Video,
    title: 'Video Library',
    description: 'Curated, age-appropriate educational and entertainment content.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with Next.js and optimized for performance on all devices.',
    color: 'from-yellow-500 to-amber-500',
  },
];

export function FeaturesShowcase() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-accent animate-pulse" />
          <h2 className={cn(
            "text-4xl font-bold",
            "bg-gradient-to-r from-primary via-secondary to-accent",
            "bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
          )}>
            Everything Your Family Needs
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          FamilyVerse combines powerful features with beautiful design to help families 
          connect, grow, and create lasting memories together.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className={cn(
                "border-2 transition-all duration-300",
                "hover:shadow-2xl hover:-translate-y-2",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className={cn(
                  "p-3 rounded-xl w-fit mb-3",
                  "bg-gradient-to-br shadow-lg",
                  feature.color
                )}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className={cn(
        "border-2 shadow-xl",
        "bg-gradient-to-br from-card via-card to-primary/5"
      )}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle className="text-2xl">Why Families Love FamilyVerse</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                Easy to Use
              </h3>
              <p className="text-sm text-muted-foreground">
                Intuitive interface designed for all ages - from kids to grandparents.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Safe & Secure
              </h3>
              <p className="text-sm text-muted-foreground">
                Your family data is protected with enterprise-grade Firebase security.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Always Improving
              </h3>
              <p className="text-sm text-muted-foreground">
                Regular updates with new features based on family feedback.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Works Everywhere
              </h3>
              <p className="text-sm text-muted-foreground">
                Responsive design works perfectly on phones, tablets, and computers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
