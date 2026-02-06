'use client';

import { useTheme, ThemeTemplate } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Palette, 
  Heart, 
  Rocket, 
  Zap, 
  Briefcase,
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const themes: Array<{
  value: ThemeTemplate;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}> = [
  {
    value: 'family',
    label: 'Family',
    description: 'Perfect blend for everyone',
    icon: Heart,
    gradient: 'from-cyan-500 via-purple-500 to-pink-500',
  },
  {
    value: 'kids',
    label: 'Kids',
    description: 'Playful and colorful',
    icon: Rocket,
    gradient: 'from-pink-500 via-purple-500 to-cyan-400',
  },
  {
    value: 'teens',
    label: 'Teens',
    description: 'Cool and dynamic',
    icon: Zap,
    gradient: 'from-cyan-400 via-purple-500 to-pink-500',
  },
  {
    value: 'adults',
    label: 'Adults',
    description: 'Sophisticated and elegant',
    icon: Briefcase,
    gradient: 'from-blue-600 via-slate-500 to-purple-600',
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  
  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={cn(
            "relative overflow-hidden border-2 transition-all duration-300",
            "hover:scale-110 hover:rotate-12 hover:shadow-lg",
            "group"
          )}
        >
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r opacity-20 group-hover:opacity-30 transition-opacity",
            currentTheme.gradient
          )} />
          <Icon className="h-5 w-5 relative z-10 transition-transform group-hover:scale-110" />
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Choose Your Vibe
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon;
          const isActive = theme === themeOption.value;
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "cursor-pointer py-3 transition-all duration-200",
                isActive && "bg-primary/10"
              )}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-r",
                  themeOption.gradient,
                  isActive ? "shadow-lg scale-110" : "opacity-70"
                )}>
                  <ThemeIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{themeOption.label}</span>
                    {isActive && (
                      <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
