'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { Heart, Rocket, Zap, Briefcase, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeShowcase() {
  const { theme } = useTheme();

  const themeInfo = {
    family: {
      title: 'Family Theme',
      description: 'Perfect blend for everyone',
      icon: Heart,
      features: ['Balanced colors', 'Friendly animations', 'Universal appeal'],
    },
    kids: {
      title: 'Kids Theme',
      description: 'Super playful and fun!',
      icon: Rocket,
      features: ['Bright colors', 'Bouncy animations', 'Large buttons'],
    },
    teens: {
      title: 'Teens Theme',
      description: 'Cool and edgy',
      icon: Zap,
      features: ['Dark mode', 'Neon effects', 'Modern design'],
    },
    adults: {
      title: 'Adults Theme',
      description: 'Sophisticated elegance',
      icon: Briefcase,
      features: ['Clean design', 'Professional', 'Subtle animations'],
    },
  };

  const currentTheme = themeInfo[theme];
  const Icon = currentTheme.icon;

  return (
    <Card className={cn(
      "transition-all duration-500 hover:shadow-2xl border-2",
      "hover:-translate-y-2 bg-gradient-to-br from-card via-card to-primary/5"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br from-primary to-secondary",
            "shadow-lg"
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <span className={cn(
            "bg-gradient-to-r from-primary via-secondary to-accent",
            "bg-clip-text text-transparent"
          )}>
            {currentTheme.title}
          </span>
          <Sparkles className="h-5 w-5 text-accent animate-pulse" />
        </CardTitle>
        <CardDescription className="text-base">
          {currentTheme.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">Features:</h4>
          <ul className="space-y-2">
            {currentTheme.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Star className="h-4 w-4 text-accent fill-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-3 pt-4">
          <h4 className="font-semibold text-sm text-muted-foreground">Sample Buttons:</h4>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="secondary">Secondary</Button>
            <Button size="sm" variant="outline">Outline</Button>
            <Button size="sm" variant="ghost">Ghost</Button>
          </div>
        </div>

        <div className="pt-4">
          <div className={cn(
            "p-4 rounded-xl border-2 border-dashed border-primary/30",
            "bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10",
            "text-center font-semibold"
          )}>
            You're viewing: <span className="text-primary">{currentTheme.title}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
