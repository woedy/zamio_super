import React, { useState } from 'react';
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
} from 'lucide-react';

// Mock catalog data for demonstration
const mockTracks = [
  {
    id: 1,
    title: 'Midnight Dreams',
    artist: 'Sarah Johnson',
    artistId: 1,
    album: 'Night Visions',
    duration: '3:45',
    releaseDate: '2024-01-10',
    status: 'published',
    genre: 'R&B',
    streams: 125000,
    downloads: 8500,
    revenue: 2500,
    platforms: ['Spotify', 'Apple Music', 'YouTube', 'Deezer'],
    isrc: 'QZ1234567890',
    composer: 'Sarah Johnson',
    producer: 'MK Beats',
    label: 'Zamio Publishing',
    coverArt: '/api/placeholder/150/150',
    audioUrl: '/api/placeholder/audio.mp3',
    bpm: 85,
    key: 'A minor',
    mood: 'Melancholic',
    language: 'English',
    explicit: false,
    featured: false,
    collaborators: [],
    tags: ['soulful', 'emotional', 'nighttime'],
    lastUpdated: '2024-01-10T10:30:00Z',
    performance: {
      dailyStreams: [1200, 1350, 1180, 1420, 1580, 1650, 1800],
      topCountries: ['Ghana', 'Nigeria', 'USA', 'UK'],
      peakPosition: 12,
      chartPerformance: 'Rising'
    }
  },
  {
    id: 2,
    title: 'Afro Vibes Vol. 2',
    artist: 'Michael Kwame',
    artistId: 2,
    album: 'Beat Collection',
    duration: '4:12',
    releaseDate: '2024-01-09',
    status: 'published',
    genre: 'Hip-Hop',
    streams: 89000,
    downloads: 6200,
    revenue: 1800,
    platforms: ['Spotify', 'SoundCloud', 'Bandcamp'],
    isrc: 'QZ0987654321',
    composer: 'Michael Kwame',
    producer: 'Michael Kwame',
    label: 'Zamio Publishing',
    coverArt: '/api/placeholder/150/150',
    audioUrl: '/api/placeholder/audio.mp3',
    bpm: 92,
    key: 'F# minor',
    mood: 'Energetic',
    language: 'Instrumental',
    explicit: false,
    featured: false,
    collaborators: [],
    tags: ['afrobeat', 'instrumental', 'beats'],
    lastUpdated: '2024-01-09T15:20:00Z',
    performance: {
      dailyStreams: [890, 920, 850, 980, 1050, 1120, 1250],
      topCountries: ['Ghana', 'Nigeria', 'South Africa'],
      peakPosition: 8,
      chartPerformance: 'Stable'
    }
  },
  {
    id: 3,
    title: 'Soul Connection',
    artist: 'Amara Okafor',
    artistId: 3,
    album: 'Soul Journey',
    duration: '5:23',
    releaseDate: '2023-12-15',
    status: 'draft',
    genre: 'Soul',
    streams: 67000,
    downloads: 4300,
    revenue: 1350,
    platforms: ['Spotify', 'Apple Music'],
    isrc: 'QZ1122334455',
    composer: 'Amara Okafor',
    producer: 'Soul Studio',
    label: 'Zamio Publishing',
    coverArt: '/api/placeholder/150/150',
    audioUrl: '/api/placeholder/audio.mp3',
    bpm: 78,
    key: 'G major',
    mood: 'Spiritual',
    language: 'English',
    explicit: false,
    featured: true,
    collaborators: ['Gospel Choir'],
    tags: ['gospel', 'spiritual', 'uplifting'],
    lastUpdated: '2024-01-07T09:15:00Z',
    performance: {
      dailyStreams: [450, 520, 480, 590, 650, 720, 800],
      topCountries: ['Nigeria', 'Ghana', 'Kenya'],
      peakPosition: 15,
      chartPerformance: 'Declining'
    }
  },
  {
    id: 4,
    title: 'City Lights',
    artist: 'Sarah Johnson',
    artistId: 1,
    album: 'Night Visions',
    duration: '3:28',
    releaseDate: '2023-11-20',
    status: 'published',
    genre: 'R&B',
    streams: 234000,
    downloads: 15600,
    revenue: 4680,
    platforms: ['Spotify', 'Apple Music', 'YouTube', 'Amazon Music', 'Tidal'],
    isrc: 'QZ5566778899',
    composer: 'Sarah Johnson',
    producer: 'MK Beats',
    label: 'Zamio Publishing',
    coverArt: '/api/placeholder/150/150',
    audioUrl: '/api/placeholder/audio.mp3',
    bpm: 88,
    key: 'C# minor',
    mood: 'Nostalgic',
    language: 'English',
    explicit: false,
    featured: false,
    collaborators: [],
    tags: ['city', 'nostalgic', 'smooth'],
    lastUpdated: '2023-11-20T14:45:00Z',
    performance: {
      dailyStreams: [2100, 2350, 2200, 2680, 2890, 3100, 3400],
      topCountries: ['Ghana', 'Nigeria', 'USA', 'Canada', 'UK'],
      peakPosition: 3,
      chartPerformance: 'Rising'
    }
  }
];

const CatalogManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [artistFilter, setArtistFilter] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTrackDetails, setShowTrackDetails] = useState(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Add Track Form State
  const [newTrack, setNewTrack] = useState({
    title: '',
    artist: '',
    album: '',
    duration: '',
    genre: '',
    releaseDate: '',
    isrc: '',
    composer: '',
    producer: '',
    bpm: '',
    key: '',
    mood: '',
    language: 'English',
    explicit: false,
    featured: false,
    tags: [] as string[],
    coverArt: '',
    audioFile: null as File | null,
    collaborators: [] as string[]
  });

  const [trackErrors, setTrackErrors] = useState<{[key: string]: string}>({});
  const [isTrackSubmitting, setIsTrackSubmitting] = useState(false);

  // Bulk Upload State Management
  const [bulkUploadStep, setBulkUploadStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadMetadata, setUploadMetadata] = useState<{[key: string]: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    duration?: string;
    isrc?: string;
    composer?: string;
    producer?: string;
    bpm?: string;
    key?: string;
    mood?: string;
    language?: string;
    explicit?: boolean;
    featured?: boolean;
    tags?: string[];
  }}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadStatus, setUploadStatus] = useState<{[key: string]: 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled'}>({});
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const resetBulkUpload = () => {
    setBulkUploadStep(1);
    setSelectedFiles([]);
    setUploadMetadata({});
    setUploadProgress({});
    setUploadStatus({});
    setIsBulkUploading(false);
    setShowBulkUploadModal(false);
  };

  const handleBulkFileSelect = (files: FileList | null) => {
    if (!files) return;

    const audioFiles = Array.from(files).filter(file =>
      file.type.startsWith('audio/') && file.size <= 50 * 1024 * 1024 // 50MB limit
    );

    if (audioFiles.length !== files.length) {
      alert('Some files were skipped. Only audio files under 50MB are supported.');
    }

    setSelectedFiles(audioFiles);

    // Initialize metadata for each file
    const initialMetadata: {[key: string]: any} = {};
    audioFiles.forEach(file => {
      initialMetadata[file.name] = {
        title: '',
        artist: '',
        album: '',
        genre: '',
        duration: '',
        isrc: '',
        composer: '',
        producer: '',
        bpm: '',
        key: '',
        mood: '',
        language: 'English',
        explicit: false,
        featured: false,
        tags: []
      };
    });
    setUploadMetadata(initialMetadata);
  };

  const handleMetadataChange = (fileName: string, field: string, value: any) => {
    setUploadMetadata(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        [field]: value
      }
    }));
  };

  const simulateBulkUpload = async () => {
    setIsBulkUploading(true);
    setBulkUploadStep(3);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileId = file.name + '_' + Date.now();

      setUploadStatus(prev => ({ ...prev, [fileId]: 'uploading' }));
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }

      setUploadStatus(prev => ({ ...prev, [fileId]: 'processing' }));

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Random success/failure for demo
      const success = Math.random() > 0.1; // 90% success rate
      setUploadStatus(prev => ({
        ...prev,
        [fileId]: success ? 'completed' : 'failed'
      }));
    }

    setIsBulkUploading(false);
  };

  const filteredTracks = mockTracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.album.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || track.status === statusFilter;
    const matchesGenre = genreFilter === 'all' || track.genre === genreFilter;
    const matchesArtist = artistFilter === 'all' || track.artistId.toString() === artistFilter;

    return matchesSearch && matchesStatus && matchesGenre && matchesArtist;
  });

  const allGenres = Array.from(new Set(mockTracks.map(track => track.genre)));
  const allArtists = Array.from(new Set(mockTracks.map(track => ({ id: track.artistId, name: track.artist }))));

  // Form handling functions
  const handleTrackInputChange = (field: string, value: string | number | boolean) => {
    setNewTrack(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (trackErrors[field]) {
      setTrackErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setNewTrack(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const validateTrackForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!newTrack.title.trim()) newErrors.title = 'Track title is required';
    if (!newTrack.artist.trim()) newErrors.artist = 'Artist name is required';
    if (!newTrack.album.trim()) newErrors.album = 'Album name is required';
    if (!newTrack.duration.trim()) newErrors.duration = 'Duration is required';
    if (!newTrack.genre.trim()) newErrors.genre = 'Genre is required';
    if (!newTrack.releaseDate) newErrors.releaseDate = 'Release date is required';
    if (!newTrack.audioFile) newErrors.audioFile = 'Audio file is required';

    setTrackErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTrackForm()) return;

    setIsTrackSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new track object
      const track = {
        id: mockTracks.length + 1,
        ...newTrack,
        status: 'draft' as const,
        streams: 0,
        downloads: 0,
        revenue: 0,
        platforms: ['Spotify', 'Apple Music'],
        coverArt: newTrack.coverArt || '/api/placeholder/150/150',
        audioUrl: '/api/placeholder/audio.mp3',
        lastUpdated: new Date().toISOString(),
        performance: {
          dailyStreams: [],
          topCountries: ['Ghana'],
          peakPosition: 0,
          chartPerformance: 'New'
        }
      };

      // Reset form
      setNewTrack({
        title: '',
        artist: '',
        album: '',
        duration: '',
        genre: '',
        releaseDate: '',
        isrc: '',
        composer: '',
        producer: '',
        bpm: '',
        key: '',
        mood: '',
        language: 'English',
        explicit: false,
        featured: false,
        tags: [],
        coverArt: '',
        audioFile: null,
        collaborators: []
      });

      setTrackErrors({});
      setShowAddTrackModal(false);

      // Show success message
      alert('Track added successfully!');

    } catch (error) {
      setTrackErrors({ submit: 'Failed to add track. Please try again.' });
    } finally {
      setIsTrackSubmitting(false);
    }
  };

  const resetTrackForm = () => {
    setNewTrack({
      title: '',
      artist: '',
      album: '',
      duration: '',
      genre: '',
      releaseDate: '',
      isrc: '',
      composer: '',
      producer: '',
      bpm: '',
      key: '',
      mood: '',
      language: 'English',
      explicit: false,
      featured: false,
      tags: [],
      coverArt: '',
      audioFile: null,
      collaborators: []
    });
    setTrackErrors({});
    setShowAddTrackModal(false);
  };

  const handleViewTrack = (track: any) => {
    setSelectedTrack(track);
    setShowTrackDetails(true);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'scheduled': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catalog Management</h1>
                  <p className="text-gray-600 dark:text-gray-300 font-light">
                    Organize and manage your music catalog, track releases, and monitor performance across all platforms
                  </p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {mockTracks.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Tracks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {mockTracks.filter(t => t.status === 'published').length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Published</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatNumber(mockTracks.reduce((acc, track) => acc + track.streams, 0))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(mockTracks.reduce((acc, track) => acc + track.revenue, 0))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddTrackModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Add Track</span>
              </button>
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/60 dark:border-slate-600/60 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Upload</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/60 dark:border-slate-600/60 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tracks, artists, or albums..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4 text-gray-400" />
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Genres</option>
                {allGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <select
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Artists</option>
                {allArtists.map(artist => (
                  <option key={artist.id} value={artist.id.toString()}>{artist.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex flex-col space-y-1 w-4">
                <div className="bg-current h-1 rounded-sm"></div>
                <div className="bg-current h-1 rounded-sm"></div>
                <div className="bg-current h-1 rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tracks Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((track) => (
            <div key={track.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 overflow-hidden">
              <div className="relative">
                <img
                  src={track.coverArt}
                  alt={track.title}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-sm truncate">{track.title}</h3>
                  <p className="text-white/80 text-xs truncate">{track.artist}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(track.status)}`}>
                    {track.status}
                  </div>
                </div>
                <button className="absolute top-3 left-3 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors duration-200">
                  <Play className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <img
                      src={`/api/placeholder/32/32`}
                      alt={track.artist}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{track.artist}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{track.album}</p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {formatNumber(track.streams)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Streams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(track.revenue)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs">
                    {track.genre}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {track.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(track.releaseDate).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleViewTrack(track)}
                    className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-xs"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Track</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Artist</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streams</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Release Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredTracks.map((track) => (
                  <tr key={track.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={track.coverArt} alt={track.title} className="w-10 h-10 rounded-lg object-cover mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{track.album}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {track.artist}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(track.status)}`}>
                        {track.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatNumber(track.streams)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(track.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(track.releaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewTrack(track)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Track Details Modal */}
      {showTrackDetails && selectedTrack && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl">
            <div className="relative">
              <img
                src={selectedTrack.coverArt}
                alt={selectedTrack.title}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center space-x-4">
                  <button className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors duration-200">
                    <Play className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedTrack.title}</h2>
                    <p className="text-white/80">by {selectedTrack.artist}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTrackDetails(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Track Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Track Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Disc className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Album</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTrack.album}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Duration</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTrack.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Release Date</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(selectedTrack.releaseDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Music className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Genre</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTrack.genre}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Technical Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">BPM</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTrack.bpm}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Key className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Key</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTrack.key}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Mood</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTrack.mood}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Language</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTrack.language}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Credits</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Composer:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTrack.composer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Producer:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTrack.producer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Label:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTrack.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">ISRC:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTrack.isrc}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrack.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance & Actions */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Performance Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Streams</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(selectedTrack.streams)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Downloads</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(selectedTrack.downloads)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(selectedTrack.revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Peak Position</span>
                        <span className="font-semibold text-gray-900 dark:text-white">#{selectedTrack.performance.peakPosition}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Platforms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrack.platforms.map((platform: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Top Countries</h3>
                    <div className="space-y-2">
                      {selectedTrack.performance.topCountries.slice(0, 4).map((country: string, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{country}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${Math.random() * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                              {Math.floor(Math.random() * 30) + 10}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <Edit className="w-4 h-4" />
                      <span>Edit Track</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                      <BarChart3 className="w-4 h-4" />
                      <span>Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tracks found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filter criteria.</p>
          <button
            onClick={() => setShowAddTrackModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Track</span>
          </button>
        </div>
      )}

      {/* Add Track Modal */}
      {showAddTrackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Track</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enter track details and upload audio file</p>
                  </div>
                </div>
                <button
                  onClick={resetTrackForm}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleTrackSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Music className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Basic Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Track Title *
                        </label>
                        <input
                          type="text"
                          value={newTrack.title}
                          onChange={(e) => handleTrackInputChange('title', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            trackErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                          }`}
                          placeholder="Enter track title"
                        />
                        {trackErrors.title && <p className="text-red-500 text-sm mt-1">{trackErrors.title}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Artist *
                        </label>
                        <input
                          type="text"
                          value={newTrack.artist}
                          onChange={(e) => handleTrackInputChange('artist', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            trackErrors.artist ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                          }`}
                          placeholder="Enter artist name"
                        />
                        {trackErrors.artist && <p className="text-red-500 text-sm mt-1">{trackErrors.artist}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Album *
                        </label>
                        <input
                          type="text"
                          value={newTrack.album}
                          onChange={(e) => handleTrackInputChange('album', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            trackErrors.album ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                          }`}
                          placeholder="Enter album name"
                        />
                        {trackErrors.album && <p className="text-red-500 text-sm mt-1">{trackErrors.album}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Duration *
                          </label>
                          <input
                            type="text"
                            value={newTrack.duration}
                            onChange={(e) => handleTrackInputChange('duration', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              trackErrors.duration ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                            }`}
                            placeholder="3:45"
                          />
                          {trackErrors.duration && <p className="text-red-500 text-sm mt-1">{trackErrors.duration}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Genre *
                          </label>
                          <select
                            value={newTrack.genre}
                            onChange={(e) => handleTrackInputChange('genre', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              trackErrors.genre ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                            }`}
                          >
                            <option value="">Select genre</option>
                            {allGenres.map(genre => (
                              <option key={genre} value={genre}>{genre}</option>
                            ))}
                          </select>
                          {trackErrors.genre && <p className="text-red-500 text-sm mt-1">{trackErrors.genre}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Release Date *
                        </label>
                        <input
                          type="date"
                          value={newTrack.releaseDate}
                          onChange={(e) => handleTrackInputChange('releaseDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            trackErrors.releaseDate ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                          }`}
                        />
                        {trackErrors.releaseDate && <p className="text-red-500 text-sm mt-1">{trackErrors.releaseDate}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Technical Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          BPM
                        </label>
                        <input
                          type="number"
                          value={newTrack.bpm}
                          onChange={(e) => handleTrackInputChange('bpm', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="120"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Key
                        </label>
                        <select
                          value={newTrack.key}
                          onChange={(e) => handleTrackInputChange('key', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select key</option>
                          <option value="C major">C major</option>
                          <option value="C# major">C# major</option>
                          <option value="D major">D major</option>
                          <option value="D# major">D# major</option>
                          <option value="E major">E major</option>
                          <option value="F major">F major</option>
                          <option value="F# major">F# major</option>
                          <option value="G major">G major</option>
                          <option value="G# major">G# major</option>
                          <option value="A major">A major</option>
                          <option value="A# major">A# major</option>
                          <option value="B major">B major</option>
                          <option value="C minor">C minor</option>
                          <option value="C# minor">C# minor</option>
                          <option value="D minor">D minor</option>
                          <option value="D# minor">D# minor</option>
                          <option value="E minor">E minor</option>
                          <option value="F minor">F minor</option>
                          <option value="F# minor">F# minor</option>
                          <option value="G minor">G minor</option>
                          <option value="G# minor">G# minor</option>
                          <option value="A minor">A minor</option>
                          <option value="A# minor">A# minor</option>
                          <option value="B minor">B minor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mood
                        </label>
                        <input
                          type="text"
                          value={newTrack.mood}
                          onChange={(e) => handleTrackInputChange('mood', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Energetic, Melancholic, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Language
                        </label>
                        <select
                          value={newTrack.language}
                          onChange={(e) => handleTrackInputChange('language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Italian">Italian</option>
                          <option value="Portuguese">Portuguese</option>
                          <option value="Instrumental">Instrumental</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 mt-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newTrack.explicit}
                          onChange={(e) => handleTrackInputChange('explicit', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Explicit Content</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newTrack.featured}
                          onChange={(e) => handleTrackInputChange('featured', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Featured Track</span>
                      </label>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 'country', 'folk', 'reggae', 'blues', 'soul', 'r&b'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            newTrack.tags.includes(tag)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Publishing Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Publishing Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ISRC Code
                        </label>
                        <input
                          type="text"
                          value={newTrack.isrc}
                          onChange={(e) => handleTrackInputChange('isrc', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="QZ1234567890"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Composer
                        </label>
                        <input
                          type="text"
                          value={newTrack.composer}
                          onChange={(e) => handleTrackInputChange('composer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter composer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Producer
                        </label>
                        <input
                          type="text"
                          value={newTrack.producer}
                          onChange={(e) => handleTrackInputChange('producer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter producer name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Upload className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Audio File *
                    </h3>

                    <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6">
                      <div className="text-center">
                        <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Drag and drop your audio file here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Supports: MP3, WAV, FLAC, AIFF (max 50MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleTrackInputChange('audioFile', e.target.files?.[0] || null)}
                          className="hidden"
                          id="audio-upload"
                        />
                        <label
                          htmlFor="audio-upload"
                          className={`inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer ${
                            trackErrors.audioFile ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          Choose File
                        </label>
                        {newTrack.audioFile && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            Selected: {newTrack.audioFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {trackErrors.audioFile && <p className="text-red-500 text-sm mt-2">{trackErrors.audioFile}</p>}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-slate-700 mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  * Required fields
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={resetTrackForm}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isTrackSubmitting}
                    className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isTrackSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isTrackSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding Track...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Track</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {trackErrors.submit && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{trackErrors.submit}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal - Multi-Step Wizard */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Upload Tracks</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Step {bulkUploadStep} of 4: {bulkUploadStep === 1 ? 'Select Files' : bulkUploadStep === 2 ? 'Add Metadata' : bulkUploadStep === 3 ? 'Upload Progress' : 'Complete'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetBulkUpload}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-4 space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                      step <= bulkUploadStep
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`w-8 h-1 mx-2 transition-colors duration-200 ${
                        step < bulkUploadStep
                          ? 'bg-indigo-600'
                          : 'bg-gray-200 dark:bg-slate-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Content - Step 1: File Selection */}
            {bulkUploadStep === 1 && (
              <div className="p-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8">
                  <div className="text-center">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Drop your audio files here
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Or click to browse and select multiple files
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Supports: MP3, WAV, FLAC, AIFF (max 50MB per file)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={(e) => handleBulkFileSelect(e.target.files)}
                      className="hidden"
                      id="bulk-upload-files"
                    />
                    <label
                      htmlFor="bulk-upload-files"
                      className="inline-flex items-center px-6 py-3 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-colors duration-200"
                    >
                      Choose Files
                    </label>
                  </div>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Selected Files ({selectedFiles.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileAudio className="w-5 h-5 text-indigo-600" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                            className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-6">
                  <button
                    onClick={() => setBulkUploadStep(2)}
                    disabled={selectedFiles.length === 0}
                    className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                      selectedFiles.length > 0
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next: Add Metadata
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - Step 2: Metadata Entry */}
            {bulkUploadStep === 2 && (
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <FileAudio className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Track Title
                          </label>
                          <input
                            type="text"
                            value={uploadMetadata[file.name]?.title || ''}
                            onChange={(e) => handleMetadataChange(file.name, 'title', e.target.value)}
                            placeholder="Enter track title"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Artist
                          </label>
                          <input
                            type="text"
                            value={uploadMetadata[file.name]?.artist || ''}
                            onChange={(e) => handleMetadataChange(file.name, 'artist', e.target.value)}
                            placeholder="Enter artist name"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Album
                          </label>
                          <input
                            type="text"
                            value={uploadMetadata[file.name]?.album || ''}
                            onChange={(e) => handleMetadataChange(file.name, 'album', e.target.value)}
                            placeholder="Enter album name"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Genre
                          </label>
                          <select
                            value={uploadMetadata[file.name]?.genre || ''}
                            onChange={(e) => handleMetadataChange(file.name, 'genre', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            Duration
                          </label>
                          <input
                            type="text"
                            value={uploadMetadata[file.name]?.duration || ''}
                            onChange={(e) => handleMetadataChange(file.name, 'duration', e.target.value)}
                            placeholder="3:45"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ISRC Code
                          </label>
                          <input
                            type="text"
                            value={uploadMetadata[file.name]?.isrc || ''}
                            onChange={(e) => handleMetadataChange(file.name, 'isrc', e.target.value)}
                            placeholder="QZ1234567890"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setBulkUploadStep(1)}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setBulkUploadStep(3)}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Start Upload
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - Step 3: Upload Progress */}
            {bulkUploadStep === 3 && (
              <div className="p-6">
                <div className="space-y-4">
                  {selectedFiles.map((file, index) => {
                    const fileId = file.name + '_' + Date.now();
                    const status = uploadStatus[fileId];
                    const progress = uploadProgress[fileId] || 0;

                    return (
                      <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <FileAudio className="w-5 h-5 text-indigo-600" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {status && (
                              <>
                                {status === 'uploading' && (
                                  <>
                                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {progress}%
                                    </span>
                                  </>
                                )}
                                {status === 'processing' && (
                                  <>
                                    <Clock className="w-4 h-4 text-yellow-600 animate-spin" />
                                    <span className="text-sm text-yellow-600">Processing</span>
                                  </>
                                )}
                                {status === 'completed' && (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-600">Complete</span>
                                  </>
                                )}
                                {status === 'failed' && (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-red-600">Failed</span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {status && (
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                status === 'completed' ? 'bg-green-500' :
                                status === 'processing' ? 'bg-blue-500' :
                                status === 'uploading' ? 'bg-indigo-500' :
                                status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isBulkUploading && (
                  <div className="flex justify-center items-center py-4">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Uploading files...</span>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setBulkUploadStep(2)}
                    disabled={isBulkUploading}
                    className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                      isBulkUploading
                        ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={simulateBulkUpload}
                    disabled={isBulkUploading}
                    className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                      isBulkUploading
                        ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isBulkUploading ? 'Uploading...' : 'Complete Upload'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - Step 4: Completion */}
            {bulkUploadStep === 4 && (
              <div className="p-6 text-center">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Upload Complete!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedFiles.length} files have been successfully uploaded and processed.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Object.values(uploadStatus).filter(status => status === 'completed').length}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {Object.values(uploadStatus).filter(status => status === 'failed').length}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Failed</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={resetBulkUpload}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => {
                      resetBulkUpload();
                      setBulkUploadStep(1);
                    }}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200"
                  >
                    Upload More Files
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CatalogManagement;
