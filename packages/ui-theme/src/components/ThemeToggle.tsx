import React from 'react';
import { useTheme } from '../providers/ThemeProvider';
import { Button } from './Button';
import { StandardIcon } from '../icons';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <StandardIcon 
        name={theme === 'light' ? 'moon' : 'sun'} 
        className="h-4 w-4" 
      />
    </Button>
  );
}