import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

export function ThemeDemo() {
  const { theme } = useTheme();

  return (
    <div className="p-6 max-w-md mx-auto bg-surface border border-border rounded-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Theme Demo</h3>
          <ThemeToggle />
        </div>
        
        <div className="space-y-2">
          <p className="text-text-secondary">
            Current theme: <span className="font-medium text-text">{theme}</span>
          </p>
          
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-primary text-white rounded text-sm">Primary</button>
            <button className="px-3 py-1 bg-secondary text-white rounded text-sm">Secondary</button>
            <button className="px-3 py-1 border border-border text-text rounded text-sm">Outline</button>
          </div>
          
          <div className="p-3 bg-surface border border-border rounded-md">
            <p className="text-sm text-text-secondary">
              This card demonstrates the theme colors. The background, text, and borders 
              will change when you toggle between light and dark modes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}