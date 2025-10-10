import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: ThemeMode;
  preference: ThemePreference;
  setTheme: (theme: ThemeMode) => void;
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultPreference?: ThemePreference;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  defaultPreference = 'system',
  storageKey = 'zamio-theme',
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${storageKey}-preference`);
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        return stored as ThemePreference;
      }
    }
    return defaultPreference;
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const storedPreference = localStorage.getItem(`${storageKey}-preference`);
      
      if (storedPreference === 'system' || !storedPreference) {
        // Use system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else if (storedPreference === 'light' || storedPreference === 'dark') {
        return storedPreference as ThemeMode;
      }
    }
    return defaultTheme;
  });

  // Listen for system theme changes
  useEffect(() => {
    if (preference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setThemeState(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preference]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Store current theme (not preference)
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  useEffect(() => {
    // Store preference separately
    localStorage.setItem(`${storageKey}-preference`, preference);
    
    // Update theme based on preference
    if (preference === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setThemeState(systemTheme);
    } else {
      setThemeState(preference as ThemeMode);
    }
  }, [preference, storageKey]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    // When manually setting theme, update preference to match
    setPreferenceState(newTheme);
  };

  const setPreference = (newPreference: ThemePreference) => {
    setPreferenceState(newPreference);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    preference,
    setTheme,
    setPreference,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
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