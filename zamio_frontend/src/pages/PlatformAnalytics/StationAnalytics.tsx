import React, { useEffect, useState } from 'react';
import {
  Radio,
  Activity,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { TrendChart } from '../../components/analytics/TrendChart';
import { PieChart } from '../../components/analytics/PieChart';
import { BarChart } from '../../components/analytics/BarChart';
import { analyticsService, StationAnalytics, AnalyticsParams } from '../../services/analyticsService';
import { ChartContainer } from '../../components/charts/ChartContainer';

const StationAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<StationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (params: AnalyticsParams = {}) => {
    try {
      setError(null);
      const data = await analyticsService.getStationAnalytics(undefined, params);
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
        export_type: 'station_analytics',
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
  const complianceData = analytics?.daily_compliance.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    submitted: day.submitted_plays,
    detected: day.detected_plays,
    compliance: day.compliance_rate,
  })) || [];

  const hourlyData = analytics?.hourly_distribution.map(hour => ({
    name: `${hour.hour}:00`,
    plays: hour.plays,
  })) || [];

  const topTracksData = analytics?.top_tracks.slice(0, 10).map(track => ({
    name: `${track.track__title} - ${track.track__artist__stage_name}`,
    plays: track.play_count,
    confidence: track.avg_confidence * 100,
  })) || [];

  const detectionSourceData = analytics ? [
    { name: 'Local Detection', value: analytics.detection_metrics.detection_source_breakdown.local },
    { name: 'ACRCloud', value: analytics.detection_metrics.detection_source_breakdown.acrcloud },
  ] : [];

  const getStationClassColor = (stationClass: string) => {
    switch (stationClass) {
      case 'class_a': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'class_b': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'class_c': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'online': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-whiten dark:bg-slate-950 text-black dark:text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Radio className="text-indigo-500" />
              Station Analytics
            </h1>
            {analytics && (
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600 dark:text-gray-400">
                  {analytics.station_info.name} • {analytics.station_info.city}, {analytics.station_info.region}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStationClassColor(analytics.station_info.station_class)}`}>
                  {analytics.station_info.station_class.replace('_', ' ').toUpperCase()}
                </span>
              </div>
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
            title="Total Plays Submitted"
            value={analytics?.summary.total_plays || 0}
            icon={Activity}
            loading={loading}
          />
          <AnalyticsCard
            title="Detection Accuracy"
            value={`${analytics?.summary.detection_accuracy_rate.toFixed(1) || '0.0'}%`}
            icon={Target}
            loading={loading}
          />
          <AnalyticsCard
            title="Avg Confidence Score"
            value={`${((analytics?.summary.avg_confidence_score || 0) * 100).toFixed(1)}%`}
            icon={CheckCircle}
            loading={loading}
          />
          <AnalyticsCard
            title="Unique Tracks"
            value={analytics?.summary.unique_tracks || 0}
            icon={Zap}
            loading={loading}
          />
        </div>

        {/* Detection Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Detections
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.detection_metrics.total_detections.toLocaleString() || '0'}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  High Confidence
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.detection_metrics.high_confidence_detections.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {analytics ? ((analytics.detection_metrics.high_confidence_detections / Math.max(analytics.detection_metrics.total_detections, 1)) * 100).toFixed(1) : '0'}% of total
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Avg Detection Confidence
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {((analytics?.detection_metrics.avg_detection_confidence || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Trends */}
          <ChartContainer
            title="Daily Compliance Tracking"
            description="Submitted vs detected plays over time"
          >
            <TrendChart
              data={complianceData}
              lines={[
                { key: 'submitted', name: 'Submitted Plays', color: '#6366f1' },
                { key: 'detected', name: 'Detected Plays', color: '#10b981' },
                { key: 'compliance', name: 'Compliance Rate (%)', color: '#f59e0b' },
              ]}
              height={300}
              loading={loading}
            />
          </ChartContainer>

          {/* Detection Source Breakdown */}
          <ChartContainer
            title="Detection Source Breakdown"
            description="Local vs ACRCloud detections"
          >
            <PieChart
              data={detectionSourceData}
              height={300}
              loading={loading}
            />
          </ChartContainer>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Distribution */}
          <ChartContainer
            title="Hourly Play Distribution"
            description="Peak hours analysis"
          >
            <BarChart
              data={hourlyData}
              bars={[
                { key: 'plays', name: 'Plays', color: '#8b5cf6' },
              ]}
              height={300}
              loading={loading}
            />
          </ChartContainer>

          {/* Top Tracks */}
          <ChartContainer
            title="Most Played Tracks"
            description="Top tracks by play count"
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
          {/* Top Tracks Table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-yellow-500" />
              Top Played Tracks
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">Track</th>
                    <th className="text-left py-2">Artist</th>
                    <th className="text-right py-2">Plays</th>
                    <th className="text-right py-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.top_tracks.slice(0, 8).map((track, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <div className="font-medium">{track.track__title}</div>
                      </td>
                      <td className="py-2">
                        <div className="text-gray-600 dark:text-gray-400">{track.track__artist__stage_name}</div>
                      </td>
                      <td className="text-right py-2">{track.play_count.toLocaleString()}</td>
                      <td className="text-right py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          track.avg_confidence >= 0.8 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : track.avg_confidence >= 0.6
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {(track.avg_confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Summary Table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              Recent Compliance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">Date</th>
                    <th className="text-right py-2">Submitted</th>
                    <th className="text-right py-2">Detected</th>
                    <th className="text-right py-2">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.daily_compliance.slice(-8).map((day, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">
                        <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                      </td>
                      <td className="text-right py-2">{day.submitted_plays}</td>
                      <td className="text-right py-2">{day.detected_plays}</td>
                      <td className="text-right py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          day.compliance_rate >= 80 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : day.compliance_rate >= 60
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {day.compliance_rate.toFixed(1)}%
                        </span>
                      </td>
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

export default StationAnalytics;