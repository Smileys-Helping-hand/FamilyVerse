'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeTemplate = 'family' | 'kids' | 'teens' | 'adults';

interface ThemeContextType {
  theme: ThemeTemplate;
  setTheme: (theme: ThemeTemplate) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeTemplate>('family');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('familyverse-theme') as ThemeTemplate;
    if (savedTheme && ['family', 'kids', 'teens', 'adults'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: ThemeTemplate) => {
    setThemeState(newTheme);
    localStorage.setItem('familyverse-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
