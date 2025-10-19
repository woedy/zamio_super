import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Radio,
  Users,
  Globe,
  Download,
  Calendar,
  Filter,
  Search
} from 'lucide-react';

const ReportsAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last30days');
  const [stationFilter, setStationFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

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

  // Mock data for reports - Updated for Radio/TV Broadcast
  const reportData = {
    overview: {
      totalEarnings: 48500,
      totalAirplay: 285000,
      totalStations: 12,
      totalArtists: 45,
      growth: {
        earnings: 18.5,
        airplay: 22.3,
        stations: 8.7,
        artists: 12.1
      }
    },
    stationPerformance: [
      {
        station: 'Joy FM',
        region: 'Ghana',
        airplay: 89000,
        earnings: 15600,
        tracks: 120,
        artists: 35,
        avgPerPlay: 0.175,
        trend: 'up'
      },
      {
        station: 'Citi FM',
        region: 'Ghana',
        airplay: 67000,
        earnings: 11200,
        tracks: 95,
        artists: 28,
        avgPerPlay: 0.167,
        trend: 'up'
      },
      {
        station: 'BBC Africa',
        region: 'International',
        airplay: 56000,
        earnings: 12800,
        tracks: 85,
        artists: 22,
        avgPerPlay: 0.229,
        trend: 'down'
      },
      {
        station: 'VOA Africa',
        region: 'International',
        airplay: 43000,
        earnings: 8900,
        tracks: 67,
        artists: 18,
        avgPerPlay: 0.207,
        trend: 'up'
      }
    ],
    artistPerformance: [
      {
        artist: 'Sarah Johnson',
        region: 'Ghana',
        totalAirplay: 83000,
        totalEarnings: 1498,
        topStation: 'Joy FM',
        tracks: 12,
        avgPerTrack: 124.83,
        trend: 'up'
      },
      {
        artist: 'Michael Kwame',
        region: 'International',
        totalAirplay: 68000,
        totalEarnings: 1180,
        topStation: 'BBC Africa',
        tracks: 8,
        avgPerTrack: 147.50,
        trend: 'up'
      },
      {
        artist: 'Amara Okafor',
        region: 'West Africa',
        totalAirplay: 45000,
        totalEarnings: 785,
        topStation: 'Regional Stations',
        tracks: 6,
        avgPerTrack: 130.83,
        trend: 'down'
      }
    ],
    monthlyTrends: [
      { month: 'Jul', earnings: 8500, airplay: 45000 },
      { month: 'Aug', earnings: 9200, airplay: 48000 },
      { month: 'Sep', earnings: 10500, airplay: 52000 },
      { month: 'Oct', earnings: 12800, airplay: 67000 },
      { month: 'Nov', earnings: 11200, airplay: 59000 },
      { month: 'Dec', earnings: 14800, airplay: 78000 }
    ],
    regionalPerformance: [
      { region: 'Ghana', earnings: 26800, airplay: 156000, stations: 6, percentage: 55 },
      { region: 'International', earnings: 13900, airplay: 82000, stations: 4, percentage: 29 },
      { region: 'West Africa', earnings: 7800, airplay: 47000, stations: 2, percentage: 16 }
    ]
  };

  const filteredStationData = reportData.stationPerformance.filter(station => {
    if (stationFilter !== 'all' && station.station !== stationFilter) return false;
    if (regionFilter !== 'all' && station.region !== regionFilter) return false;
    return true;
  });

  const filteredArtistData = reportData.artistPerformance.filter(artist => {
    if (regionFilter !== 'all' && artist.region !== regionFilter) return false;
    return true;
  });

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                  <p className="text-gray-600 dark:text-gray-300 font-light">
                    Comprehensive insights into radio/TV airplay performance, earnings trends, and artist success metrics
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last3months">Last 3 Months</option>
                <option value="last6months">Last 6 Months</option>
                <option value="lastyear">Last Year</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/60 dark:border-slate-600/60 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                <Download className="w-4 h-4" />
                <span>Export</span>
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
            { id: 'stations', label: 'Stations', icon: Radio },
            { id: 'artists', label: 'Artists', icon: Users },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'regions', label: 'Regions', icon: Globe }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
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
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(reportData.overview.totalEarnings)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{reportData.overview.growth.earnings}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Airplay</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(reportData.overview.totalAirplay)}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{reportData.overview.growth.airplay}%
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Radio className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Stations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.overview.totalStations}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{reportData.overview.growth.stations}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Radio className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Artists</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.overview.totalArtists}
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{reportData.overview.growth.artists}%
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Earnings Trend */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Earnings Trend</h3>
                <div className="space-y-4">
                  {reportData.monthlyTrends.map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">{data.month}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{data.month} 2024</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(data.earnings)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{formatNumber(data.airplay)} plays</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Station Performance */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Performing Stations</h3>
                <div className="space-y-4">
                  {reportData.stationPerformance.slice(0, 4).map((station) => (
                    <div key={station.station} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          station.station === 'Joy FM' ? 'bg-green-500' :
                          station.station === 'Citi FM' ? 'bg-blue-500' :
                          station.station === 'BBC Africa' ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{station.station}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{station.region}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(station.earnings)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{formatNumber(station.airplay)} plays</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'stations' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Station Performance Analysis</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={stationFilter}
                  onChange={(e) => setStationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Stations</option>
                  <option value="Joy FM">Joy FM</option>
                  <option value="Citi FM">Citi FM</option>
                  <option value="BBC Africa">BBC Africa</option>
                  <option value="VOA Africa">VOA Africa</option>
                </select>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Regions</option>
                  <option value="Ghana">Ghana</option>
                  <option value="International">International</option>
                  <option value="West Africa">West Africa</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Station
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Airplay
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tracks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Artists
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avg/Play
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredStationData.map((station) => (
                    <tr key={station.station} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{station.station}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          station.region === 'Ghana' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          station.region === 'International' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                          'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                        }`}>
                          {station.region}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {formatNumber(station.airplay)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(station.earnings)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {station.tracks}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {station.artists}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {formatCurrency(station.avgPerPlay)}
                      </td>
                      <td className="px-6 py-4">
                        {station.trend === 'up' ? (
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
        )}

        {activeTab === 'artists' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Artist Performance Analysis</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Regions</option>
                  <option value="Ghana">Ghana</option>
                  <option value="International">International</option>
                  <option value="West Africa">West Africa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredArtistData.map((artist) => (
                <div key={artist.artist} className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{artist.artist}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{artist.region}</p>
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${artist.trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {artist.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Airplay</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(artist.totalAirplay)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Earnings</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(artist.totalEarnings)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Tracks</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{artist.tracks}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Avg/Track</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(artist.avgPerTrack)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Top Station: <span className="font-medium text-gray-900 dark:text-white">{artist.topStation}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Trends</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Performance Chart */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Monthly Performance</h4>
                <div className="space-y-3">
                  {reportData.monthlyTrends.map((data) => (
                    <div key={data.month} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{data.month}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{data.month} 2024</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(data.earnings)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{formatNumber(data.airplay)} airplay</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Indicators */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Growth Metrics</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-300">Earnings Growth</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Month over month</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-800 dark:text-green-300">+18.5%</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">Airplay Growth</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Total broadcast plays</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-300">+22.3%</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-medium text-purple-800 dark:text-purple-300">Artist Growth</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">New artists added</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-purple-800 dark:text-purple-300">+12.1%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'regions' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Regional Performance Analysis</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {reportData.regionalPerformance.map((region) => (
                <div key={region.region} className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        region.region === 'Ghana' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        region.region === 'International' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                        'bg-pink-100 dark:bg-pink-900/30'
                      }`}>
                        <Globe className={`w-6 h-6 ${
                          region.region === 'Ghana' ? 'text-yellow-600 dark:text-yellow-400' :
                          region.region === 'International' ? 'text-indigo-600 dark:text-indigo-400' :
                          'text-pink-600 dark:text-pink-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{region.region}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{region.stations} stations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{region.percentage}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">of total</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Earnings</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(region.earnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Airplay</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatNumber(region.airplay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Stations</span>
                      <span className="font-medium text-gray-900 dark:text-white">{region.stations}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReportsAnalytics;
