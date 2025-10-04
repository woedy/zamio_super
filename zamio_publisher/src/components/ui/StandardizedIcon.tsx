/**
 * Standardized Icon Component using Lucide React
 * 
 * This replaces the old Icon component that mixed Heroicons and Lucide React
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StandardizedIconProps {
  /** The name of the icon from Lucide React */
  name: keyof typeof LucideIcons;
  /** Size of the icon */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Additional CSS classes */
  className?: string;
  /** Color variant */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Additional props passed to the icon component */
  [key: string]: any;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const colorClasses = {
  default: 'text-current',
  primary: 'text-blue-600 dark:text-blue-400',
  secondary: 'text-gray-600 dark:text-gray-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export const StandardizedIcon: React.FC<StandardizedIconProps> = ({
  name,
  size = 'md',
  className,
  color = 'default',
  ...props
}) => {
  // Try to get the icon from Lucide React
  const IconComponent = (LucideIcons as any)[name as string];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide React icons`);
    // Fallback to HelpCircle
    return (
      <LucideIcons.HelpCircle 
        className={cn(getSizeClass(size), colorClasses[color], className)} 
        {...props} 
      />
    );
  }
  
  return (
    <IconComponent 
      className={cn(getSizeClass(size), colorClasses[color], className)} 
      {...props} 
    />
  );
};

function getSizeClass(size: StandardizedIconProps['size']): string {
  if (typeof size === 'number') {
    return `w-${size} h-${size}`;
  }
  return sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
}

// Convenience components for commonly used icons
export const DashboardIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="LayoutDashboard" {...props} />;

export const HomeIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Home" {...props} />;

export const ProfileIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="User" {...props} />;

export const SettingsIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Settings" {...props} />;

export const EyeIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Eye" {...props} />;

export const EyeOffIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="EyeOff" {...props} />;