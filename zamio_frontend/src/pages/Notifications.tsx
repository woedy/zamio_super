import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  DollarSign,
  Music,
  Users,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Search,
  Archive,
  Trash2,
  Settings,
  RefreshCw,
  Star,
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
  User,
  Building,
  Award,
  Target,
  Zap,
  Crown,
  Gem,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info as InfoIcon,
  MessageSquare,
  FileText,
  CreditCard,
  PiggyBank,
  BarChart3,
  TrendingDown,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';

// Mock notification data
const notificationsData = [
  {
    id: '1',
    type: 'payment',
    priority: 'high',
    title: 'Royalty Payment Received',
    message: 'Your latest royalty payment of ₵2,340.50 has been processed and deposited to your account.',
    amount: 2340.50,
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    track: 'Ghana Na Woti',
    source: 'Radio Broadcast',
    actionable: true,
    actionLabel: 'View Details',
    actionType: 'view_payment'
  },
  {
    id: '2',
    type: 'performance',
    priority: 'medium',
    title: 'Track Performance Milestone',
    message: 'Your track "Ghana Na Woti" has reached 500,000 plays! Keep up the great work.',
    plays: 500000,
    timestamp: '2024-01-14T15:45:00Z',
    read: false,
    track: 'Ghana Na Woti',
    milestone: true,
    actionable: true,
    actionLabel: 'View Analytics',
    actionType: 'view_analytics'
  },
  {
    id: '3',
    type: 'system',
    priority: 'low',
    title: 'Platform Maintenance Scheduled',
    message: 'System maintenance is scheduled for tonight from 2:00 AM - 4:00 AM EST. Services may be temporarily unavailable.',
    timestamp: '2024-01-14T09:15:00Z',
    read: true,
    category: 'maintenance',
    actionable: false
  },
  {
    id: '4',
    type: 'social',
    priority: 'medium',
    title: 'New Follower',
    message: 'DJ Fresh FM has started following you on Zamio.',
    timestamp: '2024-01-13T18:20:00Z',
    read: false,
    follower: 'DJ Fresh FM',
    actionable: true,
    actionLabel: 'View Profile',
    actionType: 'view_profile'
  },
  {
    id: '5',
    type: 'payment',
    priority: 'high',
    title: 'Payment Issue Detected',
    message: 'There was an issue processing your payment for "Terminator" from streaming platforms. Please review your account settings.',
    amount: 624.00,
    timestamp: '2024-01-13T14:10:00Z',
    read: false,
    track: 'Terminator',
    source: 'Streaming Platforms',
    status: 'failed',
    actionable: true,
    actionLabel: 'Fix Issue',
    actionType: 'fix_payment'
  },
  {
    id: '6',
    type: 'achievement',
    priority: 'medium',
    title: 'Achievement Unlocked!',
    message: 'Congratulations! You\'ve earned the "Rising Star" badge for consistent monthly growth.',
    badge: 'Rising Star',
    timestamp: '2024-01-12T16:30:00Z',
    read: true,
    actionable: true,
    actionLabel: 'View Badge',
    actionType: 'view_achievement'
  },
  {
    id: '7',
    type: 'collaboration',
    priority: 'low',
    title: 'Collaboration Opportunity',
    message: 'Stonebwoy is interested in collaborating with you. Check your messages for details.',
    timestamp: '2024-01-12T11:45:00Z',
    read: false,
    collaborator: 'Stonebwoy',
    actionable: true,
    actionLabel: 'View Message',
    actionType: 'view_message'
  },
  {
    id: '8',
    type: 'performance',
    priority: 'medium',
    title: 'Regional Performance Update',
    message: 'Your tracks are performing exceptionally well in the Ashanti region with 25% growth this month.',
    region: 'Ashanti',
    growth: 25,
    timestamp: '2024-01-11T20:15:00Z',
    read: true,
    actionable: true,
    actionLabel: 'View Region',
    actionType: 'view_region'
  }
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(notificationsData);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'payment' | 'performance' | 'system' | 'social'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString()}`;
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconProps = { className: "w-5 h-5" };

    switch (type) {
      case 'payment':
        return <DollarSign {...iconProps} className={`${iconProps.className} text-green-600`} />;
      case 'performance':
        return <TrendingUp {...iconProps} className={`${iconProps.className} text-blue-600`} />;
      case 'system':
        return <Settings {...iconProps} className={`${iconProps.className} text-gray-600`} />;
      case 'social':
        return <Users {...iconProps} className={`${iconProps.className} text-purple-600`} />;
      case 'achievement':
        return <Award {...iconProps} className={`${iconProps.className} text-yellow-600`} />;
      case 'collaboration':
        return <MessageSquare {...iconProps} className={`${iconProps.className} text-indigo-600`} />;
      default:
        return <Bell {...iconProps} className={`${iconProps.className} text-gray-600`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10';
      case 'low':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
      default:
        return 'border-l-gray-300 bg-gray-50/50 dark:bg-gray-800/50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = selectedFilter === 'all' || notification.type === selectedFilter ||
                         (selectedFilter === 'unread' && !notification.read);
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
    const matchesSearch = searchTerm === '' ||
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesPriority && matchesSearch;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                  <p className="text-gray-600 dark:text-gray-300 font-light">
                    Stay updated with your music performance and platform activity
                  </p>
                </div>
              </div>

              {/* Quick Stats in Header */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {notifications.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {unreadCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {notifications.filter(n => n.priority === 'high').length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">High Priority</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread</option>
                <option value="payment">Payments</option>
                <option value="performance">Performance</option>
                <option value="system">System</option>
                <option value="social">Social</option>
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {filteredNotifications.length} Notification{filteredNotifications.length !== 1 ? 's' : ''}
            </h2>
            {filteredNotifications.length > 0 && (
              <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            )}
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No notifications found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {searchTerm || selectedFilter !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You\'re all caught up! Check back later for updates.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-6 border-l-4 rounded-r-xl transition-all duration-200 hover:shadow-lg ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Notification Icon */}
                      <div className={`p-3 rounded-xl ${
                        notification.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                        notification.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(notification.timestamp)}
                            </span>
                            <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              notification.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {notification.priority}
                            </div>
                          </div>
                        </div>

                        <p className={`text-sm ${!notification.read ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                          {notification.message}
                        </p>

                        {/* Additional Info */}
                        {notification.amount && (
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(notification.amount)}
                            </span>
                            {notification.track && (
                              <span className="text-gray-500 dark:text-gray-400">•</span>
                            )}
                            {notification.track && (
                              <span className="text-gray-600 dark:text-gray-400">
                                Track: {notification.track}
                              </span>
                            )}
                          </div>
                        )}

                        {notification.plays && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Play className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {notification.plays.toLocaleString()} plays
                            </span>
                          </div>
                        )}

                        {notification.follower && (
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                              {notification.follower}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                          title="Mark as read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {notification.actionable && (
                        <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors duration-200">
                          {notification.actionLabel}
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-gray-700 dark:text-slate-300">Unread</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {unreadCount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount === 0 ? 'All caught up!' : 'Need attention'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/60 dark:to-indigo-900/60 rounded-lg flex items-center justify-center">
                <BellRing className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-gray-700 dark:text-slate-300">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {notifications.filter(n => n.priority === 'high').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Require immediate action
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/60 dark:to-pink-900/60 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-gray-700 dark:text-slate-300">Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {notifications.filter(n => n.type === 'payment').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Financial notifications
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/60 dark:to-emerald-900/60 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-gray-700 dark:text-slate-300">Performance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {notifications.filter(n => n.type === 'performance').length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Track & milestone updates
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/60 dark:to-pink-900/60 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
