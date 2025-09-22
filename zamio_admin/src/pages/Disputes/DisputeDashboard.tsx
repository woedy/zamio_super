import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, AlertCircle, CheckCircle, Clock, XCircle,
  TrendingUp, Users, FileText, ArrowUpDown, Plus, Eye
} from 'lucide-react';
import { disputeService, DisputeStats, Dispute } from '../../services/disputeService';

export default function DisputeDashboard() {
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [recentDisputes, setRecentDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [statsData, disputesData] = await Promise.all([
          disputeService.getStats(),
          disputeService.getDisputes({ page_size: 5 })
        ]);
        
        setStats(statsData);
        setRecentDisputes(disputesData.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'under_review':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'escalated':
        return <ArrowUpDown className="w-5 h-5 text-orange-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'under_review':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'escalated':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dispute Resolution Dashboard</h1>
                <p className="text-gray-300 text-sm">Overview of platform disputes and resolution metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/disputes/create"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Dispute
              </Link>
              <Link
                to="/disputes"
                className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View All
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Disputes</p>
                <p className="text-2xl font-bold">{stats?.total_disputes || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Open Disputes</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.open_disputes || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-400">{stats?.resolved_disputes || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Resolution Time</p>
                <p className="text-2xl font-bold">{stats?.average_resolution_time || 0} days</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-6">Disputes by Status</h3>
            <div className="space-y-4">
              {stats?.by_status && Object.entries(stats.by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{count}</span>
                    <div className="w-20 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${((count as number) / (stats.total_disputes || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Type Distribution */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-6">Disputes by Type</h3>
            <div className="space-y-4">
              {stats?.by_type && Object.entries(stats.by_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{count}</span>
                    <div className="w-20 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${((count as number) / (stats.total_disputes || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-6">Disputes by Priority</h3>
            <div className="space-y-4">
              {stats?.by_priority && Object.entries(stats.by_priority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className="capitalize">{priority}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{count}</span>
                    <div className="w-20 bg-white/10 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${((count as number) / (stats.total_disputes || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Disputes */}
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Disputes</h3>
              <Link
                to="/disputes"
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
              >
                View All
                <Eye className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentDisputes.map((dispute) => (
                <div key={dispute.dispute_id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium truncate">{dispute.title}</div>
                    <div className="text-sm text-gray-400">
                      By {dispute.submitted_by.username} • {formatDate(dispute.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(dispute.status)}`}>
                      {getStatusIcon(dispute.status)}
                      {dispute.status.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/disputes/${dispute.dispute_id}`}
                      className="text-cyan-300 hover:text-cyan-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
              {recentDisputes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No recent disputes found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Chart */}
        {stats?.recent_activity && stats.recent_activity.length > 0 && (
          <div className="mt-8 bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-6">Recent Activity (Last 7 Days)</h3>
            <div className="flex items-end gap-2 h-32">
              {stats.recent_activity.map((activity, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-purple-500 rounded-t w-full min-h-[4px]"
                    style={{
                      height: `${(activity.count / Math.max(...stats.recent_activity.map(a => a.count))) * 100}%`
                    }}
                  />
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(activity.created_at__date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs font-medium">{activity.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}