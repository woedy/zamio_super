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

/**
 * Standardized icon mapping for common use cases
 */
export const STANDARD_ICON_MAP = {
  // Navigation
  dashboard: 'LayoutDashboard',
  home: 'Home',
  profile: 'User',
  settings: 'Settings',
  menu: 'Menu',
  close: 'X',
  
  // Authentication
  login: 'LogIn',
  logout: 'LogOut',
  eye: 'Eye',
  eyeOff: 'EyeOff',
  
  // Actions
  add: 'Plus',
  edit: 'Edit',
  delete: 'Trash2',
  search: 'Search',
  filter: 'Filter',
  upload: 'Upload',
  download: 'Download',
  share: 'Share2',
  copy: 'Copy',
  
  // Status
  success: 'CheckCircle',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',
  loading: 'Loader2',
  
  // Music
  music: 'Music',
  music2: 'Music2',
  play: 'Play',
  pause: 'Pause',
  radio: 'Radio',
  
  // Data
  chart: 'BarChart3',
  trend: 'TrendingUp',
  activity: 'Activity',
  
  // Communication
  mail: 'Mail',
  bell: 'Bell',
  message: 'MessageSquare',
  
  // Files
  file: 'File',
  fileText: 'FileText',
  fileAudio: 'FileAudio',
  folder: 'Folder',
  
  // Navigation arrows
  arrowUp: 'ArrowUp',
  arrowDown: 'ArrowDown',
  arrowLeft: 'ArrowLeft',
  arrowRight: 'ArrowRight',
  chevronUp: 'ChevronUp',
  chevronDown: 'ChevronDown',
  chevronLeft: 'ChevronLeft',
  chevronRight: 'ChevronRight',
  
  // Users
  user: 'User',
  users: 'Users',
  userPlus: 'UserPlus',
  
  // Business
  building: 'Building2',
  creditCard: 'CreditCard',
  dollar: 'DollarSign',
  
  // Location & Time
  mapPin: 'MapPin',
  globe: 'Globe',
  calendar: 'Calendar',
  clock: 'Clock',
  
  // System
  help: 'HelpCircle',
  external: 'ExternalLink',
  link: 'Link',
  shield: 'Shield',
  lock: 'Lock',
} as const;

export type StandardIconName = keyof typeof STANDARD_ICON_MAP;

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

export const MusicIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Music" {...props} />;

export const SearchIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Search" {...props} />;

export const EditIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Edit" {...props} />;

export const DeleteIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Trash2" {...props} />;

export const AddIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Plus" {...props} />;

export const UploadIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Upload" {...props} />;

export const DownloadIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Download" {...props} />;

export const EyeIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="Eye" {...props} />;

export const EyeOffIcon = (props: Omit<StandardizedIconProps, 'name'>) => 
  <StandardizedIcon name="EyeOff" {...props} />;

// Export the mapping for reference
export { STANDARD_ICON_MAP as iconMap };