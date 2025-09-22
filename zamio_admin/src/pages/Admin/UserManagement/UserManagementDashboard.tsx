import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Activity,
  Plus,
  MoreVertical,
  RefreshCw,
  FileText,
  Settings,
  Ban,
  Unlock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  userManagementService, 
  User, 
  UserManagementOverview, 
  UserFilters,
  PaginatedUsers 
} from '../../../services/userManagementService';
import Pagination from '../../../components/Pagination';
import { fireToast } from '../../../hooks/fireToast';

const UserManagementDashboard: React.FC = () => {
  const [overview, setOverview] = useState<UserManagementOverview | null>(null);
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    per_page: 20,
    order_by: '-timestamp'
  });

  // Modal states
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [kycForm, setKycForm] = useState({
    kyc_status: '',
    rejection_reason: '',
    admin_notes: ''
  });
  const [statusForm, setStatusForm] = useState({
    action: '',
    reason: '',
    suspension_duration: ''
  });

  // Load data
  const loadOverview = useCallback(async () => {
    try {
      const data = await userManagementService.getOverview();
      setOverview(data);
    } catch (error) {
      console.error('Failed to load overview:', error);
      fireToast('Failed to load overview data', 'error');
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await userManagementService.getAllUsers(filters);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      fireToast('Failed to load users', 'error');
    }
  }, [filters]);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadOverview(), loadUsers()]);
      fireToast('Data refreshed successfully', 'success');
    } catch (error) {
      fireToast('Failed to refresh data', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadOverview(), loadUsers()]);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [loadOverview, loadUsers]);

  // Filter handlers
  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      per_page: 20,
      order_by: '-timestamp'
    });
  };

  // Selection handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (!users) return;
    
    const allUserIds = users.users.map(user => user.user_id);
    setSelectedUsers(prev => 
      prev.length === allUserIds.length ? [] : allUserIds
    );
  };

  // Action handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleKycAction = (user: User) => {
    setSelectedUser(user);
    setKycForm({
      kyc_status: user.kyc_status,
      rejection_reason: '',
      admin_notes: ''
    });
    setShowKycModal(true);
  };

  const handleStatusAction = (user: User) => {
    setSelectedUser(user);
    setStatusForm({
      action: user.is_active ? 'deactivate' : 'activate',
      reason: '',
      suspension_duration: ''
    });
    setShowStatusModal(true);
  };

  const submitKycUpdate = async () => {
    if (!selectedUser) return;

    try {
      await userManagementService.updateKycStatus({
        user_id: selectedUser.user_id,
        kyc_status: kycForm.kyc_status as any,
        rejection_reason: kycForm.rejection_reason,
        admin_notes: kycForm.admin_notes
      });
      
      fireToast('KYC status updated successfully', 'success');
      setShowKycModal(false);
      await loadUsers();
    } catch (error) {
      fireToast('Failed to update KYC status', 'error');
    }
  };

  const submitStatusUpdate = async () => {
    if (!selectedUser) return;

    try {
      await userManagementService.updateUserStatus({
        user_id: selectedUser.user_id,
        action: statusForm.action as any,
        reason: statusForm.reason,
        suspension_duration: statusForm.suspension_duration ? parseInt(statusForm.suspension_duration) : undefined
      });
      
      fireToast('User status updated successfully', 'success');
      setShowStatusModal(false);
      await loadUsers();
    } catch (error) {
      fireToast('Failed to update user status', 'error');
    }
  };

  const handleBulkExport = async () => {
    if (selectedUsers.length === 0) {
      fireToast('Please select users to export', 'warning');
      return;
    }

    try {
      const result = await userManagementService.bulkUserOperations({
        user_ids: selectedUsers,
        operation: 'export'
      });

      if (result instanceof Blob) {
        const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        userManagementService.downloadCsvFile(result, filename);
        fireToast(`${selectedUsers.length} users exported successfully`, 'success');
        setSelectedUsers([]);
      }
    } catch (error) {
      fireToast('Failed to export users', 'error');
    }
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.length === 0) {
      fireToast('Please select users to activate', 'warning');
      return;
    }

    try {
      await userManagementService.bulkUserOperations({
        user_ids: selectedUsers,
        operation: 'activate'
      });
      
      fireToast('Users activated successfully', 'success');
      setSelectedUsers([]);
      await loadUsers();
    } catch (error) {
      fireToast('Failed to activate users', 'error');
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) {
      fireToast('Please select users to deactivate', 'warning');
      return;
    }

    try {
      await userManagementService.bulkUserOperations({
        user_ids: selectedUsers,
        operation: 'deactivate'
      });
      
      fireToast('Users deactivated successfully', 'success');
      setSelectedUsers([]);
      await loadUsers();
    } catch (error) {
      fireToast('Failed to deactivate users', 'error');
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
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts, KYC approvals, and platform access
          </p>
        </div>
        <div className="flex items-center space-x-3">
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

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overview.user_stats.total_users.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">
                +{overview.recent_stats.new_registrations}
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">this month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">KYC Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {overview.kyc_stats.pending.toLocaleString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 font-medium">
                {overview.kyc_stats.verified} verified
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {overview.account_stats.active.toLocaleString()}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {Math.round((overview.account_stats.active / overview.user_stats.total_users) * 100)}% of total
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {overview.recent_stats.active_users.toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">last 30 days</span>
            </div>
          </div>
        </div>
      )}

      {/* User Type Distribution */}
      {overview && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Distribution by Type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overview.user_stats.artists}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Artists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overview.user_stats.publishers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Publishers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{overview.user_stats.stations}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overview.user_stats.admins}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Admins</div>
            </div>
          </div>
        </div>
      )}

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
                  placeholder="Search users..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Type
              </label>
              <select
                value={filters.user_type || ''}
                onChange={(e) => handleFilterChange('user_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="Artist">Artists</option>
                <option value="Publisher">Publishers</option>
                <option value="Station">Stations</option>
                <option value="Admin">Admins</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                KYC Status
              </label>
              <select
                value={filters.kyc_status || ''}
                onChange={(e) => handleFilterChange('kyc_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Status
              </label>
              <select
                value={filters.account_status || ''}
                onChange={(e) => handleFilterChange('account_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Accounts</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="email_verified">Email Verified</option>
                <option value="profile_incomplete">Profile Incomplete</option>
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
              {users?.pagination.total_count || 0} users found
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkExport}
                className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              <button
                onClick={handleBulkActivate}
                className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Activate
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                <UserX className="h-4 w-4 mr-1" />
                Deactivate
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={users?.users.length > 0 && selectedUsers.length === users.users.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Account Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users?.users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.user_id)}
                      onChange={() => handleSelectUser(user.user_id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.photo_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.photo_url}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        {(user.stage_name || user.company_name || user.station_name) && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {user.stage_name || user.company_name || user.station_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getUserTypeColor(user.user_type)}`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getKycStatusColor(user.kyc_status)}`}>
                      {user.kyc_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getAccountStatusColor(user.is_active)}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {!user.email_verified && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" title="Email not verified" />
                      )}
                      {!user.profile_complete && (
                        <Clock className="h-4 w-4 text-orange-500 ml-2" title="Profile incomplete" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.last_activity ? userManagementService.formatDate(user.last_activity) : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleKycAction(user)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Manage KYC"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusAction(user)}
                        className={`${user.is_active ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'}`}
                        title={user.is_active ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.is_active ? <Ban className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users && users.pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={users.pagination.page_number}
              totalPages={users.pagination.total_pages}
              onPageChange={(page) => handleFilterChange('page', page)}
              showingFrom={(users.pagination.page_number - 1) * users.pagination.per_page + 1}
              showingTo={Math.min(users.pagination.page_number * users.pagination.per_page, users.pagination.total_count)}
              totalItems={users.pagination.total_count}
            />
          </div>
        )}
      </div>

      {/* KYC Modal */}
      {showKycModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Update KYC Status - {selectedUser.first_name} {selectedUser.last_name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  KYC Status
                </label>
                <select
                  value={kycForm.kyc_status}
                  onChange={(e) => setKycForm(prev => ({ ...prev, kyc_status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>

              {kycForm.kyc_status === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={kycForm.rejection_reason}
                    onChange={(e) => setKycForm(prev => ({ ...prev, rejection_reason: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Explain why the KYC was rejected..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={kycForm.admin_notes}
                  onChange={(e) => setKycForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Internal notes about this decision..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowKycModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitKycUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update KYC Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Update Account Status - {selectedUser.first_name} {selectedUser.last_name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action
                </label>
                <select
                  value={statusForm.action}
                  onChange={(e) => setStatusForm(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="suspend">Suspend</option>
                </select>
              </div>

              {statusForm.action === 'suspend' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Suspension Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={statusForm.suspension_duration}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, suspension_duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="24"
                  />
                </div>
              )}

              {(statusForm.action === 'deactivate' || statusForm.action === 'suspend') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason *
                  </label>
                  <textarea
                    value={statusForm.reason}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, reason: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Explain the reason for this action..."
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementDashboard;