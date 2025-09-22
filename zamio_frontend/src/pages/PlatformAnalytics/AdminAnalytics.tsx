import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Activity,
  DollarSign,
  Radio,
  Music2,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { TrendChart } from '../../components/analytics/TrendChart';
import { PieChart } from '../../components/analytics/PieChart';
import { BarChart } from '../../components/analytics/BarChart';
import { analyticsService, AdminAnalytics, AnalyticsParams } from '../../services/analyticsService';
import { ChartContainer } from '../../components/charts/ChartContainer';

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (params: AnalyticsParams = {}) => {
    try {
      setError(null);
      const data = await analyticsService.getAdminAnalytics(params);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics({ range: dateRange });
  }, [dateRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics({ range: dateRange });
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await analyticsService.requestExport({
        export_type: 'admin_analytics',
        export_format: format,
        parameters: { range: dateRange }
      });
      
      console.log('Export requested:', response);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-whiten dark:bg-slate-950 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Analytics
            </h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => fetchAnalytics({ range: dateRange })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const dailyActivityData = analytics?.daily_activity.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    plays: day.plays,
    detections: day.detections,
    users: day.new_users,
    tracks: day.new_tracks,
  })) || [];

  const regionalData = analytics?.regional_performance.slice(0, 8).map(region => ({
    name: region.station__region || 'Unknown',
    value: region.plays,
    revenue: region.revenue,
  })) || [];

  const revenueDistributionData = analytics?.revenue_distribution.map(item => ({
    name: item.recipient_type.charAt(0).toUpperCase() + item.recipient_type.slice(1),
    value: item.total_amount,
  })) || [];

  const systemHealthScore = analytics ? (
    (analytics.period_summary.processing_success_rate +
     (analytics.detection_health.successful_detections / Math.max(analytics.detection_health.total_detections, 1)) * 100) / 2
  ) : 0;

  return (
    <div className="min-h-screen bg-whiten dark:bg-slate-950 text-black dark:text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="text-indigo-500" />
              Platform Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              System-wide performance and health monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 rounded-t-lg"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 rounded-b-lg"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <AnalyticsCard
            title="Total Users"
            value={analytics?.platform_overview.total_users || 0}
            icon={Users}
            loading={loading}
          />
          <AnalyticsCard
            title="Active Artists"
            value={analytics?.platform_overview.total_artists || 0}
            icon={Music2}
            loading={loading}
          />
          <AnalyticsCard
            title="Radio Stations"
            value={analytics?.platform_overview.total_stations || 0}
            icon={Radio}
            loading={loading}
          />
          <AnalyticsCard
            title="Publishers"
            value={analytics?.platform_overview.total_publishers || 0}
            icon={Building2}
            loading={loading}
          />
          <AnalyticsCard
            title="Total Tracks"
            value={analytics?.platform_overview.total_tracks || 0}
            icon={Music2}
            loading={loading}
          />
        </div>

        {/* Period Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Plays"
            value={analytics?.period_summary.total_plays || 0}
            icon={TrendingUp}
            loading={loading}
          />
          <AnalyticsCard
            title="Total Revenue"
            value={`GHS ${analytics?.period_summary.total_revenue.toLocaleString() || '0'}`}
            icon={DollarSign}
            loading={loading}
          />
          <AnalyticsCard
            title="Processing Success"
            value={`${analytics?.period_summary.processing_success_rate.toFixed(1) || '0.0'}%`}
            icon={CheckCircle}
            loading={loading}
          />
          <AnalyticsCard
            title="System Health"
            value={`${systemHealthScore.toFixed(1)}%`}
            icon={systemHealthScore >= 90 ? CheckCircle : systemHealthScore >= 70 ? AlertTriangle : AlertTriangle}
            loading={loading}
          />
        </div>

        {/* System Health Dashboard */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-blue-500" />
            System Health Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analytics?.detection_health.total_detections.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Detections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analytics?.detection_health.successful_detections.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {analytics?.detection_health.failed_detections.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {((analytics?.detection_health.avg_confidence_score || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity Trends */}
          <ChartContainer
            title="Daily Platform Activity"
            description="System activity over time"
            className="col-span-1"
          >
            <TrendChart
              data={dailyActivityData}
              lines={[
                { key: 'plays', name: 'Plays', color: '#6366f1' },
                { key: 'detections', name: 'Detections', color: '#10b981' },
                { key: 'users', name: 'New Users', color: '#f59e0b' },
                { key: 'tracks', name: 'New Tracks', color: '#8b5cf6' },
              ]}
              height={300}
              loading={loading}
            />
          </ChartContainer>

          {/* Revenue Distribution */}
          <ChartContainer
            title="Revenue Distribution by User Type"
            description="How revenue is distributed across user types"
          >
            <PieChart
              data={revenueDistributionData}
              height={300}
              loading={loading}
            />
          </ChartContainer>
        </div>

        {/* Regional Performance Chart */}
        <ChartContainer
          title="Regional Performance"
          description="Plays and revenue by region"
        >
          <BarChart
            data={regionalData}
            bars={[
              { key: 'value', name: 'Plays', color: '#8b5cf6' },
              { key: 'revenue', name: 'Revenue (GHS)', color: '#10b981' },
            ]}
            height={350}
            loading={loading}
          />
        </ChartContainer>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regional Performance Table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-500" />
              Regional Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">Region</th>
                    <th className="text-right py-2">Plays</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Stations</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.regional_performance.slice(0, 8).map((region, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <div className="font-medium">{region.station__region || 'Unknown'}</div>
                      </td>
                      <td className="text-right py-2">{region.plays.toLocaleString()}</td>
                      <td className="text-right py-2">GHS {region.revenue.toLocaleString()}</td>
                      <td className="text-right py-2">{region.unique_stations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Distribution Table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="text-yellow-500" />
              Revenue Distribution
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">User Type</th>
                    <th className="text-right py-2">Total Amount</th>
                    <th className="text-right py-2">Transactions</th>
                    <th className="text-right py-2">Avg Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.revenue_distribution.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <div className="font-medium capitalize">{item.recipient_type}</div>
                      </td>
                      <td className="text-right py-2">GHS {item.total_amount.toLocaleString()}</td>
                      <td className="text-right py-2">{item.count.toLocaleString()}</td>
                      <td className="text-right py-2">
                        GHS {(item.total_amount / Math.max(item.count, 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" />
            System Status & Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${
              systemHealthScore >= 90 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : systemHealthScore >= 70
                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {systemHealthScore >= 90 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
                <span className="font-medium">System Health</span>
              </div>
              <p className="text-sm mt-1">
                {systemHealthScore >= 90 
                  ? 'All systems operating normally'
                  : systemHealthScore >= 70
                  ? 'Minor issues detected'
                  : 'System issues require attention'
                }
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              (analytics?.period_summary.processing_success_rate || 0) >= 95
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Processing</span>
              </div>
              <p className="text-sm mt-1">
                {(analytics?.period_summary.processing_success_rate || 0) >= 95
                  ? 'Processing running smoothly'
                  : 'Processing performance below optimal'
                }
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              (analytics?.period_summary.active_stations || 0) > 0
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Stations</span>
              </div>
              <p className="text-sm mt-1">
                {analytics?.period_summary.active_stations || 0} stations active in selected period
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        {analytics && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Data from {new Date(analytics.date_range.start).toLocaleDateString()} to{' '}
            {new Date(analytics.date_range.end).toLocaleDateString()} •{' '}
            Last updated: {new Date(analytics.generated_at).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;