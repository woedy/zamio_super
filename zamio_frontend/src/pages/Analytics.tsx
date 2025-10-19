import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Play,
  Users,
  Globe,
  Music,
  Calendar,
  MapPin,
  Award,
  Target,
  Filter,
  Download,
  Share2,
  RefreshCw,
  Eye,
  Heart,
  Clock,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronLeft,
  ChevronRight,
  Search,
  Table,
  Grid,
  List
} from 'lucide-react';

// Mock analytics data
const analyticsData = {
  overview: {
    totalPlays: 1247000,
    totalRevenue: 23475.50,
    totalTracks: 12,
    totalAlbums: 5,
    activeListeners: 45670,
    growthRate: 12.5,
    previousPeriodGrowth: -2.1
  },
  monthlyPerformance: [
    { month: 'Jan', plays: 95000, revenue: 1425.00, listeners: 12500 },
    { month: 'Feb', plays: 102000, revenue: 1530.00, listeners: 13400 },
    { month: 'Mar', plays: 118000, revenue: 1770.00, listeners: 15200 },
    { month: 'Apr', plays: 125000, revenue: 1875.00, listeners: 16800 },
    { month: 'May', plays: 134000, revenue: 2010.00, listeners: 18200 },
    { month: 'Jun', plays: 145000, revenue: 2175.00, listeners: 19800 },
    { month: 'Jul', plays: 152000, revenue: 2280.00, listeners: 21400 },
    { month: 'Aug', plays: 168000, revenue: 2520.00, listeners: 23500 },
    { month: 'Sep', plays: 175000, revenue: 2625.00, listeners: 25600 },
    { month: 'Oct', plays: 189000, revenue: 2835.00, listeners: 27800 },
    { month: 'Nov', plays: 203000, revenue: 3045.00, listeners: 30200 },
    { month: 'Dec', plays: 215000, revenue: 3225.00, listeners: 32500 }
  ],
  topTracks: [
    { title: 'Ghana Na Woti', plays: 450000, revenue: 8750.00, growth: 15.2, listeners: 15600, avgPlayTime: 3.2 },
    { title: 'Terminator', plays: 320000, revenue: 6240.00, growth: -3.1, listeners: 12400, avgPlayTime: 2.8 },
    { title: 'Perfect Combi', plays: 280000, revenue: 5460.00, growth: 8.7, listeners: 10800, avgPlayTime: 3.5 },
    { title: 'Paris', plays: 197000, revenue: 3841.50, growth: 12.3, listeners: 8900, avgPlayTime: 2.9 },
    { title: 'Angela', plays: 156000, revenue: 3039.00, growth: -1.2, listeners: 7200, avgPlayTime: 3.1 }
  ],
  geographicPerformance: [
    { region: 'Greater Accra', plays: 567000, percentage: 45.5, revenue: 11340.00, listeners: 18900, avgRevenuePerListener: 0.60 },
    { region: 'Ashanti', plays: 312000, percentage: 25.0, revenue: 6240.00, listeners: 12400, avgRevenuePerListener: 0.50 },
    { region: 'Western', plays: 187000, percentage: 15.0, revenue: 3740.00, listeners: 8900, avgRevenuePerListener: 0.42 },
    { region: 'Central', plays: 124000, percentage: 9.9, revenue: 2480.00, listeners: 6200, avgRevenuePerListener: 0.40 },
    { region: 'Other Regions', plays: 57000, percentage: 4.6, revenue: 1140.00, listeners: 3800, avgRevenuePerListener: 0.30 }
  ],
  revenueBySource: [
    { source: 'Radio Stations', amount: 18750.00, percentage: 80.0, plays: 562500, avgPerPlay: 0.033 },
    { source: 'Streaming', amount: 3750.00, percentage: 16.0, plays: 562500, avgPerPlay: 0.0067 },
    { source: 'Public Performance', amount: 975.50, percentage: 4.0, plays: 124000, avgPerPlay: 0.0079 }
  ],
  recentActivity: [
    { action: 'Track played on Joy FM', time: '2 minutes ago', plays: 1, revenue: 0.03, location: 'Accra' },
    { action: 'Album purchased', time: '15 minutes ago', revenue: 12.50, location: 'Kumasi' },
    { action: 'Track shared on social media', time: '1 hour ago', plays: 45, revenue: 1.35, location: 'Takoradi' },
    { action: 'New follower', time: '2 hours ago', followers: 1, location: 'Cape Coast' },
    { action: 'Playlist added', time: '3 hours ago', plays: 120, revenue: 3.60, location: 'Accra' }
  ],
  trackDetails: [
    { title: 'Ghana Na Woti', plays: 450000, revenue: 8750.00, listeners: 15600, avgPlayTime: 3.2, completionRate: 78.5, skipRate: 12.3 },
    { title: 'Terminator', plays: 320000, revenue: 6240.00, listeners: 12400, avgPlayTime: 2.8, completionRate: 65.2, skipRate: 18.7 },
    { title: 'Perfect Combi', plays: 280000, revenue: 5460.00, listeners: 10800, avgPlayTime: 3.5, completionRate: 82.1, skipRate: 9.8 },
    { title: 'Paris', plays: 197000, revenue: 3841.50, listeners: 8900, avgPlayTime: 2.9, completionRate: 71.4, skipRate: 15.6 },
    { title: 'Angela', plays: 156000, revenue: 3039.00, listeners: 7200, avgPlayTime: 3.1, completionRate: 69.8, skipRate: 17.2 }
  ]
};

const Analytics: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('12months');
  const [selectedMetric, setSelectedMetric] = useState('plays');
  const [selectedView, setSelectedView] = useState<'charts' | 'tables'>('charts');
  const [sortBy, setSortBy] = useState<'plays' | 'revenue' | 'growth'>('plays');

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString()}`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600 dark:text-green-400';
    if (growth < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <>
      {/* Enhanced Page header */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Comprehensive data analysis and performance insights
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="3months">Last 3 months</option>
                <option value="12months">Last 12 months</option>
              </select>

              <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                    selectedView === 'charts' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setSelectedView('charts')}
                >
                  <Grid className="w-4 h-4 inline mr-1" />
                  Charts
                </button>
                <button
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                    selectedView === 'tables' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setSelectedView('tables')}
                >
                  <Table className="w-4 h-4 inline mr-1" />
                  Tables
                </button>
              </div>

              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Performance Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Performance Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Performance Trends</h2>
              <div className="flex items-center space-x-2">
                <button className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                  selectedMetric === 'plays' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`} onClick={() => setSelectedMetric('plays')}>
                  Plays
                </button>
                <button className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                  selectedMetric === 'revenue' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`} onClick={() => setSelectedMetric('revenue')}>
                  Revenue
                </button>
                <button className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                  selectedMetric === 'listeners' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`} onClick={() => setSelectedMetric('listeners')}>
                  Listeners
                </button>
              </div>
            </div>

            <div className="h-80 flex items-center justify-center bg-gray-50/50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedMetric === 'plays' ? 'Monthly Plays Trend Chart' : selectedMetric === 'revenue' ? 'Monthly Revenue Trend Chart' : 'Monthly Listeners Trend Chart'}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Interactive chart showing {selectedMetric} trends over time
                </p>
              </div>
            </div>
          </div>

          {/* Geographic Performance Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Geographic Performance Distribution</h2>
            <div className="h-80 flex items-center justify-center bg-gray-50/50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
              <div className="text-center">
                <PieChart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Regional Performance Chart</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Interactive pie chart showing plays by region
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Sources Breakdown */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Sources Analysis</h2>
            <div className="space-y-4">
              {analyticsData.revenueBySource.map((source) => (
                <div key={source.source} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {source.source}
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(source.amount)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {source.percentage}% of total
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatNumber(source.plays)} plays</span>
                    <span>₵{source.avgPerPlay.toFixed(3)} per play</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track Performance Table */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Track Performance Metrics</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'plays' | 'revenue' | 'growth')}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="plays">Sort by Plays</option>
                <option value="revenue">Sort by Revenue</option>
                <option value="growth">Sort by Growth</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Track</th>
                    <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Plays</th>
                    <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Revenue</th>
                    <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Growth</th>
                    <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Listeners</th>
                  </tr>
                </thead>
                <tbody>
                  {[...analyticsData.topTracks]
                    .sort((a, b) => {
                      switch (sortBy) {
                        case 'revenue': return b.revenue - a.revenue;
                        case 'growth': return b.growth - a.growth;
                        default: return b.plays - a.plays;
                      }
                    })
                    .map((track, index) => (
                    <tr key={track.title} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">{track.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-900 dark:text-white">
                        {formatNumber(track.plays)}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(track.revenue)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className={`flex items-center justify-end space-x-1 ${getGrowthColor(track.growth)}`}>
                          {getGrowthIcon(track.growth)}
                          <span className="font-medium">{Math.abs(track.growth)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-900 dark:text-white">
                        {formatNumber(track.plays * 0.035)} {/* Approximate listeners calculation */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detailed Tables Section */}
        {selectedView === 'tables' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Geographic Performance Table */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Regional Performance Details</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Region</th>
                        <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Plays</th>
                        <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Revenue</th>
                        <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Listeners</th>
                        <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Avg/Listener</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.geographicPerformance.map((region) => (
                        <tr key={region.region} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">{region.region}</td>
                          <td className="py-3 px-2 text-right text-gray-900 dark:text-white">{formatNumber(region.plays)}</td>
                          <td className="py-3 px-2 text-right font-medium text-green-600 dark:text-green-400">{formatCurrency(region.revenue)}</td>
                          <td className="py-3 px-2 text-right text-gray-900 dark:text-white">{formatNumber(region.listeners)}</td>
                          <td className="py-3 px-2 text-right text-gray-900 dark:text-white">₵{region.avgRevenuePerListener}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Track Analytics */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Track Analytics Details</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Track</th>
                        <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Completion</th>
                        <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Skip Rate</th>
                        <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Avg Play Time</th>
                        <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Engagement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.trackDetails.map((track) => (
                        <tr key={track.title} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">{track.title}</td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <div className="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${track.completionRate}%` }}
                                />
                              </div>
                              <span className="text-gray-900 dark:text-white text-xs">{track.completionRate}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right text-red-600 dark:text-red-400">{track.skipRate}%</td>
                          <td className="py-3 px-2 text-right text-gray-900 dark:text-white">{track.avgPlayTime}m</td>
                          <td className="py-3 px-2 text-right">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              track.completionRate > 75 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              track.completionRate > 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {track.completionRate > 75 ? 'High' : track.completionRate > 60 ? 'Medium' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Activity Log Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity Log</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Activity</th>
                      <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Time</th>
                      <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Location</th>
                      <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.recentActivity.map((activity, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-2 text-gray-900 dark:text-white">{activity.action}</td>
                        <td className="py-3 px-2 text-gray-500 dark:text-gray-400">{activity.time}</td>
                        <td className="py-3 px-2 text-gray-900 dark:text-white">{activity.location}</td>
                        <td className="py-3 px-2 text-right">
                          {activity.plays && (
                            <div className="text-blue-600 dark:text-blue-400 font-medium">
                              +{activity.plays} plays
                            </div>
                          )}
                          {activity.revenue && (
                            <div className="text-green-600 dark:text-green-400 font-medium">
                              +{formatCurrency(activity.revenue)}
                            </div>
                          )}
                          {activity.followers && (
                            <div className="text-purple-600 dark:text-purple-400 font-medium">
                              +{activity.followers} follower{activity.followers > 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Summary Statistics Cards (Charts View) */}
        {selectedView === 'charts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal text-gray-700 dark:text-slate-300">Total Plays</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {formatNumber(analyticsData.overview.totalPlays)}
                  </p>
                  <div className={`flex items-center space-x-1 text-xs ${getGrowthColor(analyticsData.overview.growthRate)}`}>
                    {getGrowthIcon(analyticsData.overview.growthRate)}
                    <span>{Math.abs(analyticsData.overview.growthRate)}% growth</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/60 dark:to-indigo-900/60 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50/90 to-green-50/90 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-slate-600/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal text-gray-700 dark:text-slate-300">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {formatCurrency(analyticsData.overview.totalRevenue)}
                  </p>
                  <div className={`flex items-center space-x-1 text-xs ${getGrowthColor(8.3)}`}>
                    {getGrowthIcon(8.3)}
                    <span>8.3% growth</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/60 dark:to-green-900/60 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50/90 to-pink-50/90 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-slate-600/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal text-gray-700 dark:text-slate-300">Active Listeners</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {formatNumber(analyticsData.overview.activeListeners)}
                  </p>
                  <div className={`flex items-center space-x-1 text-xs ${getGrowthColor(5.7)}`}>
                    {getGrowthIcon(5.7)}
                    <span>5.7% growth</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/60 dark:to-pink-900/60 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal text-gray-700 dark:text-slate-300">Total Tracks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {analyticsData.overview.totalTracks}
                  </p>
                  <div className={`flex items-center space-x-1 text-xs ${getGrowthColor(2.1)}`}>
                    {getGrowthIcon(2.1)}
                    <span>2.1% growth</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/60 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Analytics;
