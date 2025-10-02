import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
  Settings
} from 'lucide-react';
import { fireToast } from '../../../hooks/fireToast';
import { auditLogService, AuditLogEntry, AuditLogFilters } from '../../../services/auditLogService';

// Interfaces are now imported from auditLogService

const AuditLogViewer: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);
  
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    per_page: 50
  });

  const [pagination, setPagination] = useState({
    page_number: 1,
    per_page: 50,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_previous: false
  });

  // Load audit logs from backend API
  const loadAuditLogs = useCallback(async () => {
    try {
      const response = await auditLogService.getAuditLogs(filters);
      
      setAuditLogs(response.logs);
      setPagination({
        page_number: response.pagination.page,
        per_page: response.pagination.per_page,
        total_pages: response.pagination.total_pages,
        total_count: response.pagination.total_count,
        has_next: response.pagination.has_next,
        has_previous: response.pagination.has_previous
      });
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      fireToast('Failed to load audit logs', 'error');
    }
  }, [filters]);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadAuditLogs();
      fireToast('Audit logs refreshed successfully', 'success');
    } catch (error) {
      fireToast('Failed to refresh audit logs', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await loadAuditLogs();
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [loadAuditLogs]);

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      per_page: 50
    });
  };

  const handleViewLogDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('kyc')) return <Shield className="h-4 w-4" />;
    if (action.includes('login')) return <User className="h-4 w-4" />;
    if (action.includes('activate') || action.includes('deactivate')) return <Settings className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('deactivate')) return 'text-red-600';
    if (action.includes('create') || action.includes('activate')) return 'text-green-600';
    if (action.includes('update') || action.includes('kyc')) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return 'bg-gray-100 text-gray-800';
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 text-green-800';
    if (statusCode >= 400 && statusCode < 500) return 'bg-yellow-100 text-yellow-800';
    if (statusCode >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExport = async () => {
    try {
      const blob = await auditLogService.exportAuditLogs(filters);
      const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      auditLogService.downloadCsvFile(blob, filename);
      fireToast('Audit logs exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      fireToast('Failed to export audit logs', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Audit Log Viewer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor all system activities and user actions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions, users..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action Type
              </label>
              <select
                value={filters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="kyc">KYC Actions</option>
                <option value="user_activate">User Activation</option>
                <option value="user_deactivate">User Deactivation</option>
                <option value="bulk_operations">Bulk Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resource Type
              </label>
              <select
                value={filters.resource_type || ''}
                onChange={(e) => handleFilterChange('resource_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Resources</option>
                <option value="user">User</option>
                <option value="user_management">User Management</option>
                <option value="kyc">KYC</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Code
              </label>
              <select
                value={filters.status_code || ''}
                onChange={(e) => handleFilterChange('status_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="200">Success (200)</option>
                <option value="400">Bad Request (400)</option>
                <option value="403">Forbidden (403)</option>
                <option value="404">Not Found (404)</option>
                <option value="500">Server Error (500)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear all filters
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {pagination.total_count} entries found
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-lg mr-2">
                        {auditLogService.getResourceTypeIcon(log.resource_type)}
                      </div>
                      <div className="ml-1">
                        <div className={`text-sm font-medium inline-flex px-2 py-1 rounded-full ${auditLogService.getActionColor(log.action)}`}>
                          {auditLogService.formatAction(log.action)}
                        </div>
                        {log.trace_id && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Trace: {auditLogService.truncateText(log.trace_id, 8)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.user ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.user.first_name} {log.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {log.user.email}
                        </div>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {log.user.user_type}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {log.resource_type || 'N/A'}
                    </div>
                    {log.resource_id && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {log.resource_id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {log.status_code && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${auditLogService.getStatusCodeColor(log.status_code)}`}>
                        {log.status_code}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {auditLogService.formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewLogDetails(log)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {auditLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No audit logs found</p>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showLogDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Audit Log Details
              </h3>
              <button
                onClick={() => setShowLogDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Action</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</label>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedLog.user ? `${selectedLog.user.first_name} ${selectedLog.user.last_name} (${selectedLog.user.email})` : 'System'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IP Address</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedLog.ip_address || 'N/A'}</p>
                </div>
              </div>

              {selectedLog.request_data && Object.keys(selectedLog.request_data).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Data</label>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.request_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.response_data && Object.keys(selectedLog.response_data).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Data</label>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.response_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User Agent</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;