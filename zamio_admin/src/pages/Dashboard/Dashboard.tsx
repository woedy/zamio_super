import { useEffect, useState } from 'react';
import {
  Users,
  Radio,
  TrendingUp,
  DollarSign,
  Shield,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  Globe,
  Database,
  Settings,
  Bell,
  Search,
  Download,
  Eye,
  UserCheck,
  Disc,
  CreditCard,
  Activity,
  Wallet,
  Award,
  UserPlus,
  BellRing,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  Pie,
} from 'recharts';


import { baseUrl, userToken } from '../../constants';

const InternalAdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [loading, setLoading] = useState(false);

  const [platformStats, setPlatformStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topEarners, setTopEarners] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [genreData, setGenreData] = useState<any[]>([]);
  const [dailyActivityData, setDailyActivityData] = useState<any[]>([]);
  const [stationPerformance, setStationPerformance] = useState<any[]>([]);
  const [distributionMetrics, setDistributionMetrics] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [publisherMetrics, setPublisherMetrics] = useState<any>({});
  const [topPublishers, setTopPublishers] = useState<any[]>([]);

  // Platform distribution data for chart (static reference data)
  const platformDistributionData = [
    { name: 'Spotify', plays: 0, revenue: 0 },
    { name: 'Apple Music', plays: 0, revenue: 0 },
    { name: 'YouTube Music', plays: 0, revenue: 0 },
    { name: 'Local Radio', plays: 0, revenue: 0 },
    { name: 'Boomplay', plays: 0, revenue: 0 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'urgent':
        return 'text-red-400';
      case 'warning':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
      case 'registration':
        return <UserPlus className="w-4 h-4" />;
      case 'dispute':
        return <AlertTriangle className="w-4 h-4" />;
      case 'station':
        return <Radio className="w-4 h-4" />;
      case 'distribution':
        return <Disc className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(baseUrl + `api/mr-admin/dashboard/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${userToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Set all data from API response
        setPlatformStats(data.data.platformStats || {});
        setRecentActivity(data.data.recentActivity || []);
        setTopEarners(data.data.topEarners || []);
        setRevenueData(data.data.revenueData || []);
        setGenreData(data.data.genreData || []);
        setDailyActivityData(data.data.dailyActivityData || []);
        setStationPerformance(data.data.stationPerformance || []);
        setDistributionMetrics(data.data.distributionMetrics || []);
        setTopPublishers(data.data.topPublishers || []);
        
        console.log('Admin dashboard data loaded successfully:', data.data);

        // Fetch system health data
        const healthResponse = await fetch(baseUrl + `api/mr-admin/system-health/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${userToken}`,
          },
        });

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          setSystemHealth(healthData.data || {});
          console.log('System health data loaded:', healthData.data);
        }


      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        // Initialize with empty data structures to prevent UI errors
        setPlatformStats({
          totalStations: 0,
          totalArtists: 0,
          totalSongs: 0,
          totalPlays: 0,
          totalRoyalties: 0,
          pendingPayments: 0,
          monthlyGrowth: 0,
          totalPublishers: 0,
          verifiedPublishers: 0,
        });
        setRecentActivity([]);
        setTopEarners([]);
        setRevenueData([]);
        setGenreData([]);
        setDailyActivityData([]);
        setStationPerformance([]);
        setDistributionMetrics([]);
        setSystemHealth({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      <span className="ml-2 text-gray-300">Loading...</span>
    </div>
  );

  // Error component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center p-8">
      <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
      <span className="text-red-400">{message}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ZamIO Admin</h1>
                <p className="text-gray-300 text-sm">
                  Platform Management Console
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search artists, stations, songs..."
                  className="bg-white/10 backdrop-blur-md text-white pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-300" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                <Settings className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20 w-fit">
            {[
              'overview',
              'artists',
              'stations',
              'royalties',
              'distribution',
              'analytics',
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl">
                    <Radio className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {platformStats.totalStations || 0}
                    </div>
                    <div className="text-sm text-gray-300">Active Stations</div>
                  </div>
                </div>
                <div className="text-xs text-blue-400">Real-time data</div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500/20 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {platformStats.totalArtists || 0}
                    </div>
                    <div className="text-sm text-gray-300">Registered Artists</div>
                  </div>
                </div>
                <div className="text-xs text-green-400">
                  {platformStats.monthlyGrowth ? `↑ ${platformStats.monthlyGrowth}% growth` : 'Real-time data'}
                </div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-500/20 p-3 rounded-xl">
                    <Award className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {platformStats.totalPublishers || 0}
                    </div>
                    <div className="text-sm text-gray-300">Active Publishers</div>
                  </div>
                </div>
                <div className="text-xs text-indigo-400">
                  {platformStats.verifiedPublishers ? `${platformStats.verifiedPublishers} verified` : 'Real-time data'}
                </div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500/20 p-3 rounded-xl">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ₵{platformStats.totalRoyalties?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-300">Total Royalties</div>
                  </div>
                </div>
                <div className="text-xs text-purple-400">All-time total</div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500/20 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ₵{platformStats.pendingPayments?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-300">Pending Payments</div>
                  </div>
                </div>
                <div className="text-xs text-orange-400">
                  {platformStats.pendingPayments > 0 ? 'Requires attention' : 'All clear'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Revenue Analytics Chart */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Revenue Analytics
                </h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                    Revenue
                  </button>
                  <button className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg text-sm">
                    Artists
                  </button>
                </div>
              </div>
              <div className="h-80">
                {loading ? (
                  <LoadingSpinner />
                ) : revenueData.length === 0 ? (
                  <ErrorMessage message="No revenue data available" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorArtists"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: 'white',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="artists"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorArtists)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Genre Distribution & Platform Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Genre Distribution Pie Chart */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-purple-400" />
                    Genre Distribution
                  </h2>
                </div>
                <div className="h-64">
                  {loading ? (
                    <LoadingSpinner />
                  ) : genreData.length === 0 ? (
                    <ErrorMessage message="No genre data available" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={genreData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {genreData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                {!loading && genreData.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {genreData.map((genre, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: genre.color }}
                        ></div>
                        <span className="text-sm text-gray-300">
                          {genre.name}
                        </span>
                        <span className="text-sm text-white font-medium">
                          {genre.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Station Performance Bar Chart */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                    Station Performance
                  </h2>
                </div>
                <div className="h-64">
                  {loading ? (
                    <LoadingSpinner />
                  ) : stationPerformance.length === 0 ? (
                    <ErrorMessage message="No station performance data available" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stationPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                          }}
                        />
                        <Bar
                          dataKey="plays"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Activity Trends */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                  Daily Activity Trends
                </h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedPeriod('weekly')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      selectedPeriod === 'weekly' 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    This Week
                  </button>
                  <button 
                    onClick={() => setSelectedPeriod('monthly')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      selectedPeriod === 'monthly' 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    This Month
                  </button>
                </div>
              </div>
              <div className="h-80">
                {loading ? (
                  <LoadingSpinner />
                ) : dailyActivityData.length === 0 ? (
                  <ErrorMessage message="No activity data available" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: 'white',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="registrations"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#8B5CF6' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="payments"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#10B981' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="disputes"
                        stroke="#EF4444"
                        strokeWidth={3}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#EF4444' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              {!loading && dailyActivityData.length > 0 && (
                <div className="flex justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-300">Registrations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-300">Payments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-300">Disputes</span>
                  </div>
                </div>
              )}
            </div>

            
            {/* Recent Platform Activity */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                  Platform Activity Feed
                </h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">
                    Recent
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/20"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <LoadingSpinner />
                ) : recentActivity.length === 0 ? (
                  <ErrorMessage message="No recent activity available" />
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg ${getStatusColor(
                          activity.status,
                        )
                          .replace('text-', 'bg-')
                          .replace('-400', '-500/20')}`}
                      >
                        {getStatusIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {activity.description}
                        </div>
                        <div className="text-sm text-gray-400">
                          {activity.time}
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.amount && (
                          <div className="text-green-400 font-semibold">
                            ₵{activity.amount}
                          </div>
                        )}
                        <div
                          className={`text-xs ${getStatusColor(
                            activity.status,
                          )} capitalize`}
                        >
                          {activity.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Distribution Metrics Overview */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-purple-400" />
                  Platform Distribution
                </h2>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <LoadingSpinner />
                ) : distributionMetrics.length === 0 ? (
                  <ErrorMessage message="No distribution data available" />
                ) : (
                  distributionMetrics.map((platform, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-white">
                          {platform.platform}
                        </div>
                        {platform.growth && (
                          <div className="text-sm text-green-400">
                            +{platform.growth}%
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-300 mb-2">
                        {platform.tracks?.toLocaleString() || 0} tracks
                      </div>
                      <div className="text-purple-400 font-medium">
                        ₵{platform.revenue?.toLocaleString() || '0'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Top Earning Artists */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  Top Earning Artists
                </h2>
                <button className="text-sm text-gray-300 hover:text-white flex items-center">
                  View All <Eye className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <LoadingSpinner />
                ) : topEarners.length === 0 ? (
                  <ErrorMessage message="No artist data available" />
                ) : (
                  topEarners.map((artist, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {artist.name}
                          </div>
                          <div className="text-sm text-gray-300">
                            {artist.plays?.toLocaleString() || 0} plays
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ₵{artist.totalEarnings?.toLocaleString() || '0'}
                        </div>
                        {artist.growth && (
                          <div className="text-xs text-green-400">
                            ↑ {artist.growth}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Publishers */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-indigo-400" />
                  Top Publishers
                </h2>
                <button className="text-sm text-gray-300 hover:text-white flex items-center">
                  View All <Eye className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <LoadingSpinner />
                ) : topPublishers.length === 0 ? (
                  <ErrorMessage message="No publisher data available" />
                ) : (
                  topPublishers.map((publisher, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {publisher.company_name || 'Unknown Publisher'}
                          </div>
                          <div className="text-sm text-gray-300">
                            {publisher.artist_count || 0} artists • {publisher.total_tracks || 0} tracks
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ₵{publisher.total_earnings?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-indigo-400">
                          {publisher.verified ? '✓ Verified' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* System Health Monitor */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Database className="w-5 h-5 mr-2 text-green-400" />
                  System Health
                </h2>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  systemHealth.system_status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                  systemHealth.system_status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  systemHealth.system_status === 'critical' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {systemHealth.system_status || 'Unknown'}
                </div>
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">API Performance</span>
                    <span className={`font-semibold ${
                      (systemHealth.api_performance || 0) > 95 ? 'text-green-400' :
                      (systemHealth.api_performance || 0) > 85 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {systemHealth.api_performance || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${
                        (systemHealth.api_performance || 0) > 95 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        (systemHealth.api_performance || 0) > 85 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${systemHealth.api_performance || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Memory Usage</span>
                    <span className={`font-semibold ${
                      (systemHealth.resources?.memory_usage || 0) < 70 ? 'text-green-400' :
                      (systemHealth.resources?.memory_usage || 0) < 85 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {systemHealth.resources?.memory_usage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${
                        (systemHealth.resources?.memory_usage || 0) < 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        (systemHealth.resources?.memory_usage || 0) < 85 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${systemHealth.resources?.memory_usage || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">CPU Usage</span>
                    <span className={`font-semibold ${
                      (systemHealth.resources?.cpu_usage || 0) < 70 ? 'text-green-400' :
                      (systemHealth.resources?.cpu_usage || 0) < 85 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {systemHealth.resources?.cpu_usage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${
                        (systemHealth.resources?.cpu_usage || 0) < 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        (systemHealth.resources?.cpu_usage || 0) < 85 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${systemHealth.resources?.cpu_usage || 0}%` }}
                    />
                  </div>
                </div>
              )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    Payment Processing
                  </span>
                  <span className="text-green-400 font-semibold">Active</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Quick Admin Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Platform Report
                </button>
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center">
                  <Wallet className="w-4 h-4 mr-2" />
                  Process Bulk Payments
                </button>
                <button className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Review Pending Artists
                </button>
                <button className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Handle Disputes
                </button>
              </div>
            </div>

            {/* Platform Alerts */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <BellRing className="w-5 h-5 mr-2 text-red-400" />
                System Alerts
              </h2>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-3">
                  {/* Dynamic alerts based on system health and data */}
                  {systemHealth.system_status === 'critical' && (
                    <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                      <div className="text-red-400 font-medium text-sm">
                        Critical
                      </div>
                      <div className="text-white text-sm">
                        System health critical - immediate attention required
                      </div>
                    </div>
                  )}
                  
                  {(platformStats.pendingPayments || 0) > 0 && (
                    <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <div className="text-yellow-400 font-medium text-sm">
                        Medium Priority
                      </div>
                      <div className="text-white text-sm">
                        ₵{platformStats.pendingPayments?.toLocaleString()} in pending payments
                      </div>
                    </div>
                  )}

                  {recentActivity.filter(a => a.type === 'dispute').length > 0 && (
                    <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                      <div className="text-orange-400 font-medium text-sm">
                        Attention Required
                      </div>
                      <div className="text-white text-sm">
                        {recentActivity.filter(a => a.type === 'dispute').length} dispute(s) require review
                      </div>
                    </div>
                  )}

                  {systemHealth.database?.healthy === false && (
                    <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                      <div className="text-red-400 font-medium text-sm">
                        High Priority
                      </div>
                      <div className="text-white text-sm">
                        Database connectivity issues detected
                      </div>
                    </div>
                  )}

                  {/* Show info message if no alerts */}
                  {systemHealth.system_status === 'healthy' && 
                   (platformStats.pendingPayments || 0) === 0 && 
                   recentActivity.filter(a => a.type === 'dispute').length === 0 && (
                    <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <div className="text-green-400 font-medium text-sm">All Clear</div>
                      <div className="text-white text-sm">
                        No system alerts at this time
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternalAdminDashboard;
