import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Music,
  MapPin,
  PieChart,
  Award,
  Download,
  Share2,
  Smartphone,
  Eye,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Radio,
  DollarSign,
  Target,
  Globe,
  Info,
  Activity,
  Calendar,
  Settings,
  Bell,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';

import HoverCard from '../components/HoverCard';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [chartFilters, setChartFilters] = useState({
    airplayTrends: {
      showPlays: true,
      showEarnings: true
    },
    regionalPerformance: {
      showPlays: true,
      showEarnings: true,
      showStations: true
    }
  });
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    content: string;
    x: number;
    y: number;
  }>({
    show: false,
    content: '',
    x: 0,
    y: 0
  });
  const statsData = {
    totalPlays: 45782,
    totalStations: 127,
    totalEarnings: 2847.5,
    growthRate: 23.5,
    activeTracks: 15,
    avgConfidence: 94.2
  };

  const topSongs = [
    {
      id: 1,
      title: 'Midnight Vibes',
      plays: 8745,
      earnings: 524.7,
      confidence: 98,
      stations: 45,
      trend: 'up'
    },
    {
      id: 2,
      title: 'Ghana My Home',
      plays: 7234,
      earnings: 434.04,
      confidence: 96,
      stations: 38,
      trend: 'up'
    },
    {
      id: 3,
      title: 'Love Letter',
      plays: 6543,
      earnings: 392.58,
      confidence: 94,
      stations: 32,
      trend: 'stable'
    },
    {
      id: 4,
      title: 'Hustle Hard',
      plays: 5432,
      earnings: 325.92,
      confidence: 92,
      stations: 28,
      trend: 'up'
    },
    {
      id: 5,
      title: 'Dance Floor',
      plays: 4321,
      earnings: 259.26,
      confidence: 89,
      stations: 24,
      trend: 'down'
    }
  ];

  const playsOverTime = [
    { date: 'Jan', airplay: 3200, earnings: 192.0 },
    { date: 'Feb', airplay: 4100, earnings: 246.0 },
    { date: 'Mar', airplay: 3800, earnings: 228.0 },
    { date: 'Apr', airplay: 5200, earnings: 312.0 },
    { date: 'May', airplay: 6100, earnings: 366.0 },
    { date: 'Jun', airplay: 7500, earnings: 450.0 },
    { date: 'Jul', airplay: 8900, earnings: 534.0 },
    { date: 'Aug', airplay: 9200, earnings: 552.0 },
    { date: 'Sep', airplay: 10800, earnings: 648.0 },
    { date: 'Oct', airplay: 12500, earnings: 750.0 },
    { date: 'Nov', airplay: 14200, earnings: 852.0 },
    { date: 'Dec', airplay: 15800, earnings: 948.0 }
  ];

  const stationBreakdown = [
    {
      station: 'Peace FM',
      plays: 1245,
      percentage: 28.5,
      region: 'Greater Accra',
      type: 'National'
    },
    {
      station: 'Hitz FM',
      plays: 987,
      percentage: 22.6,
      region: 'Greater Accra',
      type: 'Urban'
    },
    {
      station: 'Adom FM',
      plays: 743,
      percentage: 17.0,
      region: 'Ashanti',
      type: 'Regional'
    },
    {
      station: 'Joy FM',
      plays: 654,
      percentage: 15.0,
      region: 'Greater Accra',
      type: 'National'
    },
    {
      station: 'Okay FM',
      plays: 543,
      percentage: 12.4,
      region: 'Greater Accra',
      type: 'Urban'
    },
    {
      station: 'Others',
      plays: 198,
      percentage: 4.5,
      region: 'Various',
      type: 'Various'
    }
  ];

  const ghanaRegions = [
    {
      region: 'Greater Accra',
      plays: 15234,
      earnings: 913.04,
      stations: 45,
      growth: 15.2,
      trend: 'up'
    },
    {
      region: 'Ashanti',
      plays: 12543,
      earnings: 752.58,
      stations: 32,
      growth: 12.8,
      trend: 'up'
    },
    {
      region: 'Northern',
      plays: 8765,
      earnings: 525.9,
      stations: 18,
      growth: 18.5,
      trend: 'up'
    },
    {
      region: 'Western',
      plays: 6543,
      earnings: 392.58,
      stations: 15,
      growth: 8.9,
      trend: 'stable'
    },
    {
      region: 'Eastern',
      plays: 4321,
      earnings: 259.26,
      stations: 12,
      growth: 11.3,
      trend: 'up'
    },
    {
      region: 'Central',
      plays: 3456,
      earnings: 207.36,
      stations: 8,
      growth: 7.2,
      trend: 'stable'
    }
  ];

  // Sample target data for progress tracking
  const monthlyTargets = {
    airplayTarget: 20000,
    earningsTarget: 1200,
    stationsTarget: 150,
    confidenceTarget: 95
  };

  const performanceScore = {
    overall: 8.7,
    airplayGrowth: 9.2,
    regionalReach: 8.5,
    fanEngagement: 8.8,
    trackQuality: 9.0
  };

  const maxPlays = Math.max(...playsOverTime.map((d) => d.airplay));
  const maxRegionalPlays = Math.max(...ghanaRegions.map((r) => r.plays));

  const statusColors = {
    excellent: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      accent: 'text-emerald-600 dark:text-emerald-400'
    },
    good: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      accent: 'text-blue-600 dark:text-blue-400'
    },
    average: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      accent: 'text-amber-600 dark:text-amber-400'
    },
    poor: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      accent: 'text-red-600 dark:text-red-400'
    }
  };

  const warmDarkColors = {
    background: {
      primary: '#0f0f0f',
      secondary: '#1a1a1a',
      tertiary: '#262626',
      elevated: '#2d2d2d',
    },
    surface: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#d4d4d4',
      tertiary: '#a3a3a3',
      muted: '#737373',
    },
    border: {
      light: '#404040',
      medium: '#525252',
      dark: '#737373',
    }
  };

  const getStatusColor = (value: number, thresholds = { excellent: 90, good: 80, average: 70 }) => {
    if (value >= thresholds.excellent) return statusColors.excellent;
    if (value >= thresholds.good) return statusColors.good;
    if (value >= thresholds.average) return statusColors.average;
    return statusColors.poor;
  };

  const [viewTransition, setViewTransition] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    // Simulate chart loading
    const timer = setTimeout(() => {
      setIsLoadingCharts(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const ChartSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 rounded-lg h-64 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  );

  const viewTransitionStyles = viewTransition
    ? 'opacity-0 scale-95 translate-y-2'
    : 'opacity-100 scale-100 translate-y-0';

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  const toggleChartFilter = (chartType: keyof typeof chartFilters, filterKey: string) => {
    setChartFilters(prev => ({
      ...prev,
      [chartType]: {
        ...prev[chartType],
        [filterKey]: !prev[chartType][filterKey as keyof typeof prev[typeof chartType]]
      }
    }));
  };

  const getRegionColors = (index: number) => {
    const colors = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-yellow-500 to-green-500',
      'from-orange-500 to-yellow-500',
      'from-red-500 to-orange-500',
      'from-purple-500 to-pink-500',
    ];
    return colors[index % colors.length];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ChevronUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ChevronDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-blue-500"></div>;
    }
  };

  return (
    <>
      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltip.content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
        </div>
      )}

      {/* Page header */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Welcome back! Here's your music performance overview.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${viewTransitionStyles}`}>
            <div className="bg-gradient-to-br from-red-50/90 via-orange-50/80 to-pink-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-red-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-red-300 dark:hover:border-red-700/70 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Total Airplay</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                    {statsData.totalPlays.toLocaleString()}
                  </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/60 dark:to-orange-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Radio className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center mr-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-green-600 dark:text-green-400">+{statsData.growthRate}%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">Monthly Target</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {statsData.totalPlays.toLocaleString()} / {monthlyTargets.airplayTarget.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((statsData.totalPlays / monthlyTargets.airplayTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Total Earnings</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  ₵{statsData.totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/60 dark:to-green-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="flex items-center mr-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-green-600 dark:text-green-400">+18.2%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">Monthly Target</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  ₵{statsData.totalEarnings.toLocaleString()} / ₵{monthlyTargets.earningsTarget.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((statsData.totalEarnings / monthlyTargets.earningsTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Active Stations</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                  {statsData.totalStations}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Across Ghana</span>
              <div className="flex items-center">
                <div className="w-8 h-1 bg-gray-200 dark:bg-slate-600 rounded-full mr-2">
                  <div className="w-full h-full bg-orange-400 rounded-full" style={{ width: `${(statsData.totalStations / monthlyTargets.stationsTarget) * 100}%` }}></div>
                </div>
                <span className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                  {Math.round((statsData.totalStations / monthlyTargets.stationsTarget) * 100)}%
                </span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">Monthly Target</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {statsData.totalStations} / {monthlyTargets.stationsTarget}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((statsData.totalStations / monthlyTargets.stationsTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/90 via-violet-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Avg. Confidence</p>
                <p className={`text-2xl sm:text-3xl font-bold leading-tight group-hover:scale-105 transition-transform duration-300 ${
                  statsData.avgConfidence >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                  statsData.avgConfidence >= 80 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {statsData.avgConfidence}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 ${
                statsData.avgConfidence >= 90 ? 'bg-emerald-100/80 dark:bg-emerald-900/60' :
                statsData.avgConfidence >= 80 ? 'bg-blue-100/80 dark:bg-blue-900/60' :
                'bg-red-100/80 dark:bg-red-900/60'
              }`}>
                <Target className={`w-6 h-6 ${
                  statsData.avgConfidence >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                  statsData.avgConfidence >= 80 ? 'text-blue-600 dark:text-blue-400' :
                  'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Track recognition rate</span>
              <div className="flex items-center">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(statsData.avgConfidence).bg
                } ${getStatusColor(statsData.avgConfidence).border} ${getStatusColor(statsData.avgConfidence).text}`}>
                  {statsData.avgConfidence >= 90 ? 'Excellent' :
                   statsData.avgConfidence >= 80 ? 'Good' :
                   statsData.avgConfidence >= 70 ? 'Average' : 'Needs Work'}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">Target</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {statsData.avgConfidence}% / {monthlyTargets.confidenceTarget}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((statsData.avgConfidence / monthlyTargets.confidenceTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${viewTransitionStyles}`}>
          {/* Left Column - Charts and Data */}
          <div className={`lg:col-span-2 space-y-6 ${viewTransitionStyles}`}>
            {/* Plays Over Time Chart */}
            <div className={`bg-gradient-to-br from-blue-50/90 via-cyan-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 ${viewTransitionStyles}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Airplay Trends
                </h2>
                <div className="flex items-center space-x-4">
                  <button
                    className={`flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-300 ${
                      chartFilters.airplayTrends.showPlays
                        ? 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-transparent hover:border-gray-200 dark:hover:border-slate-600'
                    }`}
                    onClick={() => toggleChartFilter('airplayTrends', 'showPlays')}
                  >
                    <div className={`w-3 h-3 rounded-full ${chartFilters.airplayTrends.showPlays ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <span className="text-sm font-medium">Plays</span>
                  </button>
                  <button
                    className={`flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-300 ${
                      chartFilters.airplayTrends.showEarnings
                        ? 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-transparent hover:border-gray-200 dark:hover:border-slate-600'
                    }`}
                    onClick={() => toggleChartFilter('airplayTrends', 'showEarnings')}
                  >
                    <div className={`w-3 h-3 rounded-full ${chartFilters.airplayTrends.showEarnings ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <span className="text-sm font-medium">Earnings</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {playsOverTime.map((month, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                      {month.date}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2 relative group">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 cursor-pointer"
                            style={{ width: `${(month.airplay / maxPlays) * 100}%` }}
                            onMouseEnter={(e) => showTooltip(`${month.airplay.toLocaleString()} plays`, e)}
                            onMouseLeave={hideTooltip}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
                          {month.airplay.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-20 text-sm text-green-600 dark:text-green-400 text-right cursor-pointer"
                      onMouseEnter={(e) => showTooltip(`₵${month.earnings.toFixed(0)} earned`, e)}
                      onMouseLeave={hideTooltip}
                    >
                      ₵{month.earnings.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Songs */}
            <div className="bg-gradient-to-br from-purple-50/90 via-pink-50/80 to-rose-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                  <Music className="w-5 h-5 mr-2 text-purple-500" />
                  Top Performing Tracks
                </h2>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center font-medium transition-colors duration-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 px-2 py-1 rounded-md">
                  View All <Eye className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {topSongs.map((song, index) => (
                  <div key={song.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-4 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-2 sm:space-y-0 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-slate-600/50 dark:hover:to-slate-700/50 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer group min-h-[60px]">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                          {song.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                          {song.stations} stations • {song.confidence}% accuracy
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-right">
                        <HoverCard
                          trigger={
                            <p
                              className="font-semibold text-gray-900 dark:text-white cursor-pointer text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300"
                            >
                              {song.plays.toLocaleString()}
                            </p>
                          }
                          content={[
                            { label: 'Total Plays', value: song.plays.toLocaleString() },
                            { label: 'Stations', value: `${song.stations}` },
                            { label: 'Trend', value: song.trend === 'up' ? 'Increasing' : song.trend === 'down' ? 'Decreasing' : 'Stable' }
                          ]}
                          position="top"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">plays</p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-semibold text-green-600 dark:text-green-400 cursor-pointer text-sm sm:text-base group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors duration-300"
                          onMouseEnter={(e) => showTooltip(`₵${song.earnings.toFixed(2)} earned from ${song.plays.toLocaleString()} plays`, e)}
                          onMouseLeave={hideTooltip}
                        >
                          ₵{song.earnings.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">earned</p>
                      </div>
                      <div className="flex items-center cursor-pointer group-hover:scale-110 transition-transform duration-300"
                           onMouseEnter={(e) => showTooltip(`Trend: ${song.trend === 'up' ? 'Increasing' : song.trend === 'down' ? 'Decreasing' : 'Stable'} performance`, e)}
                           onMouseLeave={hideTooltip}>
                        {getTrendIcon(song.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Performance */}
            <div className="bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-500" />
                  Regional Performance
                </h2>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Regions</option>
                  {ghanaRegions.map((region) => (
                    <option key={region.region} value={region.region}>
                      {region.region}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ghanaRegions.map((region, index) => (
                  <div key={region.region} className="p-4 sm:p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-slate-600/50 dark:hover:to-slate-700/50 hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer group min-h-[60px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                        {region.region}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs sm:text-sm font-medium ${
                          region.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
                          region.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                          {region.trend === 'up' ? '+' : region.trend === 'down' ? '-' : ''}
                          {region.growth}%
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          region.trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' :
                          region.trend === 'down' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' :
                          'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        }`}>
                          {region.trend === 'up' ? 'Growing' : region.trend === 'down' ? 'Declining' : 'Stable'}
                        </div>
                        <div className="group-hover:scale-110 transition-transform duration-300">
                          {getTrendIcon(region.trend)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">Plays</span>
                        <div className="flex items-center space-x-2">
                          <span
                            className="font-medium text-gray-900 dark:text-white cursor-pointer"
                            onMouseEnter={(e) => showTooltip(`${region.plays.toLocaleString()} total plays in ${region.region}`, e)}
                            onMouseLeave={hideTooltip}
                          >
                            {region.plays.toLocaleString()}
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            region.plays > 10000 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' :
                            region.plays > 5000 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' :
                            region.plays > 1000 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' :
                            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                          }`}>
                            {region.plays > 10000 ? 'High' : region.plays > 5000 ? 'Medium' : region.plays > 1000 ? 'Low' : 'Very Low'}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">Earnings</span>
                        <div className="flex items-center space-x-2">
                          <span
                            className="font-medium text-green-600 dark:text-green-400 cursor-pointer"
                            onMouseEnter={(e) => showTooltip(`₵${region.earnings.toFixed(2)} earned from ${region.plays.toLocaleString()} plays`, e)}
                            onMouseLeave={hideTooltip}
                          >
                            ₵{region.earnings.toFixed(2)}
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            region.earnings > 5000 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' :
                            region.earnings > 2000 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' :
                            region.earnings > 500 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' :
                            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                          }`}>
                            {region.earnings > 5000 ? 'High' : region.earnings > 2000 ? 'Medium' : region.earnings > 500 ? 'Low' : 'Very Low'}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">Stations</span>
                        <div className="flex items-center space-x-2">
                          <span
                            className="font-medium text-orange-600 dark:text-orange-400 cursor-pointer"
                            onMouseEnter={(e) => showTooltip(`${region.stations} active stations in ${region.region}`, e)}
                            onMouseLeave={hideTooltip}
                          >
                            {region.stations}
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            region.stations > 15 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' :
                            region.stations > 10 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' :
                            region.stations > 5 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' :
                            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                          }`}>
                            {region.stations > 15 ? 'Excellent' : region.stations > 10 ? 'Good' : region.stations > 5 ? 'Fair' : 'Limited'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 relative group">
                      <div
                        className={`h-full bg-gradient-to-r ${getRegionColors(index)} rounded-full cursor-pointer transition-all duration-300`}
                        style={{ width: `${(region.plays / maxRegionalPlays) * 100}%` }}
                        onMouseEnter={(e) => showTooltip(`${Math.round((region.plays / maxRegionalPlays) * 100)}% of total regional plays`, e)}
                        onMouseLeave={hideTooltip}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar widgets */}
          <div className="space-y-6">
            {/* Station Breakdown */}
            <div className="bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-orange-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-amber-500" />
                  Top Stations
                </h2>
              </div>
              <div className="space-y-4">
                {stationBreakdown.map((station, index) => (
                  <div key={station.station} className="flex items-center space-x-3 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 dark:hover:from-slate-600/50 dark:hover:to-slate-700/50 hover:scale-[1.02] hover:shadow-sm transition-all duration-300 cursor-pointer group p-3 sm:p-2 rounded-lg min-h-[50px]">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                          {station.station}
                        </span>
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400 group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors duration-300">
                          {station.percentage}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 leading-relaxed group-hover:text-amber-600/80 dark:group-hover:text-amber-400/80 transition-colors duration-300">
                        {station.region} • {station.type}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 group-hover:shadow-inner transition-all duration-300">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full group-hover:from-amber-400 group-hover:to-orange-400 transition-colors duration-300"
                          style={{ width: `${station.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Score */}
            <div className="bg-gradient-to-br from-violet-50/90 via-purple-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-violet-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-violet-500" />
                  Performance Score
                </h2>
              </div>
              <div className="text-center mb-6">
                <div className={`text-3xl sm:text-4xl font-bold mb-2 ${
                  performanceScore.overall >= 8 ? 'text-emerald-600 dark:text-emerald-400' :
                  performanceScore.overall >= 6 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {performanceScore.overall}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium mx-auto w-fit ${
                  getStatusColor(performanceScore.overall * 10).bg
                } ${getStatusColor(performanceScore.overall * 10).border} ${getStatusColor(performanceScore.overall * 10).text}`}>
                  {performanceScore.overall >= 8 ? 'Excellent Performance' :
                   performanceScore.overall >= 6 ? 'Good Performance' :
                   performanceScore.overall >= 5 ? 'Average Performance' : 'Needs Improvement'}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Airplay Growth</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getStatusColor(performanceScore.airplayGrowth * 10).accent}`}>
                      {performanceScore.airplayGrowth}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(performanceScore.airplayGrowth * 10).bg
                    } ${getStatusColor(performanceScore.airplayGrowth * 10).border} ${getStatusColor(performanceScore.airplayGrowth * 10).text}`}>
                      {performanceScore.airplayGrowth >= 8 ? 'Excellent' :
                       performanceScore.airplayGrowth >= 6 ? 'Good' :
                       performanceScore.airplayGrowth >= 5 ? 'Average' : 'Poor'}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Regional Reach</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2 relative group">
                      <div
                        className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                          performanceScore.regionalReach >= 8 ? 'bg-green-500' :
                          performanceScore.regionalReach >= 6 ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${performanceScore.regionalReach * 10}%` }}
                        onMouseEnter={(e) => showTooltip(`${performanceScore.regionalReach}/10 - ${performanceScore.regionalReach >= 8 ? 'Excellent' : performanceScore.regionalReach >= 6 ? 'Good' : 'Needs Improvement'} regional coverage`, e)}
                        onMouseLeave={hideTooltip}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceScore.regionalReach}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(performanceScore.regionalReach * 10).bg
                    } ${getStatusColor(performanceScore.regionalReach * 10).border} ${getStatusColor(performanceScore.regionalReach * 10).text}`}>
                      {performanceScore.regionalReach >= 8 ? 'Excellent' :
                       performanceScore.regionalReach >= 6 ? 'Good' :
                       performanceScore.regionalReach >= 5 ? 'Average' : 'Poor'}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Track Quality</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2 relative group">
                      <div
                        className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                          performanceScore.trackQuality >= 8 ? 'bg-green-500' :
                          performanceScore.trackQuality >= 6 ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${performanceScore.trackQuality * 10}%` }}
                        onMouseEnter={(e) => showTooltip(`${performanceScore.trackQuality}/10 - ${performanceScore.trackQuality >= 8 ? 'Excellent' : performanceScore.trackQuality >= 6 ? 'Good' : 'Needs Improvement'} track recognition`, e)}
                        onMouseLeave={hideTooltip}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {performanceScore.trackQuality}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(performanceScore.trackQuality * 10).bg
                    } ${getStatusColor(performanceScore.trackQuality * 10).border} ${getStatusColor(performanceScore.trackQuality * 10).text}`}>
                      {performanceScore.trackQuality >= 8 ? 'Excellent' :
                       performanceScore.trackQuality >= 6 ? 'Good' :
                       performanceScore.trackQuality >= 5 ? 'Average' : 'Poor'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/80 to-red-50/90 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-slate-900/90 backdrop-blur-sm rounded-xl shadow-lg border border-rose-200/50 dark:border-slate-700/50 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl active:shadow-md active:scale-[0.98] transform">
                  <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  Download Report
                </button>
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 active:from-blue-800 active:to-cyan-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 border border-blue-200/50 hover:border-blue-300/70 active:border-blue-400/80 flex items-center justify-center shadow-lg hover:shadow-xl active:shadow-md active:scale-[0.98] transform group">
                  <Share2 className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  Share Stats
                </button>
                <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 border border-emerald-200/50 hover:border-emerald-300/70 active:border-emerald-400/80 flex items-center justify-center shadow-lg hover:shadow-xl active:shadow-md active:scale-[0.98] transform group">
                  <Smartphone className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  Mobile Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;