import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Activity,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import staffManagementService, {
  StaffMember,
  StaffDetails,
  StaffOverview,
  StaffFilters,
  CreateStaffRequest,
  UpdateStaffRequest,
  Permission
} from '../../../services/staffManagementService';
import PageTitle from '../../../components/PageTitle';
import Pagination from '../../../components/Pagination';

interface StaffManagementDashboardProps {}

const StaffManagementDashboard: React.FC<StaffManagementDashboardProps> = () => {
  // State management
  const [overview, setOverview] = useState<StaffOverview | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffDetails | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'list' | 'details' | 'create' | 'edit'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Filters and pagination
  const [filters, setFilters] = useState<StaffFilters>({
    page: 1,
    per_page: 20,
    search: '',
    staff_type: '',
    is_active: '',
    order_by: '-timestamp'
  });
  const [pagination, setPagination] = useState({
    page_number: 1,
    per_page: 20,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_previous: false
  });

  // Form state
  const [createForm, setCreateForm] = useState<CreateStaffRequest>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    user_type: 'Admin',
    phone: '',
    country: '',
    is_staff: true,
    is_admin: false,
    permissions: []
  });
  
  const [editForm, setEditForm] = useState<UpdateStaffRequest>({});

  // Load data functions
  const loadOverview = useCallback(async () => {
    try {
      const data = await staffManagementService.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load staff overview:', err);
      setError('Failed to load staff overview');
    }
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const data = await staffManagementService.getAllStaff(filters);
      setStaff(data.staff);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load staff:', err);
      setError('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStaffDetails = useCallback(async (staffId: string) => {
    try {
      const data = await staffManagementService.getStaffDetails(staffId);
      setSelectedStaff(data);
    } catch (err) {
      console.error('Failed to load staff details:', err);
      toast.error('Failed to load staff details');
    }
  }, []);

  const loadAvailablePermissions = useCallback(async () => {
    try {
      const data = await staffManagementService.getAvailablePermissions();
      setAvailablePermissions(data.permissions);
    } catch (err) {
      console.error('Failed to load permissions:', err);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    loadOverview();
    loadStaff();
    loadAvailablePermissions();
  }, [loadOverview, loadStaff, loadAvailablePermissions]);

  // Handle filter changes
  const handleFilterChange = (key: keyof StaffFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    handleFilterChange('search', searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    handleFilterChange('page', page);
  };

  // Handle staff creation
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!staffManagementService.isValidEmail(createForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    const passwordValidation = staffManagementService.isValidPassword(createForm.password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.message || 'Invalid password');
      return;
    }

    try {
      await staffManagementService.createStaffMember(createForm);
      toast.success('Staff member created successfully');
      setShowCreateModal(false);
      setCreateForm({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        user_type: 'Admin',
        phone: '',
        country: '',
        is_staff: true,
        is_admin: false,
        permissions: []
      });
      loadStaff();
      loadOverview();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create staff member');
    }
  };

  // Handle staff update
  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaff) return;

    try {
      await staffManagementService.updateStaffMember(selectedStaff.user_id, editForm);
      toast.success('Staff member updated successfully');
      setShowEditModal(false);
      setEditForm({});
      loadStaff();
      loadOverview();
      if (selectedStaff) {
        loadStaffDetails(selectedStaff.user_id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update staff member');
    }
  };

  // Handle staff deactivation
  const handleDeactivateStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) {
      return;
    }

    try {
      await staffManagementService.deactivateStaffMember(staffId);
      toast.success('Staff member deactivated successfully');
      loadStaff();
      loadOverview();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to deactivate staff member');
    }
  };

  // Handle export
  const handleExportStaff = () => {
    staffManagementService.exportStaffAsCSV(staff, `staff_export_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Staff data exported successfully');
  };

  // Render overview cards
  const renderOverviewCards = () => {
    if (!overview) return null;

    const cards = [
      {
        title: 'Total Staff',
        value: overview.staff_stats.total_staff,
        icon: <Users className="h-8 w-8" />,
        color: 'bg-blue-500'
      },
      {
        title: 'Active Staff',
        value: overview.staff_stats.active_staff,
        icon: <UserCheck className="h-8 w-8" />,
        color: 'bg-green-500'
      },
      {
        title: 'Admin Staff',
        value: overview.staff_stats.admin_staff,
        icon: <Shield className="h-8 w-8" />,
        color: 'bg-purple-500'
      },
      {
        title: 'Recent Activity',
        value: overview.activity_stats.recent_activity,
        icon: <Activity className="h-8 w-8" />,
        color: 'bg-orange-500'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} text-white p-3 rounded-lg mr-4`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render filters
  const renderFilters = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search staff..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Staff Type Filter */}
        <select
          value={filters.staff_type || ''}
          onChange={(e) => handleFilterChange('staff_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Staff Types</option>
          <option value="admin">Administrators</option>
          <option value="regular">Regular Staff</option>
        </select>

        {/* Active Status Filter */}
        <select
          value={filters.is_active || ''}
          onChange={(e) => handleFilterChange('is_active', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </button>
          <button
            onClick={handleExportStaff}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
    </div>
  );

  // Render staff table
  const renderStaffTable = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {staff.map((member) => (
              <tr key={member.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {member.photo_url ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={member.photo_url}
                          alt={`${member.first_name} ${member.last_name}`}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${staffManagementService.getStaffTypeColor(member.is_admin, member.is_staff)}`}>
                    {staffManagementService.getStaffTypeDisplay(member.is_admin, member.is_staff)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${staffManagementService.getActiveStatusColor(member.is_active)}`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {member.last_activity ? staffManagementService.formatRelativeTime(member.last_activity) : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {member.permissions.length} permissions
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        loadStaffDetails(member.user_id);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStaff(member as StaffDetails);
                        setEditForm({
                          first_name: member.first_name,
                          last_name: member.last_name,
                          user_type: member.user_type,
                          is_admin: member.is_admin,
                          is_staff: member.is_staff,
                          is_active: member.is_active,
                          permissions: member.permissions
                        });
                        setShowEditModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeactivateStaff(member.user_id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Deactivate"
                      disabled={!member.is_active}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={pagination.page_number}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
            showInfo={true}
            totalItems={pagination.total_count}
            itemsPerPage={pagination.per_page}
          />
        </div>
      )}
    </div>
  );

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Staff Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadOverview();
              loadStaff();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Staff Management" />
      
      {/* Overview Cards */}
      {renderOverviewCards()}
      
      {/* Filters */}
      {renderFilters()}
      
      {/* Staff Table */}
      {renderStaffTable()}
    </div>
  );
};

export default StaffManagementDashboard;