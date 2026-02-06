'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface AnimatedBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function AnimatedBackground({ className, children }: AnimatedBackgroundProps) {
  const { theme } = useTheme();

  return (
    <div className={cn("relative", className)}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme === 'kids' && (
          <>
            <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[50%] left-[50%] w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-[10%] right-[30%] w-48 h-48 bg-success/30 rounded-full blur-3xl animate-bounce-slow" />
          </>
        )}
        
        {theme === 'teens' && (
          <>
            <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[60%] left-[60%] w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" />
          </>
        )}
        
        {theme === 'family' && (
          <>
            <div className="absolute top-[25%] left-[25%] w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-[25%] right-[25%] w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[50%] left-[50%] w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </>
        )}
        
        {theme === 'adults' && (
          <>
            <div className="absolute top-[30%] left-[30%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-[30%] right-[30%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          </>
        )}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
