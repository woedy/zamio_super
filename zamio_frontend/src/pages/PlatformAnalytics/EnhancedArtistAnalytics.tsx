import React, { useEffect, useState } from 'react';
import {
  Music2,
  TrendingUp,
  Radio,
  DollarSign,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { TrendChart } from '../../components/analytics/TrendChart';
import { PieChart } from '../../components/analytics/PieChart';
import { BarChart } from '../../components/analytics/BarChart';
import { analyticsService, ArtistAnalytics, AnalyticsParams } from '../../services/analyticsService';
import { ChartContainer } from '../../components/charts/ChartContainer';

const EnhancedArtistAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<ArtistAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (params: AnalyticsParams = {}) => {
    try {
      setError(null);
      const data = await analyticsService.getArtistAnalytics(undefined, params);
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
        export_type: 'artist_analytics',
        export_format: format,
        parameters: { range: dateRange }
      });
      
      // You could show a toast notification here
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
  const trendData = analytics?.daily_trends.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    plays: day.plays,
    revenue: day.revenue,
  })) || [];

  const stationData = analytics?.station_performance.slice(0, 10).map(station => ({
    name: station.station__name,
    plays: station.play_count,
    revenue: station.revenue,
  })) || [];

  const regionData = analytics?.geographic_distribution.slice(0, 8).map(region => ({
    name: region.station__region || 'Unknown',
    value: region.play_count,
  })) || [];

  const topTracksData = analytics?.top_tracks.slice(0, 10).map(track => ({
    name: track.track__title,
    plays: track.play_count,
    revenue: track.revenue,
  })) || [];

  return (
    <div className="min-h-screen bg-whiten dark:bg-slate-950 text-black dark:text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Music2 className="text-indigo-500" />
              Artist Analytics
            </h1>
            {analytics && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {analytics.artist_info.stage_name} • {analytics.artist_info.total_tracks} tracks
                {analytics.artist_info.verified && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Verified
                  </span>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Plays"
            value={analytics?.summary.total_plays || 0}
            change={analytics?.summary.plays_trend}
            icon={TrendingUp}
            loading={loading}
          />
          <AnalyticsCard
            title="Total Revenue"
            value={`GHS ${analytics?.summary.total_revenue.toLocaleString() || '0'}`}
            change={analytics?.summary.revenue_trend}
            icon={DollarSign}
            loading={loading}
          />
          <AnalyticsCard
            title="Unique Stations"
            value={analytics?.summary.unique_stations || 0}
            icon={Radio}
            loading={loading}
          />
          <AnalyticsCard
            title="Avg Confidence"
            value={`${((analytics?.summary.avg_confidence_score || 0) * 100).toFixed(1)}%`}
            icon={Music2}
            loading={loading}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plays & Revenue Trend */}
          <ChartContainer
            title="Plays & Revenue Trends"
            description="Daily performance over selected period"
            className="col-span-1"
          >
            <TrendChart
              data={trendData}
              lines={[
                { key: 'plays', name: 'Plays', color: '#6366f1' },
                { key: 'revenue', name: 'Revenue (GHS)', color: '#10b981' },
              ]}
              height={300}
              loading={loading}
            />
          </ChartContainer>

          {/* Geographic Distribution */}
          <ChartContainer
            title="Geographic Distribution"
            description="Plays by region"
          >
            <PieChart
              data={regionData}
              height={300}
              loading={loading}
            />
          </ChartContainer>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Stations */}
          <ChartContainer
            title="Top Performing Stations"
            description="Stations with most plays"
          >
            <BarChart
              data={stationData}
              bars={[
                { key: 'plays', name: 'Plays', color: '#8b5cf6' },
              ]}
              height={300}
              horizontal={true}
              loading={loading}
            />
          </ChartContainer>

          {/* Top Tracks */}
          <ChartContainer
            title="Top Performing Tracks"
            description="Your most played tracks"
          >
            <BarChart
              data={topTracksData}
              bars={[
                { key: 'plays', name: 'Plays', color: '#f59e0b' },
              ]}
              height={300}
              horizontal={true}
              loading={loading}
            />
          </ChartContainer>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Station Performance Table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Radio className="text-blue-500" />
              Station Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">Station</th>
                    <th className="text-right py-2">Plays</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.station_performance.slice(0, 8).map((station, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <div>
                          <div className="font-medium">{station.station__name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {station.station__station_class}
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-2">{station.play_count.toLocaleString()}</td>
                      <td className="text-right py-2">GHS {station.revenue.toLocaleString()}</td>
                      <td className="text-right py-2">{(station.avg_confidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Tracks Table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Music2 className="text-green-500" />
              Top Tracks
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">Track</th>
                    <th className="text-right py-2">Plays</th>
                    <th className="text-right py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.top_tracks.slice(0, 8).map((track, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <div className="font-medium">{track.track__title}</div>
                      </td>
                      <td className="text-right py-2">{track.play_count.toLocaleString()}</td>
                      <td className="text-right py-2">GHS {track.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default EnhancedArtistAnalytics;