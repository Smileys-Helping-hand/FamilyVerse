"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Leaf, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ message = "Loading...", fullScreen = false }: LoadingScreenProps) {
  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="flex flex-col items-center space-y-6 relative z-10">
          <div className="relative">
            <Leaf className={cn(
              "h-20 w-20 text-primary animate-bounce-slow",
              "drop-shadow-2xl"
            )} />
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-pulse" />
            <Heart className="absolute -bottom-2 -left-2 h-6 w-6 text-secondary fill-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="text-center space-y-2">
            <h2 className={cn(
              "text-3xl font-bold",
              "bg-gradient-to-r from-primary via-secondary to-accent",
              "bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
            )}>
              {message}
            </h2>
            <div className="flex items-center gap-2 justify-center text-muted-foreground text-lg">
              <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>.</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full border-2 shadow-lg animate-pulse">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
  );
}
