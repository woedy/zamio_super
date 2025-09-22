import { useCallback, useEffect, useState } from 'react';
import { 
  Activity, Search, Eye, Filter, Plus, AlertCircle, Clock, 
  CheckCircle, XCircle, User, Calendar, ArrowUpDown 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { disputeService, Dispute, DisputeFilters, DisputeChoices } from '../../services/disputeService';

export default function DisputesList() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choices, setChoices] = useState<DisputeChoices | null>(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState<DisputeFilters>({
    page: 1,
    page_size: 20,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await disputeService.getDisputes(filters);
      setDisputes(response.results);
      setTotalCount(response.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchChoices = useCallback(async () => {
    try {
      const choicesData = await disputeService.getChoices();
      setChoices(choicesData);
    } catch (err) {
      console.error('Failed to load choices:', err);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  useEffect(() => {
    fetchChoices();
  }, [fetchChoices]);

  const handleFilterChange = (key: keyof DisputeFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to page 1 when changing filters
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'under_review':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'escalated':
        return <ArrowUpDown className="w-4 h-4 text-orange-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(totalCount / (filters.page_size || 20));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dispute Resolution System</h1>
                <p className="text-gray-300 text-sm">Manage and resolve platform disputes</p>
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Search and Quick Stats */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search disputes..."
                className="bg-white/10 text-white pl-10 pr-4 py-2 rounded-lg border border-white/20 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="text-sm text-gray-300">
              {totalCount} total disputes
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Statuses</option>
                    {choices?.dispute_statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Types</option>
                    {choices?.dispute_types.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    value={filters.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Priorities</option>
                    {choices?.dispute_priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-2 text-gray-300">Loading disputes...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase bg-white/5 text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Dispute ID</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Submitted By</th>
                      <th className="px-6 py-4">Assigned To</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4">Days Open</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/5 divide-y divide-white/10">
                    {disputes.length > 0 ? disputes.map((dispute) => (
                      <tr key={dispute.dispute_id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <code className="text-xs bg-white/10 px-2 py-1 rounded">
                            {dispute.dispute_id.slice(0, 8)}...
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{dispute.title}</div>
                          {dispute.related_track_info && (
                            <div className="text-xs text-gray-400 mt-1">
                              Track: {dispute.related_track_info.title}
                            </div>
                          )}
                          {dispute.related_station_info && (
                            <div className="text-xs text-gray-400 mt-1">
                              Station: {dispute.related_station_info.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize">{dispute.dispute_type.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(dispute.status)}`}>
                            {getStatusIcon(dispute.status)}
                            {dispute.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-white">{dispute.submitted_by.username}</div>
                              <div className="text-xs text-gray-400">{dispute.submitted_by.user_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {dispute.assigned_to ? (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-white">{dispute.assigned_to.username}</div>
                                <div className="text-xs text-gray-400">{dispute.assigned_to.user_type}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div className="text-xs">
                              {formatDate(dispute.created_at)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${dispute.days_open > 30 ? 'text-red-400' : dispute.days_open > 14 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {dispute.days_open}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/disputes/${dispute.dispute_id}`}
                              className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                            {dispute.evidence_count > 0 && (
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                {dispute.evidence_count} evidence
                              </span>
                            )}
                            {dispute.comments_count > 0 && (
                              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                {dispute.comments_count} comments
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td className="px-6 py-12 text-center text-gray-400" colSpan={10}>
                          No disputes found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm text-gray-300">
                    Showing {((filters.page || 1) - 1) * (filters.page_size || 20) + 1} to{' '}
                    {Math.min((filters.page || 1) * (filters.page_size || 20), totalCount)} of {totalCount} disputes
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={(filters.page || 1) <= 1}
                      onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                      className="bg-white/10 text-white px-3 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-white px-3 py-2">
                      Page {filters.page || 1} of {totalPages}
                    </span>
                    <button
                      disabled={(filters.page || 1) >= totalPages}
                      onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                      className="bg-white/10 text-white px-3 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

