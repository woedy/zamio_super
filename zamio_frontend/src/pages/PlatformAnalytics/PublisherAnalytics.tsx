import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Music2,
  Award,
  Download,
  RefreshCw,
} from 'lucide-react';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { TrendChart } from '../../components/analytics/TrendChart';
import { PieChart } from '../../components/analytics/PieChart';
import { BarChart } from '../../components/analytics/BarChart';
import { analyticsService, PublisherAnalytics, AnalyticsParams } from '../../services/analyticsService';
import { ChartContainer } from '../../components/charts/ChartContainer';

const PublisherAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<PublisherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (params: AnalyticsParams = {}) => {
    try {
      setError(null);
      const data = await analyticsService.getPublisherAnalytics(undefined, params);
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
        export_type: 'publisher_analytics',
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
  const monthlyTrendData = analytics?.monthly_trends.map(month => ({
    date: month.month,
    plays: month.plays,
    revenue: month.revenue,
    artists: month.unique_artists,
  })) || [];

  const artistPerformanceData = analytics?.artist_performance.slice(0, 10).map(artist => ({
    name: artist.stage_name,
    plays: artist.plays,
    revenue: artist.revenue,
    tracks: artist.tracks_count,
  })) || [];

  const revenueDistributionData = analytics?.revenue_distribution.slice(0, 8).map(item => ({
    name: item.track__artist__stage_name,
    value: item.revenue,
  })) || [];

  return (
    <div className="min-h-screen bg-whiten dark:bg-slate-950 text-black dark:text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="text-indigo-500" />
              Publisher Analytics
            </h1>
            {analytics && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {analytics.publisher_info.company_name} • {analytics.publisher_info.total_artists} artists • {analytics.publisher_info.total_tracks} tracks
              </p>
            )}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <AnalyticsCard
            title="Total Plays"
            value={analytics?.portfolio_summary.total_plays || 0}
            icon={TrendingUp}
            loading={loading}
          />
          <AnalyticsCard
            title="Total Revenue"
            value={`GHS ${analytics?.portfolio_summary.total_revenue.toLocaleString() || '0'}`}
            icon={DollarSign}
            loading={loading}
          />
          <AnalyticsCard
            title="Active Artists"
            value={analytics?.publisher_info.total_artists || 0}
            icon={Users}
            loading={loading}
          />
          <AnalyticsCard
            title="Unique Tracks"
            value={analytics?.portfolio_summary.unique_tracks || 0}
            icon={Music2}
            loading={loading}
          />
          <AnalyticsCard
            title="Avg Revenue/Play"
            value={`GHS ${analytics?.portfolio_summary.avg_revenue_per_play.toFixed(2) || '0.00'}`}
            icon={Award}
            loading={loading}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <ChartContainer
            title="Monthly Performance Trends"
            description="Portfolio performance over time"
            className="col-span-1"
          >
            <TrendChart
              data={monthlyTrendData}
              lines={[
                { key: 'plays', name: 'Plays', color: '#6366f1' },
                { key: 'revenue', name: 'Revenue (GHS)', color: '#10b981' },
                { key: 'artists', name: 'Active Artists', color: '#f59e0b' },
              ]}
              height={300}
              loading={loading}
            />
          </ChartContainer>

          {/* Revenue Distribution */}
          <ChartContainer
            title="Revenue Distribution by Artist"
            description="Top revenue generating artists"
          >
            <PieChart
              data={revenueDistributionData}
              height={300}
              loading={loading}
            />
          </ChartContainer>
        </div>

        {/* Artist Performance Chart */}
        <ChartContainer
          title="Artist Performance Comparison"
          description="Plays and revenue by artist"
        >
          <BarChart
            data={artistPerformanceData}
            bars={[
              { key: 'plays', name: 'Plays', color: '#8b5cf6' },
              { key: 'revenue', name: 'Revenue (GHS)', color: '#10b981' },
            ]}
            height={350}
            loading={loading}
          />
        </ChartContainer>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Artist Performance Table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="text-blue-500" />
              Artist Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">Artist</th>
                    <th className="text-right py-2">Tracks</th>
                    <th className="text-right py-2">Plays</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Avg/Track</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.artist_performance.slice(0, 10).map((artist, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <div className="font-medium">{artist.stage_name}</div>
                      </td>
                      <td className="text-right py-2">{artist.tracks_count}</td>
                      <td className="text-right py-2">{artist.plays.toLocaleString()}</td>
                      <td className="text-right py-2">GHS {artist.revenue.toLocaleString()}</td>
                      <td className="text-right py-2">GHS {artist.avg_revenue_per_track.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Summary Table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-500" />
              Monthly Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">Month</th>
                    <th className="text-right py-2">Plays</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Artists</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.monthly_trends.slice(-6).map((month, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <div className="font-medium">{month.month}</div>
                      </td>
                      <td className="text-right py-2">{month.plays.toLocaleString()}</td>
                      <td className="text-right py-2">GHS {month.revenue.toLocaleString()}</td>
                      <td className="text-right py-2">{month.unique_artists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Portfolio Insights */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="text-purple-500" />
            Portfolio Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {analytics?.portfolio_summary.unique_stations || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stations Playing Your Artists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                GHS {((analytics?.portfolio_summary.total_revenue || 0) / Math.max(analytics?.publisher_info.total_artists || 1, 1)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Revenue per Artist</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {((analytics?.portfolio_summary.total_plays || 0) / Math.max(analytics?.portfolio_summary.unique_tracks || 1, 1)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Plays per Track</div>
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

export default PublisherAnalytics;