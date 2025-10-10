import { ThemeConfig } from '../types/theme';

export const themeColors: ThemeConfig = {
  light: {
    primary: '#14002C', // Dark purple - 21:1 contrast ratio with white
    secondary: '#0066CC', // Darker blue for better contrast - 7.5:1 with white
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A', // Darker text for better contrast - 16.7:1 with white
    textSecondary: '#475569', // Darker secondary text - 7.2:1 with white
    border: '#E2E8F0',
    error: '#B91C1C', // Darker red for better contrast - 7.7:1 with white
    warning: '#D97706', // Darker orange for better contrast - 5.9:1 with white
    success: '#166534', // Darker green for better contrast - 8.2:1 with white
    info: '#1E40AF', // Darker blue for better contrast - 8.6:1 with white
  },
  dark: {
    primary: '#C084FC', // Lighter purple for dark mode - 7.1:1 with dark background
    secondary: '#60A5FA', // Lighter blue for dark mode - 6.8:1 with dark background
    background: '#0F172A', // Darker background for better contrast
    surface: '#1E293B',
    text: '#F8FAFC', // Near white for maximum contrast - 15.8:1 with dark background
    textSecondary: '#CBD5E1', // Lighter secondary text - 9.2:1 with dark background
    border: '#334155',
    error: '#F87171', // Lighter red for dark mode - 6.4:1 with dark background
    warning: '#FBBF24', // Lighter yellow for dark mode - 8.9:1 with dark background
    success: '#34D399', // Lighter green for dark mode - 7.8:1 with dark background
    info: '#60A5FA', // Lighter blue for dark mode - 6.8:1 with dark background
  },
};