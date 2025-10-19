import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Play,
  Heart,
  Share2,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Globe,
  FileText,
  BarChart3,
  MapPin,
  Music,
  Calendar,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Download,
  Search,
  Award,
  Target,
  Filter,
  HelpCircle,
  Settings,
  Edit,
  Trash2,
  Eye,
  Album as AlbumIcon
} from 'lucide-react';

// Mock album data - enhanced with more realistic structure
const mockAlbumData = {
  id: '1',
  title: '5 Star',
  artist_name: 'King Promise',
  genre_name: 'Afrobeats',
  release_date: '2023-06-15',
  total_tracks: 12,
  total_plays: 1247000,
  total_revenue: 23475.50,
  cover_art: '/albums/5-star.jpg',
  description: 'King Promise\'s highly anticipated album featuring hit singles and collaborations with top artists.',
  status: 'active',
  tracks: [
    {
      id: '1',
      title: 'Ghana Na Woti',
      duration: '3:45',
      plays: 450000,
      revenue: 8750.00,
      release_date: '2023-06-15'
    },
    {
      id: '2',
      title: 'Terminator',
      duration: '3:22',
      plays: 320000,
      revenue: 6240.00,
      release_date: '2023-06-15'
    },
    {
      id: '3',
      title: 'Perfect Combi',
      duration: '3:15',
      plays: 280000,
      revenue: 5460.00,
      release_date: '2023-06-15'
    },
    {
      id: '4',
      title: 'Paris',
      duration: '3:08',
      plays: 197000,
      revenue: 3841.50,
      release_date: '2023-06-15'
    }
  ],
  monthly_revenue: [
    { month: 'Jun 2023', amount: 4500.00, currency: 'GHS' },
    { month: 'Jul 2023', amount: 5230.00, currency: 'GHS' },
    { month: 'Aug 2023', amount: 6120.00, currency: 'GHS' },
    { month: 'Sep 2023', amount: 3870.00, currency: 'GHS' },
    { month: 'Oct 2023', amount: 3755.50, currency: 'GHS' }
  ],
  territory_revenue: [
    { territory: 'Ghana', amount: 18760.00, currency: 'GHS', percentage: 80 },
    { territory: 'Nigeria', amount: 2345.00, currency: 'GHS', percentage: 10 },
    { territory: 'UK', amount: 1407.00, currency: 'GHS', percentage: 6 },
    { territory: 'USA', amount: 938.00, currency: 'GHS', percentage: 4 }
  ],
  contributors: [
    { role: 'Producer', name: 'KillBeatz', percentage: 25 },
    { role: 'Featured Artist', name: 'Shatta Wale', percentage: 15 },
    { role: 'Mixing Engineer', name: 'MikeMillzOnEm', percentage: 10 }
  ],
  top_stations: [
    { name: "Joy FM", count: 156, region: 'Greater Accra' },
    { name: "Peace FM", count: 134, region: 'Greater Accra' },
    { name: "Adom FM", count: 98, region: 'Ashanti' },
    { name: "Hitz FM", count: 87, region: 'Greater Accra' },
    { name: "Okay FM", count: 76, region: 'Greater Accra' }
  ],
  plays_over_time: [
    { month: 'Jun', plays: 245000 },
    { month: 'Jul', plays: 389000 },
    { month: 'Aug', plays: 567000 },
    { month: 'Sep', plays: 723000 },
    { month: 'Oct', plays: 1247000 }
  ]
};

const AlbumDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { albumId } = location.state || {};

  // Get album data - for demo, we'll use the first album or find by ID
  const album = albumId ? mockAlbumData : mockAlbumData;

  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'performance' | 'contributors'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'performance', label: 'Performance' },
    { id: 'contributors', label: 'Contributors' }
  ] as const;

  return (
    <>
      {/* Enhanced Back Navigation with Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
          <button
            onClick={() => navigate('/dashboard/album-list')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1"
            aria-label="Go back to album list"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Album Management</span>
            <span className="sm:hidden">Back</span>
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">Album Details</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-purple-600 dark:text-purple-400 font-medium truncate max-w-32">
            {album.title}
          </span>
        </nav>

        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500" title="Refresh data">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500" title="Export report">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500" title="Share album">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Search/Filter Controls */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tracks..."
                className="pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 w-48"
                aria-label="Search album tracks"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page header with enhanced context */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded-full">
                  {album.genre_name}
                </span>
                <span className={`px-2 py-1 ${album.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'} text-xs font-medium rounded-full`}>
                  {album.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Comprehensive analytics and performance data for <span className="font-medium text-gray-900 dark:text-white">{album.title}</span> by {album.artist_name}
              </p>
            </div>

            {/* Quick Stats in Header */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {album.total_tracks}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Tracks</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {album.total_plays.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Plays</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  ₵{album.total_revenue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8" role="main">
        {/* Album Info Card - Enhanced Glassmorphism */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/30 shadow-2xl hover:shadow-3xl transition-all duration-300 group" role="region" aria-labelledby="album-info-title">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Enhanced Album Art with Glow */}
            <div className="relative flex-shrink-0">
              <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300">
                <img
                  src={album.cover_art}
                  alt={`${album.title} cover art`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              {/* Floating Play Button */}
              <button
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group-hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                aria-label={`Play ${album.title}`}
              >
                <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
              </button>
            </div>

            {/* Enhanced Album Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h1 id="album-info-title" className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  {album.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  by {album.artist_name}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Music className="w-4 h-4" />
                    <span>{album.genre_name}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{album.total_tracks} tracks</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(album.release_date).toLocaleDateString()}</span>
                  </span>
                </div>
                {album.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                    {album.description}
                  </p>
                )}
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                  aria-label={`Play ${album.title}`}
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  <span className="font-medium">Play Album</span>
                </button>
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-slate-600 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all duration-200 group-hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 relative"
                  aria-label="Add to favorites"
                >
                  <Heart className="w-5 h-5" />
                  <span>Add to Favorites</span>
                </button>
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-slate-600 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all duration-200 group-hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 relative group"
                  aria-label="Share album"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-slate-600 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all duration-200 group-hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 relative group"
                  aria-label="Edit album"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>

            {/* Enhanced Stats Card */}
            <div className="bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-indigo-50/80 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-lg">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {album.total_plays.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Total Plays
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Enhanced Responsive Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-slate-600/60 p-4 lg:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-normal text-gray-700 dark:text-slate-300">Total Tracks</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                  {album.total_tracks}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/60 dark:to-green-900/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Music className="w-4 h-4 lg:w-6 lg:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50/90 via-cyan-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/60 p-4 lg:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-normal text-gray-700 dark:text-slate-300">Total Plays</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {album.total_plays.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/60 dark:to-cyan-900/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/90 via-pink-50/80 to-rose-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-slate-600/60 p-4 lg:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-normal text-gray-700 dark:text-slate-300">Top Stations</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                  {album.top_stations.length}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/60 dark:to-pink-900/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <MapPin className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-4 lg:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-normal text-gray-700 dark:text-slate-300">Contributors</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                  {album.contributors.length}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="w-4 h-4 lg:w-6 lg:h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Detail Sections */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/20 dark:bg-slate-800/40 text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-slate-700/60 hover:border-purple-400/60 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                  aria-pressed={isActive}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* Track List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Album Tracks</h3>
                  <div className="space-y-3">
                    {album.tracks.map((track, index) => (
                      <div key={track.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{track.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{track.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{track.plays.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">plays</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">₵{track.revenue.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">revenue</div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30">
                            <Play className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'revenue' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Revenue Chart Placeholder */}
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-6 border border-gray-200 dark:border-slate-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <BarChart3 className="w-16 h-16 mb-4" />
                    <p className="text-center">Revenue chart would be displayed here</p>
                  </div>
                </div>

                {/* Territory Breakdown */}
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-6 border border-gray-200 dark:border-slate-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue by Territory</h3>
                  <div className="space-y-3">
                    {album.territory_revenue.map((territory) => (
                      <div key={territory.territory} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{territory.territory}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${territory.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                            {territory.percentage}%
                          </span>
                          <span className="text-sm text-green-600 dark:text-green-400 font-bold w-20 text-right">
                            ₵{territory.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Plays Over Time Chart Placeholder */}
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-6 border border-gray-200 dark:border-slate-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plays Over Time</h3>
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-16 h-16 mb-4" />
                    <p className="text-center">Performance chart would be displayed here</p>
                  </div>
                </div>

                {/* Top Stations */}
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-6 border border-gray-200 dark:border-slate-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Stations</h3>
                  <div className="space-y-3">
                    {album.top_stations.map((station, index) => (
                      <div key={station.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{station.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{station.region}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{station.count}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">plays</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contributors' && (
              <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-6 border border-gray-200 dark:border-slate-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Album Contributors</h3>
                <div className="space-y-4">
                  {album.contributors.map((contributor) => (
                    <div key={`${contributor.name}-${contributor.role}`} className="flex items-center justify-between p-4 bg-white/30 dark:bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{contributor.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{contributor.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{contributor.percentage}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">split</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Split</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {album.contributors.reduce((sum, contributor) => sum + contributor.percentage, 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AlbumDetails;
