/**
 * Standardized Icon Mapping for ZamIO Platform
 * 
 * This file defines the standard icons to be used across all applications
 * for consistent UI/UX. All icons are from Lucide React for consistency.
 */

// Core navigation and action icons
export const STANDARD_ICONS = {
  // Navigation
  dashboard: 'LayoutDashboard',
  profile: 'User',
  settings: 'Settings',
  home: 'Home',
  menu: 'Menu',
  close: 'X',
  
  // Authentication & Security
  login: 'LogIn',
  logout: 'LogOut',
  eye: 'Eye',
  eyeOff: 'EyeOff',
  shield: 'Shield',
  lock: 'Lock',
  
  // Music & Media
  music: 'Music',
  music2: 'Music2',
  play: 'Play',
  pause: 'Pause',
  radio: 'Radio',
  headphones: 'Headphones',
  microphone: 'Mic',
  
  // Data & Analytics
  analytics: 'BarChart3',
  chart: 'TrendingUp',
  pieChart: 'PieChart',
  activity: 'Activity',
  target: 'Target',
  
  // Actions
  edit: 'Edit',
  delete: 'Trash2',
  add: 'Plus',
  search: 'Search',
  filter: 'Filter',
  download: 'Download',
  upload: 'Upload',
  share: 'Share2',
  
  // Status & Feedback
  success: 'CheckCircle',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',
  loading: 'Loader2',
  
  // Business Objects
  users: 'Users',
  user: 'User',
  artist: 'User',
  station: 'Radio',
  publisher: 'Building2',
  admin: 'Shield',
  
  // Financial
  dollar: 'DollarSign',
  wallet: 'Wallet',
  creditCard: 'CreditCard',
  bank: 'Building',
  
  // Communication
  mail: 'Mail',
  bell: 'Bell',
  message: 'MessageSquare',
  phone: 'Phone',
  
  // Files & Documents
  file: 'File',
  fileText: 'FileText',
  fileMusic: 'FileAudio',
  folder: 'Folder',
  
  // Location & Time
  mapPin: 'MapPin',
  globe: 'Globe',
  calendar: 'Calendar',
  clock: 'Clock',
  
  // System
  help: 'HelpCircle',
  external: 'ExternalLink',
  link: 'Link',
  copy: 'Copy',
  
  // Navigation arrows
  arrowRight: 'ArrowRight',
  arrowLeft: 'ArrowLeft',
  arrowUp: 'ArrowUp',
  arrowDown: 'ArrowDown',
  chevronRight: 'ChevronRight',
  chevronLeft: 'ChevronLeft',
  chevronUp: 'ChevronUp',
  chevronDown: 'ChevronDown',
} as const;

export type StandardIconName = keyof typeof STANDARD_ICONS;

/**
 * Context-specific icon mappings for different sections
 */
export const CONTEXT_ICONS = {
  dashboard: {
    overview: 'LayoutDashboard',
    analytics: 'BarChart3',
    activity: 'Activity',
    notifications: 'Bell',
  },
  
  profile: {
    user: 'User',
    edit: 'Edit',
    settings: 'Settings',
    security: 'Shield',
  },
  
  settings: {
    general: 'Settings',
    security: 'Shield',
    notifications: 'Bell',
    privacy: 'Lock',
    theme: 'Palette',
  },
  
  music: {
    track: 'Music',
    album: 'Disc',
    playlist: 'ListMusic',
    upload: 'Upload',
    play: 'Play',
    pause: 'Pause',
  },
  
  analytics: {
    chart: 'BarChart3',
    trend: 'TrendingUp',
    pie: 'PieChart',
    activity: 'Activity',
    target: 'Target',
  },
  
  financial: {
    earnings: 'DollarSign',
    wallet: 'Wallet',
    bank: 'Building',
    card: 'CreditCard',
    withdraw: 'ArrowDownToLine',
  },
} as const;

/**
 * Legacy icon mapping for migration purposes
 * Maps old icon names to new standardized names
 */
export const LEGACY_ICON_MAPPING = {
  // Heroicons to Lucide mapping
  'EyeIcon': 'Eye',
  'EyeSlashIcon': 'EyeOff',
  'ChevronDownIcon': 'ChevronDown',
  'SunIcon': 'Sun',
  'MoonIcon': 'Moon',
  'InformationCircleIcon': 'Info',
  'XCircleIcon': 'XCircle',
  'CheckCircleIcon': 'CheckCircle',
  'ExclamationTriangleIcon': 'AlertTriangle',
  
  // React Icons to Lucide mapping
  'FaUser': 'User',
  'FaMusic': 'Music',
  'FaChartBar': 'BarChart3',
  'FaCog': 'Settings',
  'FaHome': 'Home',
  
  // Common variations
  'Music2Icon': 'Music2',
  'UploadCloud': 'Upload',
  'FileMusic': 'FileAudio',
  'UserPlus': 'UserPlus',
  'Archive': 'Archive',
  'RemoveFormattingIcon': 'Trash2', // This seems to be a custom icon, mapping to delete
} as const;