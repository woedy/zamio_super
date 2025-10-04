/**
 * StandardIcon Component
 * 
 * A unified icon component that uses Lucide React icons consistently
 * across all ZamIO applications.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { STANDARD_ICONS, StandardIconName, LEGACY_ICON_MAPPING } from './iconMapping';
import { cn } from '../utils/cn';

export interface StandardIconProps {
  /** The name of the icon from the standard icon set */
  name: StandardIconName | string;
  /** Size of the icon */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Color class or style */
  className?: string;
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

/**
 * Get the Lucide icon component by name
 */
function getLucideIcon(iconName: string): LucideIcon | null {
  // First check if it's a standard icon
  const standardIconName = STANDARD_ICONS[iconName as StandardIconName];
  if (standardIconName) {
    return (LucideIcons as any)[standardIconName] || null;
  }
  
  // Check if it's a legacy icon that needs mapping
  const mappedIconName = LEGACY_ICON_MAPPING[iconName as keyof typeof LEGACY_ICON_MAPPING];
  if (mappedIconName) {
    return (LucideIcons as any)[mappedIconName] || null;
  }
  
  // Try to find the icon directly in Lucide
  return (LucideIcons as any)[iconName] || null;
}

export const StandardIcon: React.FC<StandardIconProps> = ({
  name,
  size = 'md',
  className,
  ...props
}) => {
  const IconComponent = getLucideIcon(name);
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide React icons`);
    // Fallback to a default icon
    return <LucideIcons.HelpCircle className={cn(getSizeClass(size), className)} {...props} />;
  }
  
  return (
    <IconComponent 
      className={cn(getSizeClass(size), className)} 
      {...props} 
    />
  );
};

function getSizeClass(size: StandardIconProps['size']): string {
  if (typeof size === 'number') {
    return `w-${size} h-${size}`;
  }
  return sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
}

// Export commonly used icons as individual components for convenience
export const DashboardIcon = (props: Omit<StandardIconProps, 'name'>) => 
  <StandardIcon name="dashboard" {...props} />;

export const ProfileIcon = (props: Omit<StandardIconProps, 'name'>) => 
  <StandardIcon name="profile" {...props} />;

export const SettingsIcon = (props: Omit<StandardIconProps, 'name'>) => 
  <StandardIcon name="settings" {...props} />;

export const MusicIcon = (props: Omit<StandardIconProps, 'name'>) => 
  <StandardIcon name="music" {...props} />;

export const AnalyticsIcon = (props: Omit<StandardIconProps, 'name'>) => 
  <StandardIcon name="analytics" {...props} />;

export const EyeIcon = (props: Omit<StandardIconProps, 'name'>) => 
  <StandardIcon name="eye" {...props} />;

export const EyeOffIcon = (props: Omit<StandardIconProps, 'name'>) => 
  <StandardIcon name="eyeOff" {...props} />;

// Export the icon mapping for reference
export { STANDARD_ICONS, LEGACY_ICON_MAPPING } from './iconMapping';