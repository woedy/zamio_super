import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Server,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Bell,
  Shield
} from 'lucide-react';
import { fireToast } from '../../../hooks/fireToast';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: {
    bytes_sent: number;
    bytes_received: number;
  };
  active_connections: number;
  uptime: number;
  last_updated: string;
}

interface ServiceStatus {
  service_name: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time: number;
  last_check: string;
  error_message?: string;
  uptime_percentage: number;
}

interface DatabaseMetrics {
  connection_pool_size: number;
  active_connections: number;
  query_performance: {
    avg_query_time: number;
    slow_queries: number;
  };
  storage: {
    total_size: number;
    used_size: number;
    free_size: number;
  };
  last_backup: string;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  last_triggered?: string;
}

interface SystemAlert {
  id: string;
  rule_id: string;
  rule_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggered_at: string;
  resolved_at?: string;
  status: 'active' | 'resolved' | 'acknowledged';
}

const SystemHealthDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics | null>(null);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'database' | 'alerts'>('overview');

  // Modal states
  const [showAlertRuleModal, setShowAlertRuleModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);

  // Form states
  const [alertRuleForm, setAlertRuleForm] = useState({
    name: '',
    metric: 'cpu_usage',
    threshold: 80,
    operator: 'greater_than' as const,
    severity: 'medium' as const,
    enabled: true
  });

  // Mock data loading functions (would be replaced with actual API calls)
  const loadSystemMetrics = useCallback(async () => {
    try {
      // Mock system metrics
      setSystemMetrics({
        cpu_usage: Math.random() * 100,
        memory_usage: Math.random() * 100,
        disk_usage: Math.random() * 100,
        network_io: {
          bytes_sent: Math.random() * 1000000,
          bytes_received: Math.random() * 1000000
        },
        active_connections: Math.floor(Math.random() * 1000),
        uptime: Math.random() * 86400 * 30, // 30 days in seconds
        last_updated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load system metrics:', error);
      fireToast('Failed to load system metrics', 'error');
    }
  }, []);

  const loadServiceStatuses = useCallback(async () => {
    try {
      // Mock service statuses
      const services = [
        'Django API',
        'PostgreSQL',
        'Redis',
        'Celery Workers',
        'Nginx',
        'Audio Processing Service',
        'Fingerprinting Service',
        'ACRCloud Integration',
        'Payment Gateway',
        'Email Service'
      ];

      const statuses: ServiceStatus[] = services.map(service => ({
        service_name: service,
        status: Math.random() > 0.1 ? 'healthy' : Math.random() > 0.5 ? 'degraded' : 'down',
        response_time: Math.random() * 1000,
        last_check: new Date().toISOString(),
        uptime_percentage: 95 + Math.random() * 5,
        error_message: Math.random() > 0.8 ? 'Connection timeout' : undefined
      }));

      setServiceStatuses(statuses);
    } catch (error) {
      console.error('Failed to load service statuses:', error);
      fireToast('Failed to load service statuses', 'error');
    }
  }, []);

  const loadDatabaseMetrics = useCallback(async () => {
    try {
      // Mock database metrics
      setDatabaseMetrics({
        connection_pool_size: 20,
        active_connections: Math.floor(Math.random() * 15),
        query_performance: {
          avg_query_time: Math.random() * 100,
          slow_queries: Math.floor(Math.random() * 10)
        },
        storage: {
          total_size: 1000000000, // 1GB
          used_size: Math.random() * 800000000, // Up to 800MB
          free_size: 200000000 // Remaining
        },
        last_backup: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    } catch (error) {
      console.error('Failed to load database metrics:', error);
      fireToast('Failed to load database metrics', 'error');
    }
  }, []);

  const loadAlertRules = useCallback(async () => {
    try {
      // Mock alert rules
      setAlertRules([
        {
          id: '1',
          name: 'High CPU Usage',
          metric: 'cpu_usage',
          threshold: 80,
          operator: 'greater_than',
          severity: 'high',
          enabled: true
        },
        {
          id: '2',
          name: 'Low Memory Available',
          metric: 'memory_usage',
          threshold: 90,
          operator: 'greater_than',
          severity: 'critical',
          enabled: true
        },
        {
          id: '3',
          name: 'Disk Space Low',
          metric: 'disk_usage',
          threshold: 85,
          operator: 'greater_than',
          severity: 'medium',
          enabled: true
        }
      ]);
    } catch (error) {
      console.error('Failed to load alert rules:', error);
      fireToast('Failed to load alert rules', 'error');
    }
  }, []);

  const loadActiveAlerts = useCallback(async () => {
    try {
      // Mock active alerts
      setActiveAlerts([
        {
          id: '1',
          rule_id: '1',
          rule_name: 'High CPU Usage',
          severity: 'high',
          message: 'CPU usage has exceeded 80% for the last 5 minutes',
          triggered_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          status: 'active'
        }
      ]);
    } catch (error) {
      console.error('Failed to load active alerts:', error);
      fireToast('Failed to load active alerts', 'error');
    }
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadSystemMetrics(),
        loadServiceStatuses(),
        loadDatabaseMetrics(),
        loadAlertRules(),
        loadActiveAlerts()
      ]);
      fireToast('System health data refreshed', 'success');
    } catch (error) {
      fireToast('Failed to refresh system health data', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadSystemMetrics(),
          loadServiceStatuses(),
          loadDatabaseMetrics(),
          loadAlertRules(),
          loadActiveAlerts()
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [loadSystemMetrics, loadServiceStatuses, loadDatabaseMetrics, loadAlertRules, loadActiveAlerts]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        refreshData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshing]);

  // Action handlers
  const handleCreateAlertRule = async () => {
    try {
      // This would create a new alert rule
      const newRule: AlertRule = {
        id: Date.now().toString(),
        ...alertRuleForm
      };
      setAlertRules(prev => [...prev, newRule]);
      setShowAlertRuleModal(false);
      setAlertRuleForm({
        name: '',
        metric: 'cpu_usage',
        threshold: 80,
        operator: 'greater_than',
        severity: 'medium',
        enabled: true
      });
      fireToast('Alert rule created successfully', 'success');
    } catch (error) {
      fireToast('Failed to create alert rule', 'error');
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      setActiveAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged' as const }
            : alert
        )
      );
      fireToast('Alert acknowledged', 'success');
    } catch (error) {
      fireToast('Failed to acknowledge alert', 'error');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      setActiveAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved' as const, resolved_at: new Date().toISOString() }
            : alert
        )
      );
      fireToast('Alert resolved', 'success');
    } catch (error) {
      fireToast('Failed to resolve alert', 'error');
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    const colors = {
      'healthy': 'bg-green-100 text-green-800',
      'degraded': 'bg-yellow-100 text-yellow-800',
      'down': 'bg-red-100 text-red-800',
      'active': 'bg-red-100 text-red-800',
      'acknowledged': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
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
            System Health Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor system performance, services, and alerts
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
            onClick={() => setShowAlertRuleModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Bell className="h-4 w-4 mr-2" />
            Add Alert Rule
          </button>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {activeAlerts.filter(alert => alert.status === 'active').length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800 dark:text-red-200">
              {activeAlerts.filter(alert => alert.status === 'active').length} active alert(s) require attention
            </span>
          </div>
        </div>
      )}

      {/* System Overview Cards */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
                <p className="text-2xl font-bold text-blue-600">
                  {systemMetrics.cpu_usage.toFixed(1)}%
                </p>
              </div>
              <Cpu className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.cpu_usage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</p>
                <p className="text-2xl font-bold text-green-600">
                  {systemMetrics.memory_usage.toFixed(1)}%
                </p>
              </div>
              <MemoryStick className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.memory_usage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disk Usage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {systemMetrics.disk_usage.toFixed(1)}%
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.disk_usage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatUptime(systemMetrics.uptime)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {systemMetrics.active_connections} active connections
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'System Overview', icon: Monitor },
            { id: 'services', label: 'Services', icon: Server },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'alerts', label: 'Alerts & Monitoring', icon: Bell }
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
        {activeTab === 'overview' && systemMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network I/O */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Network I/O
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bytes Sent</span>
                  <span className="font-medium text-blue-600">
                    {formatBytes(systemMetrics.network_io.bytes_sent)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bytes Received</span>
                  <span className="font-medium text-green-600">
                    {formatBytes(systemMetrics.network_io.bytes_received)}
                  </span>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Connections</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {systemMetrics.active_connections}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(systemMetrics.last_updated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Service Status
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Check
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {serviceStatuses.map((service, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Server className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {service.service_name}
                            </div>
                            {service.error_message && (
                              <div className="text-sm text-red-600">
                                {service.error_message}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                          {service.status === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {service.status === 'degraded' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {service.status === 'down' && <XCircle className="h-3 w-3 mr-1" />}
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {service.response_time.toFixed(0)}ms
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {service.uptime_percentage.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(service.last_check).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'database' && databaseMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connection Pool */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Connection Pool
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pool Size</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {databaseMetrics.connection_pool_size}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Connections</span>
                  <span className="font-medium text-blue-600">
                    {databaseMetrics.active_connections}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(databaseMetrics.active_connections / databaseMetrics.connection_pool_size) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Query Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Query Performance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Query Time</span>
                  <span className="font-medium text-green-600">
                    {databaseMetrics.query_performance.avg_query_time.toFixed(2)}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Slow Queries</span>
                  <span className="font-medium text-red-600">
                    {databaseMetrics.query_performance.slow_queries}
                  </span>
                </div>
              </div>
            </div>

            {/* Storage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <HardDrive className="h-5 w-5 mr-2" />
                Storage
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Size</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatBytes(databaseMetrics.storage.total_size)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Used</span>
                  <span className="font-medium text-blue-600">
                    {formatBytes(databaseMetrics.storage.used_size)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Free</span>
                  <span className="font-medium text-green-600">
                    {formatBytes(databaseMetrics.storage.free_size)}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(databaseMetrics.storage.used_size / databaseMetrics.storage.total_size) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Backup Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(databaseMetrics.last_backup).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Active Alerts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Active Alerts
                </h3>
              </div>
              <div className="p-6">
                {activeAlerts.filter(alert => alert.status === 'active').length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No active alerts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeAlerts.filter(alert => alert.status === 'active').map((alert) => (
                      <div key={alert.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {alert.rule_name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Triggered {new Date(alert.triggered_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                              title="Acknowledge"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Resolve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alert Rules */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Alert Rules
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rule Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Metric
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {alertRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {rule.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {rule.metric.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {rule.operator.replace('_', ' ')} {rule.threshold}%
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(rule.severity)}`}>
                            {rule.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Alert Rule Modal */}
      {showAlertRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Alert Rule
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={alertRuleForm.name}
                  onChange={(e) => setAlertRuleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., High CPU Usage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Metric
                </label>
                <select
                  value={alertRuleForm.metric}
                  onChange={(e) => setAlertRuleForm(prev => ({ ...prev, metric: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="cpu_usage">CPU Usage</option>
                  <option value="memory_usage">Memory Usage</option>
                  <option value="disk_usage">Disk Usage</option>
                  <option value="response_time">Response Time</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Operator
                  </label>
                  <select
                    value={alertRuleForm.operator}
                    onChange={(e) => setAlertRuleForm(prev => ({ ...prev, operator: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="greater_than">Greater than</option>
                    <option value="less_than">Less than</option>
                    <option value="equals">Equals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Threshold
                  </label>
                  <input
                    type="number"
                    value={alertRuleForm.threshold}
                    onChange={(e) => setAlertRuleForm(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity
                </label>
                <select
                  value={alertRuleForm.severity}
                  onChange={(e) => setAlertRuleForm(prev => ({ ...prev, severity: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={alertRuleForm.enabled}
                  onChange={(e) => setAlertRuleForm(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enable rule
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAlertRuleModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlertRule}
                disabled={!alertRuleForm.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthDashboard;