import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
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
  Edit
} from 'lucide-react';
import ContributorsSection from '../components/trackDetails/ContributorsSection';
import PlaysOverTimeSection from '../components/trackDetails/PlaysOverTimeSection';
import TopStationsSection from '../components/trackDetails/TopStationsSection';
import PlayLogsSection from '../components/trackDetails/PlayLogsSection';
import RevenueDashboardSection from '../components/trackDetails/RevenueDashboardSection';
import GeographicPerformanceSection from '../components/trackDetails/GeographicPerformanceSection';

// Mock track data - enhanced with more realistic structure matching reference
const mockTrackData = {
  id: '1',
  title: 'Ghana Na Woti',
  artist_name: 'King Promise',
  album: '5 Star',
  genre_name: 'Afrobeats',
  duration: '3:45',
  release_date: '2023-06-15',
  plays: 1247,
  cover_art: '/covers/ghana-na-woti.jpg',
  audio_file_mp3: '/audio/ghana-na-woti.mp3',
  // Revenue data
  totalEarnings: 2347.50,
  monthlyEarnings: [
    { month: 'Jun 2024', amount: 450.00, currency: 'GHS' },
    { month: 'Jul 2024', amount: 523.00, currency: 'GHS' },
    { month: 'Aug 2024', amount: 612.00, currency: 'GHS' },
    { month: 'Sep 2024', amount: 387.00, currency: 'GHS' },
    { month: 'Oct 2024', amount: 375.50, currency: 'GHS' }
  ],
  territoryEarnings: [
    { territory: 'Ghana', amount: 1876.00, currency: 'GHS', percentage: 80 },
    { territory: 'Nigeria', amount: 234.50, currency: 'GHS', percentage: 10 },
    { territory: 'UK', amount: 140.70, currency: 'GHS', percentage: 6 },
    { territory: 'USA', amount: 93.80, currency: 'GHS', percentage: 4 }
  ],
  payoutHistory: [
    { date: '2024-09-15', amount: 450.00, status: 'Paid', period: 'Jun 2024' },
    { date: '2024-10-15', amount: 523.00, status: 'Paid', period: 'Jul 2024' },
    { date: '2024-11-15', amount: 612.00, status: 'Pending', period: 'Aug 2024' }
  ],
  contributors: [
    { role: 'Producer', name: 'KillBeatz', percentage: 25 },
    { role: 'Featured Artist', name: 'Shatta Wale', percentage: 15 },
    { role: 'Mixing Engineer', name: 'MikeMillzOnEm', percentage: 10 }
  ],
  topStations: [
    { name: "Joy FM", count: 156, region: 'Greater Accra' },
    { name: "Peace FM", count: 134, region: 'Greater Accra' },
    { name: "Adom FM", count: 98, region: 'Ashanti' },
    { name: "Hitz FM", count: 87, region: 'Greater Accra' },
    { name: "Okay FM", count: 76, region: 'Greater Accra' }
  ],
  playLogs: [
    { time: '2024-10-16T10:30:00Z', station: 'Peace FM', region: 'Greater Accra' },
    { time: '2024-10-16T14:22:00Z', station: 'Joy FM', region: 'Greater Accra' },
    { time: '2024-10-16T16:45:00Z', station: 'Adom FM', region: 'Ashanti' },
    { time: '2024-10-16T19:15:00Z', station: 'Hitz FM', region: 'Greater Accra' },
    { time: '2024-10-16T21:30:00Z', station: 'Okay FM', region: 'Greater Accra' }
  ],
  playsOverTime: [
    { month: 'Jun', plays: 245 },
    { month: 'Jul', plays: 389 },
    { month: 'Aug', plays: 567 },
    { month: 'Sep', plays: 723 },
    { month: 'Oct', plays: 1247 }
  ],
  radioStations: [
    { name: "Joy FM", latitude: 5.5600, longitude: -0.2100 },
    { name: "Peace FM", latitude: 5.5900, longitude: -0.2400 },
    { name: "Adom FM", latitude: 6.6885, longitude: -1.6244 },
    { name: "Hitz FM", latitude: 5.5800, longitude: -0.2200 },
    { name: "Okay FM", latitude: 5.5700, longitude: -0.2300 }
  ]
};

const TrackDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackId } = location.state || {};

  // Audio Player
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newContributor, setNewContributor] = useState({ name: '', role: '', percentage: 0 });
  const [activeTab, setActiveTab] = useState<'performance' | 'revenue' | 'contributors' | 'geography'>('performance');

  // Get track data - for demo, we'll use the first track or find by ID
  const track = trackId ? mockTrackData : mockTrackData;

  // Initialize edit track data after track is available
  const [editTrackData, setEditTrackData] = useState({
    title: track.title,
    artist_name: track.artist_name,
    genre_name: track.genre_name,
    album: track.album,
    description: ''
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', updateTime);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAddContributor = () => {
    if (newContributor.name.trim() && newContributor.role.trim()) {
      // Calculate current total percentage from existing contributors
      const currentTotal = track.contributors.reduce((sum, contributor) => sum + (contributor.percentage || 0), 0);
      const newTotal = currentTotal + newContributor.percentage;

      // Validate that new total doesn't exceed 100%
      if (newTotal > 100) {
        alert(`Total percentage would exceed 100%. Current total: ${currentTotal}%, adding ${newContributor.percentage}% would make ${newTotal}%`);
        return;
      }

      // In a real app, this would make an API call
      // For demo, we'll just show an alert
      alert(`Added contributor: ${newContributor.name} as ${newContributor.role} with ${newContributor.percentage}% split`);
      setNewContributor({ name: '', role: '', percentage: 0 });
      setIsModalOpen(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewContributor({ name: '', role: '', percentage: 0 });
  };

  // Calculate current total percentage
  const currentTotalPercentage = track.contributors.reduce((sum, contributor) => sum + (contributor.percentage || 0), 0);
  const remainingPercentage = 100 - currentTotalPercentage;
  const regionPerformance = [
    { region: 'Greater Accra', plays: 423, percentage: 68, color: 'green' as const, stations: 12 },
    { region: 'Ashanti', plays: 156, percentage: 25, color: 'blue' as const, stations: 8 },
    { region: 'Northern', plays: 34, percentage: 5, color: 'purple' as const, stations: 3 },
    { region: 'Western', plays: 67, percentage: 11, color: 'amber' as const, stations: 4 }
  ];
  const tabs = [
    { id: 'performance', label: 'Performance' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'contributors', label: 'Contributors' },
    { id: 'geography', label: 'Geography' }
  ] as const;

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = vol;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <>
      {/* Enhanced Back Navigation with Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
          <button
            onClick={() => navigate('/dashboard/all-artist-songs')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1"
            aria-label="Go back to upload management"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Upload Management</span>
            <span className="sm:hidden">Back</span>
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">Track Details</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-purple-600 dark:text-purple-400 font-medium truncate max-w-32">
            {track.title}
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
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500" title="Share track">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              title="Edit track information"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Search/Filter Controls */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sections..."
                className="pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 w-48"
                aria-label="Search track details sections"
              />
            </div>
            <select className="px-3 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200">
              <option>All Sections</option>
              <option>Revenue</option>
              <option>Analytics</option>
              <option>Geographic</option>
              <option>Contributors</option>
            </select>
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
                  {track.genre_name}
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Comprehensive analytics and performance data for <span className="font-medium text-gray-900 dark:text-white">{track.title}</span>
              </p>
            </div>

            {/* Quick Stats in Header */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {track.plays.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Plays</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  ₵{track.totalEarnings.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Earnings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8" role="main">
        {/* Track Info Card - Enhanced Glassmorphism */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/30 shadow-2xl hover:shadow-3xl transition-all duration-300 group" role="region" aria-labelledby="track-info-title">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Enhanced Album Art with Glow */}
            <div className="relative flex-shrink-0">
              <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-300">
                <img
                  src={track.cover_art}
                  alt={`${track.title} cover art`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              {/* Floating Play Button */}
              <button
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group-hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                aria-label={`Play ${track.title}`}
              >
                <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
              </button>
            </div>

            {/* Enhanced Track Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h1 id="track-info-title" className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  {track.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  by {track.artist_name}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Music className="w-4 h-4" />
                    <span>{track.genre_name}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{track.duration}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(track.release_date).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                  aria-label={`Play ${track.title}`}
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  <span className="font-medium">Play Track</span>
                </button>
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-slate-600 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all duration-200 group-hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 relative"
                  aria-label="Add to favorites"
                >
                  <Heart className="w-5 h-5" />
                  <span>Add to Favorites</span>
                  {/* Contextual Help Tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Save for quick access
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </button>
                <button
                  className="flex items-center space-x-2 px-6 py-3 bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-slate-600 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all duration-200 group-hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 relative group"
                  aria-label="Share track"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                  {/* Contextual Help Tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Share performance data
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </button>
              </div>

              {/* Keyboard Navigation Instructions */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                <span>Press</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono">Space</kbd>
                <span>to play/pause,</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono">F</kbd>
                <span>to favorite</span>
              </div>
            </div>

            {/* Enhanced Stats Card */}
            <div className="bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-indigo-50/80 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-indigo-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-lg">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {track.plays.toLocaleString()}
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
                <p className="text-xs lg:text-sm font-normal text-gray-700 dark:text-slate-300">Total Plays</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                  {track.plays.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/60 dark:to-green-900/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50/90 via-cyan-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/60 p-4 lg:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-normal text-gray-700 dark:text-slate-300">Top Stations</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {track.topStations.length}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/60 dark:to-cyan-900/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <MapPin className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/90 via-pink-50/80 to-rose-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-slate-600/60 p-4 lg:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-normal text-gray-700 dark:text-slate-300">Contributors</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                  {track.contributors.length}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/60 dark:to-pink-900/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-4 lg:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <p className="text-xs lg:text-sm font-normal text-gray-700 dark:text-slate-300">Duration</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                  {track.duration}
                </p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Clock className="w-4 h-4 lg:w-6 lg:h-6 text-amber-600 dark:text-amber-400" />
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
            {activeTab === 'performance' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PlaysOverTimeSection playsOverTime={track.playsOverTime} />
                  <TopStationsSection stations={track.topStations} />
                </div>
                <PlayLogsSection playLogs={track.playLogs} />
              </>
            )}

            {activeTab === 'revenue' && (
              <RevenueDashboardSection
                totalEarnings={track.totalEarnings}
                monthlyEarnings={track.monthlyEarnings}
                territoryEarnings={track.territoryEarnings}
                payoutHistory={track.payoutHistory}
              />
            )}

            {activeTab === 'contributors' && (
              <ContributorsSection
                contributors={track.contributors}
                currentTotalPercentage={currentTotalPercentage}
                remainingPercentage={remainingPercentage}
                onAddClick={() => setIsModalOpen(true)}
              />
            )}

            {activeTab === 'geography' && (
              <GeographicPerformanceSection regions={regionPerformance} />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* Add Contributor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Contributor</h2>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contributor Name
                </label>
                <input
                  type="text"
                  value={newContributor.name}
                  onChange={(e) => setNewContributor({ ...newContributor, name: e.target.value })}
                  placeholder="Enter contributor name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={newContributor.role}
                  onChange={(e) => setNewContributor({ ...newContributor, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a role</option>
                  <option value="Producer">Producer</option>
                  <option value="Featured Artist">Featured Artist</option>
                  <option value="Mixing Engineer">Mixing Engineer</option>
                  <option value="Mastering Engineer">Mastering Engineer</option>
                  <option value="Songwriter">Songwriter</option>
                  <option value="Vocalist">Vocalist</option>
                  <option value="Instrumentalist">Instrumentalist</option>
                  <option value="Arranger">Arranger</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Percentage Split (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newContributor.percentage}
                  onChange={(e) => setNewContributor({ ...newContributor, percentage: parseInt(e.target.value) || 0 })}
                  placeholder="Enter percentage (0-100)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Current total: {currentTotalPercentage}% | Remaining: {remainingPercentage}%
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleModalClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContributor}
                  disabled={!newContributor.name.trim() || !newContributor.role.trim() || newContributor.percentage <= 0 || (currentTotalPercentage + newContributor.percentage) > 100}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Add Contributor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Track Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Track Information</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Track Title
                </label>
                <input
                  type="text"
                  value={editTrackData.title}
                  onChange={(e) => setEditTrackData({ ...editTrackData, title: e.target.value })}
                  placeholder="Enter track title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={editTrackData.artist_name}
                  onChange={(e) => setEditTrackData({ ...editTrackData, artist_name: e.target.value })}
                  placeholder="Enter artist name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genre
                </label>
                <select
                  value={editTrackData.genre_name}
                  onChange={(e) => setEditTrackData({ ...editTrackData, genre_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Genre</option>
                  <option value="Afrobeats">Afrobeats</option>
                  <option value="Afro Pop">Afro Pop</option>
                  <option value="Highlife">Highlife</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Gospel">Gospel</option>
                  <option value="Reggae">Reggae</option>
                  <option value="Dancehall">Dancehall</option>
                  <option value="R&B">R&B</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Jazz">Jazz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Album
                </label>
                <input
                  type="text"
                  value={editTrackData.album}
                  onChange={(e) => setEditTrackData({ ...editTrackData, album: e.target.value })}
                  placeholder="Enter album name (optional)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editTrackData.description}
                  onChange={(e) => setEditTrackData({ ...editTrackData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the track (optional)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would make an API call to update the track
                    alert(`Track "${editTrackData.title}" has been updated successfully!`);
                    setIsEditModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrackDetails;
