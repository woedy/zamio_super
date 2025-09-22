import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Calendar,
  CreditCard,
  PieChart,
  BarChart3,
  Activity,
  Clock,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import { 
  royaltyManagementService, 
  RoyaltyOverview,
  PartnerRemittance,
  PaymentProcessingStatus,
  DisputeOverview
} from '../../../services/royaltyManagementService';
import { fireToast } from '../../../hooks/fireToast';

interface FinancialMetrics {
  total_revenue: number;
  total_admin_fees: number;
  total_net_payouts: number;
  pending_payments: number;
  failed_payments: number;
  currency: string;
  period_start: string;
  period_end: string;
}

interface PaymentTrend {
  date: string;
  gross_amount: number;
  admin_fees: number;
  net_amount: number;
  payment_count: number;
}

const FinancialOversightDashboard: React.FC = () => {
  const [overview, setOverview] = useState<RoyaltyOverview | null>(null);
  const [disputeOverview, setDisputeOverview] = useState<DisputeOverview | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentProcessingStatus[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [paymentTrends, setPaymentTrends] = useState<PaymentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'disputes' | 'trends'>('overview');

  // Filter states
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
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

  const loadDisputeOverview = useCallback(async () => {
    try {
      const data = await royaltyManagementService.getDisputeOverview();
      setDisputeOverview(data);
    } catch (error) {
      console.error('Failed to load dispute overview:', error);
      fireToast('Failed to load dispute data', 'error');
    }
  }, []);

  const loadPaymentStatus = useCallback(async () => {
    try {
      const data = await royaltyManagementService.getPaymentProcessingStatus();
      setPaymentStatus(data);
    } catch (error) {
      console.error('Failed to load payment status:', error);
      fireToast('Failed to load payment status', 'error');
    }
  }, []);

  const loadFinancialMetrics = useCallback(async () => {
    try {
      // This would be a new endpoint to get financial metrics for a date range
      // For now, we'll derive from overview data
      if (overview) {
        setFinancialMetrics({
          total_revenue: overview.financial_stats.total_gross_amount,
          total_admin_fees: overview.financial_stats.total_admin_fees,
          total_net_payouts: overview.financial_stats.total_net_amount,
          pending_payments: overview.financial_stats.pending_remittances,
          failed_payments: overview.recent_activity.recent_remittances, // placeholder
          currency: overview.financial_stats.currency,
          period_start: dateRange.start,
          period_end: dateRange.end
        });
      }
    } catch (error) {
      console.error('Failed to load financial metrics:', error);
      fireToast('Failed to load financial metrics', 'error');
    }
  }, [overview, dateRange]);

  const loadPaymentTrends = useCallback(async () => {
    try {
      // This would be a new endpoint to get payment trends
      // For now, we'll generate mock trend data
      const trends: PaymentTrend[] = [];
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        trends.push({
          date: d.toISOString().split('T')[0],
          gross_amount: Math.random() * 10000,
          admin_fees: Math.random() * 1500,
          net_amount: Math.random() * 8500,
          payment_count: Math.floor(Math.random() * 50)
        });
      }
      
      setPaymentTrends(trends);
    } catch (error) {
      console.error('Failed to load payment trends:', error);
      fireToast('Failed to load payment trends', 'error');
    }
  }, [dateRange]);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOverview(),
        loadDisputeOverview(),
        loadPaymentStatus(),
        loadPaymentTrends()
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
          loadDisputeOverview(),
          loadPaymentStatus(),
          loadPaymentTrends()
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [loadOverview, loadDisputeOverview, loadPaymentStatus, loadPaymentTrends]);

  useEffect(() => {
    loadFinancialMetrics();
  }, [loadFinancialMetrics]);

  // Action handlers
  const handleExportFinancialReport = async () => {
    try {
      // This would generate and download a financial report
      fireToast('Financial report export started', 'info');
      // Implementation would go here
    } catch (error) {
      fireToast('Failed to export financial report', 'error');
    }
  };

  const handleRetryFailedPayment = async (paymentId: string) => {
    try {
      // This would retry a failed payment
      fireToast(`Retrying payment ${paymentId}`, 'info');
      // Implementation would go here
      await loadPaymentStatus();
    } catch (error) {
      fireToast('Failed to retry payment', 'error');
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
            Financial Oversight
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor financial performance, payments, and dispute resolution
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportFinancialReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {financialMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {royaltyManagementService.formatCurrency(financialMetrics.total_revenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Fees</p>
                <p className="text-2xl font-bold text-blue-600">
                  {royaltyManagementService.formatCurrency(financialMetrics.total_admin_fees)}
                </p>
              </div>
              <PieChart className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {financialMetrics.total_revenue > 0 
                  ? ((financialMetrics.total_admin_fees / financialMetrics.total_revenue) * 100).toFixed(1)
                  : 0}% of revenue
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Payouts</p>
                <p className="text-2xl font-bold text-purple-600">
                  {royaltyManagementService.formatCurrency(financialMetrics.total_net_payouts)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {financialMetrics.total_revenue > 0 
                  ? ((financialMetrics.total_net_payouts / financialMetrics.total_revenue) * 100).toFixed(1)
                  : 0}% of revenue
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {financialMetrics.pending_payments}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Awaiting processing
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Payments</p>
                <p className="text-2xl font-bold text-red-600">
                  {financialMetrics.failed_payments}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">Requires attention</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Financial Overview', icon: BarChart3 },
            { id: 'payments', label: 'Payment Processing', icon: CreditCard },
            { id: 'disputes', label: 'Dispute Resolution', icon: AlertTriangle },
            { id: 'trends', label: 'Trends & Analytics', icon: TrendingUp }
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
            {/* Revenue Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Revenue Breakdown
              </h3>
              {financialMetrics && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gross Revenue</span>
                    <span className="font-medium text-green-600">
                      {royaltyManagementService.formatCurrency(financialMetrics.total_revenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Admin Fees</span>
                    <span className="font-medium text-blue-600">
                      -{royaltyManagementService.formatCurrency(financialMetrics.total_admin_fees)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Net Payouts</span>
                      <span className="font-bold text-purple-600">
                        {royaltyManagementService.formatCurrency(financialMetrics.total_net_payouts)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Status Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment Status Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  </div>
                  <span className="font-medium text-green-600">
                    {paymentStatus.filter(p => p.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
                  </div>
                  <span className="font-medium text-yellow-600">
                    {paymentStatus.filter(p => p.status === 'processing').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
                  </div>
                  <span className="font-medium text-red-600">
                    {paymentStatus.filter(p => p.status === 'failed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  </div>
                  <span className="font-medium text-blue-600">
                    {paymentStatus.filter(p => p.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Processing Status
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Initiated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paymentStatus.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No payment processing data available</p>
                      </td>
                    </tr>
                  ) : (
                    paymentStatus.map((payment) => (
                      <tr key={payment.payment_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                          {payment.payment_id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {payment.recipient_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {payment.recipient_type.replace('_', ' ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {royaltyManagementService.formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${royaltyManagementService.getPaymentStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {royaltyManagementService.formatDate(payment.initiated_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {payment.status === 'failed' && (
                              <button
                                onClick={() => handleRetryFailedPayment(payment.payment_id)}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                title="Retry Payment"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dispute Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Dispute Overview
              </h3>
              {disputeOverview && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{disputeOverview.dispute_stats.open_disputes}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Open Disputes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{disputeOverview.dispute_stats.under_review}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Under Review</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{disputeOverview.dispute_stats.resolved_disputes}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{disputeOverview.dispute_stats.escalated_disputes}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Escalated</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resolution Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resolution Metrics
              </h3>
              {disputeOverview && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Average Resolution Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {disputeOverview.resolution_metrics.average_resolution_time} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</span>
                    <span className="font-medium text-green-600">
                      {disputeOverview.resolution_metrics.resolution_rate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Admin Interventions</span>
                    <span className="font-medium text-blue-600">
                      {disputeOverview.resolution_metrics.admin_interventions}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Trends
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Payment trend charts would be displayed here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialOversightDashboard;