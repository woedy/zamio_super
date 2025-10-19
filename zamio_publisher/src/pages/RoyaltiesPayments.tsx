import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Music,
  Disc,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Play,
  Pause,
  Volume2,
  User,
  Users,
  Globe,
  Award,
  CheckCircle,
  AlertCircle,
  Settings,
  Activity,
  Star,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Zap,
  Target,
  DollarSign,
  PiggyBank,
  Wallet,
  Bell,
  RefreshCw,
  Minus,
  X,
  Check,
  Info,
  FileText,
  Radio,
  Headphones,
  Mic,
  Crown,
  Gem,
  Wifi,
  Lock,
  EyeOff,
  Tag,
  MapPin,
  Smartphone,
  Monitor,
  Key,
  FileAudio,
  XCircle,
  ArrowUpDown,
  CreditCard,
  PieChart,
  Send,
  HelpCircle
} from 'lucide-react';

// Mock data for royalties and payments - Updated for Radio/TV Broadcast
const mockEarnings = [
  {
    id: 1,
    period: 'October 2024',
    totalEarnings: 12500,
    platformBreakdown: {
      joyFM: 3500,
      citiFM: 2800,
      bbcAfrica: 2100,
      voaAfrica: 1800,
      regionalStations: 1500
    },
    status: 'paid',
    paidDate: '2024-11-01',
    tracks: 45,
    artists: 12,
    broadcastHours: 156
  },
  {
    id: 2,
    period: 'September 2024',
    totalEarnings: 11200,
    platformBreakdown: {
      joyFM: 3200,
      citiFM: 2600,
      bbcAfrica: 1900,
      voaAfrica: 1600,
      regionalStations: 1300
    },
    status: 'paid',
    paidDate: '2024-10-01',
    tracks: 42,
    artists: 11,
    broadcastHours: 142
  },
  {
    id: 3,
    period: 'August 2024',
    totalEarnings: 9800,
    platformBreakdown: {
      joyFM: 2900,
      citiFM: 2300,
      bbcAfrica: 1700,
      voaAfrica: 1400,
      regionalStations: 1100
    },
    status: 'pending',
    tracks: 38,
    artists: 10,
    broadcastHours: 128
  }
];

const mockTopTracks = [
  {
    id: 1,
    title: 'Midnight Dreams',
    artist: 'Sarah Johnson',
    airplay: 45000,
    earnings: 875,
    station: 'Joy FM',
    trend: 'up',
    region: 'Ghana'
  },
  {
    id: 2,
    title: 'City Lights',
    artist: 'Sarah Johnson',
    airplay: 38000,
    earnings: 623,
    station: 'Citi FM',
    trend: 'up',
    region: 'Ghana'
  },
  {
    id: 3,
    title: 'Soul Connection',
    artist: 'Amara Okafor',
    airplay: 32000,
    earnings: 469,
    station: 'BBC Africa',
    trend: 'down',
    region: 'International'
  },
  {
    id: 4,
    title: 'Afro Vibes Vol. 2',
    artist: 'Michael Kwame',
    airplay: 28000,
    earnings: 392,
    station: 'VOA Africa',
    trend: 'up',
    region: 'International'
  }
];

const mockPaymentSchedule = [
  {
    id: 1,
    artist: 'Sarah Johnson',
    amount: 1250,
    status: 'scheduled',
    dueDate: '2024-11-15',
    tracks: ['Midnight Dreams', 'City Lights'],
    station: 'Multiple Ghanaian Stations',
    region: 'Ghana'
  },
  {
    id: 2,
    artist: 'Michael Kwame',
    amount: 890,
    status: 'processing',
    dueDate: '2024-11-10',
    tracks: ['Afro Vibes Vol. 2'],
    station: 'BBC Africa',
    region: 'International'
  },
  {
    id: 3,
    artist: 'Amara Okafor',
    amount: 650,
    status: 'paid',
    dueDate: '2024-10-15',
    tracks: ['Soul Connection'],
    station: 'Regional Stations',
    region: 'West Africa'
  }
];

// RoyaltiesPayments Page
const RoyaltiesPayments: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('earnings');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'processing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'scheduled': return <Calendar className="w-3 h-3" />;
      case 'processing': return <RefreshCw className="w-3 h-3" />;
      case 'failed': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const filteredTopTracks = useMemo(() => {
    let data = mockTopTracks;

    if (searchTerm) {
      data = data.filter(track =>
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (stationFilter !== 'all') {
      data = data.filter(track => track.station === stationFilter);
    }

    data.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'artist':
          aValue = a.artist;
          bValue = b.artist;
          break;
        case 'airplay':
          aValue = a.airplay;
          bValue = b.airplay;
          break;
        case 'earnings':
          aValue = a.earnings;
          bValue = b.earnings;
          break;
        default:
          aValue = a.earnings;
          bValue = b.earnings;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return data;
  }, [searchTerm, stationFilter, sortBy, sortOrder]);

  const filteredPayments = useMemo(() => {
    return mockPaymentSchedule.filter(payment => {
      if (statusFilter === 'all') return true;
      return payment.status === statusFilter;
    });
  }, [statusFilter]);

  const totalEarnings = mockEarnings.reduce((acc, earning) => acc + earning.totalEarnings, 0);
  const paidEarnings = mockEarnings.filter(e => e.status === 'paid').reduce((acc, earning) => acc + earning.totalEarnings, 0);
  const pendingEarnings = mockEarnings.filter(e => e.status === 'pending').reduce((acc, earning) => acc + earning.totalEarnings, 0);

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Royalties & Payments</h1>
                  <p className="text-gray-600 dark:text-gray-300 font-light">
                    Track earnings from radio and TV airplay, manage royalty distributions, and handle payments to Ghanaian and international artists
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(totalEarnings)}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid Out</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(paidEarnings)}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {formatCurrency(pendingEarnings)}
                      </p>
                    </div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/60 dark:border-slate-600/60 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/royalties/process-payments')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Send className="w-4 h-4" />
                <span>Process Payments</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl border border-gray-200 dark:border-slate-600 backdrop-blur-sm">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'earnings', label: 'Earnings', icon: TrendingUp },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'distribution', label: 'Distribution', icon: PieChart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border border-white/20 hover:border-white/40'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <>
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Earnings Trend */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Earnings</h3>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+12.5%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockEarnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{earning.period}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {earning.tracks} tracks • {earning.artists} artists
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(earning.totalEarnings)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(earning.status)}`}>
                          {getStatusIcon(earning.status)}
                          <span className="ml-1 capitalize">{earning.status}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Breakdown */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Station Airplay Breakdown</h3>

                <div className="space-y-4">
                  {Object.entries(mockEarnings[0]?.platformBreakdown || {}).map(([station, amount]) => (
                    <div key={station} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          station === 'joyFM' ? 'bg-green-500' :
                          station === 'citiFM' ? 'bg-blue-500' :
                          station === 'bbcAfrica' ? 'bg-purple-500' :
                          station === 'voaAfrica' ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {station === 'joyFM' ? 'Joy FM' :
                           station === 'citiFM' ? 'Citi FM' :
                           station === 'bbcAfrica' ? 'BBC Africa' :
                           station === 'voaAfrica' ? 'VOA Africa' :
                           'Regional Stations'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(amount as number)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {Math.round((amount as number / 12500) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total This Month</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(12500)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Tracks */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Airplay Tracks</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tracks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48"
                    />
                  </div>
                  <select
                    value={stationFilter}
                    onChange={(e) => setStationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Stations</option>
                    <option value="Joy FM">Joy FM</option>
                    <option value="Citi FM">Citi FM</option>
                    <option value="BBC Africa">BBC Africa</option>
                    <option value="VOA Africa">VOA Africa</option>
                    <option value="Regional Stations">Regional Stations</option>
                  </select>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button className="flex items-center space-x-1" onClick={() => handleSort('title')}>
                          <span>Track</span>
                          {getSortIcon('title')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button className="flex items-center space-x-1" onClick={() => handleSort('artist')}>
                          <span>Artist</span>
                          {getSortIcon('artist')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Station
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button className="flex items-center space-x-1" onClick={() => handleSort('airplay')}>
                          <span>Airplay</span>
                          {getSortIcon('airplay')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button className="flex items-center space-x-1" onClick={() => handleSort('earnings')}>
                          <span>Earnings</span>
                          {getSortIcon('earnings')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredTopTracks.map((track) => (
                      <tr key={track.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {track.artist}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            track.station === 'Joy FM' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            track.station === 'Citi FM' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            track.station === 'BBC Africa' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            track.station === 'VOA Africa' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {track.station}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            track.region === 'Ghana' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            track.region === 'International' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                          }`}>
                            {track.region}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {formatNumber(track.airplay)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(track.earnings)}
                        </td>
                        <td className="px-6 py-4">
                          {track.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'earnings' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Earnings History</h3>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {mockEarnings.map((earning) => (
                <div key={earning.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{earning.period}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {earning.tracks} tracks • {earning.artists} artists
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(earning.totalEarnings)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(earning.status)}`}>
                        {getStatusIcon(earning.status)}
                        <span className="ml-1 capitalize">{earning.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(earning.platformBreakdown).map(([station, amount]) => (
                      <div key={station} className="text-center">
                        <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          station === 'joyFM' ? 'bg-green-100 dark:bg-green-900/30' :
                          station === 'citiFM' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          station === 'bbcAfrica' ? 'bg-purple-100 dark:bg-purple-900/30' :
                          station === 'voaAfrica' ? 'bg-orange-100 dark:bg-orange-900/30' :
                          'bg-gray-100 dark:bg-gray-900/30'
                        }`}>
                          <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                          {station === 'joyFM' ? 'Joy FM' :
                           station === 'citiFM' ? 'Citi FM' :
                           station === 'bbcAfrica' ? 'BBC Africa' :
                           station === 'voaAfrica' ? 'VOA Africa' :
                           'Regional Stations'}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(amount as number)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Schedule</h3>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{payment.artist}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.tracks.length} track{payment.tracks.length > 1 ? 's' : ''} • {payment.station}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Royalty Distribution */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Royalty Distribution</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Artist Share</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">70% of total royalties</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalEarnings * 0.7)}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Music className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Publisher Share</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">25% of total royalties</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalEarnings * 0.25)}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Mechanical Rights</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">5% administrative fee</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalEarnings * 0.05)}
                  </p>
                </div>
              </div>
            </div>

            {/* Distribution Settings */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Distribution Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Auto-Payout Threshold</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Minimum amount for automatic payments</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">$500.00</p>
                    <button className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                      Edit
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Payment Frequency</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">How often payments are processed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">Monthly</p>
                    <button className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                      Edit
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Default Split</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Standard royalty split for new tracks</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">70/25/5</p>
                    <button className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Settings className="w-4 h-4" />
                  <span>Manage Distribution Rules</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RoyaltiesPayments;
