import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Eye,
  Download,
  Calculator,
  Settings,
  FileText,
  CreditCard,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  royaltyManagementService, 
  RoyaltyOverview, 
  RoyaltyCycle,
  RoyaltyCalculationAudit,
  PartnerRemittance
} from '../../../services/royaltyManagementService';
import { fireToast } from '../../../hooks/fireToast';

const RoyaltyManagementDashboard: React.FC = () => {
  const [overview, setOverview] = useState<RoyaltyOverview | null>(null);
  const [recentCycles, setRecentCycles] = useState<RoyaltyCycle[]>([]);
  const [recentAudits, setRecentAudits] = useState<RoyaltyCalculationAudit[]>([]);
  const [pendingRemittances, setPendingRemittances] = useState<PartnerRemittance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cycles' | 'calculations' | 'remittances'>('overview');

  // Modal states
  const [showCreateCycle, setShowCreateCycle] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<RoyaltyCycle | null>(null);

  // Form states
  const [cycleForm, setCycleForm] = useState({
    name: '',
    territory: 'GH',
    period_start: '',
    period_end: '',
    admin_fee_percent_default: 15.0
  });

  const [calculationForm, setCalculationForm] = useState({
    play_log_ids: '',
    dry_run: true
  });

  // Load data
  const loadOverview = useCallback(async () => {
    try {
      const data = await royaltyManagementService.getRoyaltyOverview();
      setOverview(data);
    } catch (error) {
      console.error('Failed to load overview:', error);
      fireToast('Failed to load overview data', 'error');
    }
  }, []);

  const loadRecentCycles = useCallback(async () => {
    try {
      const cycles = await royaltyManagementService.getAllCycles();
      setRecentCycles(cycles.slice(0, 5)); // Get 5 most recent
    } catch (error) {
      console.error('Failed to load cycles:', error);
      fireToast('Failed to load cycles', 'error');
    }
  }, []);

  const loadRecentAudits = useCallback(async () => {
    try {
      const data = await royaltyManagementService.getCalculationAudit({ limit: 10 });
      setRecentAudits(data.audits);
    } catch (error) {
      console.error('Failed to load audits:', error);
      fireToast('Failed to load calculation audits', 'error');
    }
  }, []);

  const loadPendingRemittances = useCallback(async () => {
    try {
      // This would need to be implemented - for now we'll use empty array
      setPendingRemittances([]);
    } catch (error) {
      console.error('Failed to load remittances:', error);
      fireToast('Failed to load remittances', 'error');
    }
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOverview(),
        loadRecentCycles(),
        loadRecentAudits(),
        loadPendingRemittances()
      ]);
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
        await Promise.all([
          loadOverview(),
          loadRecentCycles(),
          loadRecentAudits(),
          loadPendingRemittances()
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [loadOverview, loadRecentCycles, loadRecentAudits, loadPendingRemittances]);

  // Action handlers
  const handleCreateCycle = async () => {
    try {
      await royaltyManagementService.createCycle(cycleForm);
      fireToast('Royalty cycle created successfully', 'success');
      setShowCreateCycle(false);
      setCycleForm({
        name: '',
        territory: 'GH',
        period_start: '',
        period_end: '',
        admin_fee_percent_default: 15.0
      });
      await loadRecentCycles();
    } catch (error) {
      fireToast('Failed to create cycle', 'error');
    }
  };

  const handleCloseCycle = async (cycle: RoyaltyCycle) => {
    if (!confirm(`Are you sure you want to close cycle "${cycle.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await royaltyManagementService.closeCycle(cycle.id);
      fireToast(`Cycle closed successfully. ${result.line_items_created} line items created.`, 'success');
      await loadRecentCycles();
    } catch (error) {
      fireToast('Failed to close cycle', 'error');
    }
  };

  const handleCalculateRoyalties = async () => {
    try {
      const playLogIds = calculationForm.play_log_ids
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      if (playLogIds.length === 0) {
        fireToast('Please enter valid play log IDs', 'warning');
        return;
      }

      const result = await royaltyManagementService.calculatePlayLogRoyalties({
        play_log_ids: playLogIds,
        dry_run: calculationForm.dry_run
      });

      fireToast(
        `Calculation ${calculationForm.dry_run ? 'simulated' : 'completed'}: ${result.summary.successful_calculations}/${result.summary.total_play_logs} successful`,
        'success'
      );
      
      setShowCalculationModal(false);
      await loadRecentAudits();
    } catch (error) {
      fireToast('Failed to calculate royalties', 'error');
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
            Royalty Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage royalty cycles, calculations, and financial oversight
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
            onClick={() => setShowCreateCycle(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Cycle
          </button>
          <button
            onClick={() => setShowCalculationModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Gross Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {royaltyManagementService.formatCurrency(overview.financial_stats.total_gross_amount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Admin fees: {royaltyManagementService.formatCurrency(overview.financial_stats.total_admin_fees)}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Cycles</p>
                <p className="text-2xl font-bold text-blue-600">
                  {overview.cycle_stats.open_cycles + overview.cycle_stats.locked_cycles}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {overview.cycle_stats.open_cycles} open, {overview.cycle_stats.locked_cycles} locked
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Remittances</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {overview.financial_stats.pending_remittances}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {overview.partner_stats.pending_payments} partners awaiting payment
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Calculations</p>
                <p className="text-2xl font-bold text-purple-600">
                  {overview.recent_activity.recent_calculations}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {overview.recent_activity.recent_remittances} remittances processed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'cycles', label: 'Royalty Cycles', icon: Calendar },
            { id: 'calculations', label: 'Calculations', icon: Calculator },
            { id: 'remittances', label: 'Remittances', icon: CreditCard }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cycle Status Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cycle Status Distribution
              </h3>
              {overview && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Open Cycles</span>
                    <span className="font-medium text-blue-600">{overview.cycle_stats.open_cycles}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Locked Cycles</span>
                    <span className="font-medium text-yellow-600">{overview.cycle_stats.locked_cycles}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Invoiced Cycles</span>
                    <span className="font-medium text-purple-600">{overview.cycle_stats.invoiced_cycles}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Remitted Cycles</span>
                    <span className="font-medium text-green-600">{overview.cycle_stats.remitted_cycles}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Financial Summary
              </h3>
              {overview && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gross Revenue</span>
                    <span className="font-medium text-green-600">
                      {royaltyManagementService.formatCurrency(overview.financial_stats.total_gross_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Admin Fees</span>
                    <span className="font-medium text-blue-600">
                      {royaltyManagementService.formatCurrency(overview.financial_stats.total_admin_fees)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Net Payable</span>
                    <span className="font-medium text-purple-600">
                      {royaltyManagementService.formatCurrency(overview.financial_stats.total_net_amount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Admin Fee Rate</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {overview.financial_stats.total_gross_amount > 0 
                          ? ((overview.financial_stats.total_admin_fees / overview.financial_stats.total_gross_amount) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cycles' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Royalty Cycles
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cycle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentCycles.map((cycle) => (
                    <tr key={cycle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {cycle.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {cycle.territory}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(cycle.period_start).toLocaleDateString()} - {new Date(cycle.period_end).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${royaltyManagementService.getCycleStatusColor(cycle.status)}`}>
                          {cycle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {cycle.total_gross_amount 
                          ? royaltyManagementService.formatCurrency(cycle.total_gross_amount)
                          : 'Not calculated'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedCycle(cycle)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {cycle.status === 'Open' && (
                            <button
                              onClick={() => handleCloseCycle(cycle)}
                              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                              title="Close Cycle"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'calculations' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Calculations
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Calculation ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Calculated At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentAudits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                        {audit.calculation_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {audit.calculation_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {royaltyManagementService.formatCurrency(audit.total_amount, audit.currency)}
                      </td>
                      <td className="px-6 py-4">
                        {audit.has_errors ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            {audit.errors_count} errors
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {royaltyManagementService.formatDate(audit.calculated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'remittances' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Remittances
              </h3>
            </div>
            <div className="p-6">
              {pendingRemittances.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No pending remittances</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRemittances.map((remittance) => (
                    <div key={remittance.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {remittance.partner.display_name || remittance.partner.company_name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {remittance.royalty_cycle.name} - {royaltyManagementService.formatCurrency(remittance.net_payable, remittance.currency)}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${royaltyManagementService.getRemittanceStatusColor(remittance.status)}`}>
                          {remittance.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Cycle Modal */}
      {showCreateCycle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Royalty Cycle
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cycle Name
                </label>
                <input
                  type="text"
                  value={cycleForm.name}
                  onChange={(e) => setCycleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Q1 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Territory
                </label>
                <select
                  value={cycleForm.territory}
                  onChange={(e) => setCycleForm(prev => ({ ...prev, territory: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="GH">Ghana</option>
                  <option value="NG">Nigeria</option>
                  <option value="KE">Kenya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={cycleForm.period_start}
                    onChange={(e) => setCycleForm(prev => ({ ...prev, period_start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={cycleForm.period_end}
                    onChange={(e) => setCycleForm(prev => ({ ...prev, period_end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Fee Percentage
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={cycleForm.admin_fee_percent_default}
                  onChange={(e) => setCycleForm(prev => ({ ...prev, admin_fee_percent_default: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateCycle(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCycle}
                disabled={!cycleForm.name || !cycleForm.period_start || !cycleForm.period_end}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Cycle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Modal */}
      {showCalculationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Calculate Royalties
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Play Log IDs (comma-separated)
                </label>
                <textarea
                  value={calculationForm.play_log_ids}
                  onChange={(e) => setCalculationForm(prev => ({ ...prev, play_log_ids: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="1, 2, 3, 4, 5"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dry_run"
                  checked={calculationForm.dry_run}
                  onChange={(e) => setCalculationForm(prev => ({ ...prev, dry_run: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="dry_run" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Dry run (simulation only)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCalculationModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCalculateRoyalties}
                disabled={!calculationForm.play_log_ids.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoyaltyManagementDashboard;