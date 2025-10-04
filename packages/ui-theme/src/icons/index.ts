/**
 * Icons Export
 * 
 * Centralized export for all icon-related utilities and components
 */

export {
  StandardIcon,
  DashboardIcon,
  ProfileIcon,
  SettingsIcon,
  MusicIcon,
  AnalyticsIcon,
  EyeIcon,
  EyeOffIcon,
  type StandardIconProps,
} from './StandardIcon';

export {
  STANDARD_ICONS,
  CONTEXT_ICONS,
  LEGACY_ICON_MAPPING,
  type StandardIconName,
} from './iconMapping';

// Re-export commonly used Lucide icons for direct use when needed
export {
  LayoutDashboard,
  User,
  Settings,
  Music,
  Music2,
  BarChart3,
  Eye,
  EyeOff,
  Play,
  Pause,
  Radio,
  TrendingUp,
  Activity,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Bell,
  Mail,
  DollarSign,
  Upload,
  Download,
  Home,
  Menu,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';