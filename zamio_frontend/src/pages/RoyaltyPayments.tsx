import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Search,
  Calendar,
  CreditCard,
  Banknote,
  Building,
  FileText,
  Eye,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Settings,
  Plus,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Award,
  Crown,
  Star,
  ChevronDown,
  MoreVertical,
  Receipt,
  Calculator,
  PiggyBank,
  Music
} from 'lucide-react';

// Mock payment data with enhanced structure
const paymentData = {
  overview: {
    totalEarnings: 23475.50,
    pendingPayments: 3450.25,
    paidThisMonth: 1890.75,
    totalTransactions: 156,
    averagePayment: 150.48,
    growthRate: 8.3,
    nextPayoutDate: '2024-02-15',
    nextPayoutAmount: 2340.50
  },
  paymentStatus: [
    {
      status: 'paid',
      amount: 18750.00,
      count: 124,
      percentage: 79.5,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'from-emerald-50 to-green-50',
      icon: CheckCircle,
      description: 'Successfully processed payments'
    },
    {
      status: 'pending',
      amount: 3450.25,
      count: 23,
      percentage: 14.7,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50',
      icon: Clock,
      description: 'Awaiting verification and processing'
    },
    {
      status: 'failed',
      amount: 1275.25,
      count: 9,
      percentage: 5.8,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50',
      icon: XCircle,
      description: 'Failed transactions requiring attention'
    }
  ],
  recentPayments: [
    {
      id: '1',
      date: '2024-01-15',
      amount: 1890.75,
      status: 'paid',
      source: 'Radio Stations',
      period: 'Dec 2023',
      tracks: 12,
      description: 'Monthly radio broadcast royalties',
      paymentMethod: 'Bank Transfer',
      reference: 'RPY-2024-001'
    },
    {
      id: '2',
      date: '2024-01-10',
      amount: 2340.50,
      status: 'pending',
      source: 'Streaming Platforms',
      period: 'Dec 2023',
      tracks: 8,
      description: 'Digital streaming platform royalties',
      paymentMethod: 'Mobile Money',
      reference: 'RPY-2024-002'
    },
    {
      id: '3',
      date: '2023-12-15',
      amount: 2156.20,
      status: 'paid',
      source: 'Public Performance',
      period: 'Nov 2023',
      tracks: 15,
      description: 'Live performance and venue royalties',
      paymentMethod: 'Bank Transfer',
      reference: 'RPY-2023-156'
    },
    {
      id: '4',
      date: '2023-12-01',
      amount: 1875.30,
      status: 'paid',
      source: 'Radio Stations',
      period: 'Nov 2023',
      tracks: 10,
      description: 'Monthly radio broadcast royalties',
      paymentMethod: 'Bank Transfer',
      reference: 'RPY-2023-145'
    }
  ],
  monthlyTrends: [
    { month: 'Jul', amount: 1450.00, status: 'paid' },
    { month: 'Aug', amount: 1680.00, status: 'paid' },
    { month: 'Sep', amount: 1920.00, status: 'paid' },
    { month: 'Oct', amount: 2150.00, status: 'paid' },
    { month: 'Nov', amount: 2340.00, status: 'paid' },
    { month: 'Dec', amount: 1890.75, status: 'paid' },
    { month: 'Jan', amount: 2340.50, status: 'pending' }
  ],
  topEarningTracks: [
    { title: 'Ghana Na Woti', earnings: 8750.00, plays: 450000, trend: 15.2 },
    { title: 'Terminator', earnings: 6240.00, plays: 320000, trend: -3.1 },
    { title: 'Perfect Combi', earnings: 5460.00, plays: 280000, trend: 8.7 },
    { title: 'Paris', earnings: 3841.50, plays: 197000, trend: 12.3 }
  ],
  revenueBySource: [
    { source: 'Radio Broadcast', amount: 18750.00, percentage: 80.0, icon: '📻', color: 'blue' },
    { source: 'Digital Streaming', amount: 3750.00, percentage: 16.0, icon: '🎵', color: 'green' },
    { source: 'Live Performance', amount: 975.50, percentage: 4.0, icon: '🎤', color: 'purple' }
  ]
};

