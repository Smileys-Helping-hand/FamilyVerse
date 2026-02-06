"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className={cn(
            "max-w-md w-full border-2 shadow-2xl",
            "bg-gradient-to-br from-card via-card to-destructive/5",
            "animate-in fade-in slide-in-from-bottom-4 duration-700"
          )}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto">
                <div className={cn(
                  "p-4 rounded-full w-fit mx-auto",
                  "bg-destructive/10 border-2 border-destructive/20",
                  "animate-pulse"
                )}>
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
                <CardDescription className="text-base mt-2">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 rounded-lg bg-muted border border-border text-xs font-mono overflow-auto max-h-40">
                  <p className="font-semibold mb-2 text-foreground">Error Details:</p>
                  <p className="text-muted-foreground">{this.state.error.message}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className={cn(
                    "flex-1 border-2 transition-all duration-300",
                    "hover:scale-105 hover:shadow-lg"
                  )}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className={cn(
                    "flex-1 bg-gradient-to-r from-primary to-secondary",
                    "hover:shadow-xl transition-all duration-300 hover:scale-105"
                  )}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