const RoyaltyPayments: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutFormData, setPayoutFormData] = useState({
    amount: paymentData.overview.pendingPayments.toString(),
    paymentMethod: 'bank_transfer',
    notes: ''
  });

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <>
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <PiggyBank className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Royalty Payments</h1>
                  <p className="text-gray-600 dark:text-gray-300 font-light">
                    Track your earnings and manage royalty distributions
                  </p>
                </div>
              </div>

              {/* Quick Stats in Header */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(paymentData.overview.totalEarnings)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(paymentData.overview.pendingPayments)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {paymentData.overview.totalTransactions}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Transactions</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Wallet className="w-4 h-4" />
                <span>Request Payout</span>
              </button>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Periods</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <button className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Payment Status Cards - Large Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paymentData.paymentStatus.map((status) => (
            <div key={status.status} className={`relative bg-gradient-to-br ${status.bgColor} dark:bg-gradient-to-br dark:from-slate-800/90 dark:via-slate-700/80 dark:to-slate-800/90 rounded-2xl p-8 border border-gray-200/50 dark:border-slate-600/60 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 bg-gradient-to-br ${status.color} rounded-xl shadow-lg`}>
                  <status.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {status.count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {status.percentage}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                  {status.status}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {status.description}
                </p>
                <div className="pt-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(status.amount)}
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <status.icon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Payment History Cards */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Payments</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {paymentData.recentPayments.map((payment) => (
                  <div key={payment.id} className="bg-gray-50/80 dark:bg-slate-800/60 rounded-xl p-6 border border-gray-200/60 dark:border-slate-600/60 hover:bg-gray-100/50 dark:hover:bg-slate-800/80 hover:shadow-lg transition-all duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 bg-gradient-to-br ${payment.status === 'paid' ? 'from-green-500 to-emerald-500' : payment.status === 'pending' ? 'from-amber-500 to-orange-500' : 'from-red-500 to-pink-500'} rounded-xl shadow-lg`}>
                          <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {payment.description}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(payment.date)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Music className="w-4 h-4" />
                              <span>{payment.tracks} tracks</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Building className="w-4 h-4" />
                              <span>{payment.source}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Reference: {payment.reference} • Period: {payment.period}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1.5 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors duration-200">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Revenue Breakdown & Quick Actions */}
          <div className="space-y-6">
            {/* Revenue Sources */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Sources</h3>
              <div className="space-y-4">
                {paymentData.revenueBySource.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/80 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{source.icon}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {source.source}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {source.percentage}% of total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(source.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Earning Tracks */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Earning Tracks</h3>
              <div className="space-y-3">
                {paymentData.topEarningTracks.map((track, index) => (
                  <div key={track.title} className="flex items-center space-x-3 p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/80 transition-colors duration-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {track.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{track.plays.toLocaleString()} plays</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(track.trend)}
                          <span>{Math.abs(track.trend)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 dark:text-green-400 text-sm">
                        {formatCurrency(track.earnings)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Calculator className="w-5 h-5" />
                  <span>Calculate Royalties</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-white/60 dark:bg-slate-800/60 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/60 dark:border-slate-600/60 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <Settings className="w-5 h-5" />
                  <span>Payment Settings</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-white/60 dark:bg-slate-800/60 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/60 dark:border-slate-600/60 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <FileText className="w-5 h-5" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Next Payout Alert */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Next Payout Scheduled
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Your next payment of <span className="font-bold">{formatCurrency(paymentData.overview.nextPayoutAmount)}</span> is scheduled for <span className="font-bold">{formatDate(paymentData.overview.nextPayoutDate)}</span>
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
              View Details
            </button>
          </div>
        </div>

        {/* Monthly Trends Chart Placeholder */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Trends</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Paid</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center bg-gray-50/50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Monthly Payment Trends</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Interactive chart showing payment trends over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request Payout</h2>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Available Balance */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(paymentData.overview.pendingPayments)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payout Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₵</span>
                  <input
                    type="number"
                    value={payoutFormData.amount}
                    onChange={(e) => setPayoutFormData({ ...payoutFormData, amount: e.target.value })}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                    max={paymentData.overview.pendingPayments}
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum: {formatCurrency(paymentData.overview.pendingPayments)}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={payoutFormData.paymentMethod}
                  onChange={(e) => setPayoutFormData({ ...payoutFormData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="paypal">PayPal</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={payoutFormData.notes}
                  onChange={(e) => setPayoutFormData({ ...payoutFormData, notes: e.target.value })}
                  rows={3}
                  placeholder="Add any notes for this payout request..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Processing Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Processing Information</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Payout requests are typically processed within 3-5 business days. You'll receive a confirmation email once processed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would make an API call to request payout
                    alert(`Payout request for ${formatCurrency(parseFloat(payoutFormData.amount))} submitted successfully!`);
                    setPayoutFormData({
                      amount: paymentData.overview.pendingPayments.toString(),
                      paymentMethod: 'bank_transfer',
                      notes: ''
                    });
                    setIsPayoutModalOpen(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Request Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoyaltyPayments;
