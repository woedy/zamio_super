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
  User,
  Users,
  Music,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Activity,
  Star,
  Heart,
  Share2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Crown,
  Gem,
  Layers,
  Zap,
  Target,
  PiggyBank,
  Wallet,
  Bell,
  RefreshCw,
  Minus,
  X,
  Check,
  Info,
  Shield,
  FileCheck,
  HelpCircle,
  Radio,
  Headphones,
  Mic,
  Disc,
  Volume2,
  Play,
  Pause,
} from 'lucide-react';

// Mock artist data for demonstration
const mockArtists = [
  {
    id: 1,
    name: 'Sarah Johnson',
    stageName: 'Sarah J',
    email: 'sarah.j@example.com',
    phone: '+233 24 123 4567',
    location: 'Accra, Ghana',
    joinDate: '2023-01-15',
    status: 'active',
    profileImage: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/800/200',
    bio: 'Rising R&B artist from Accra with a passion for soulful melodies and meaningful lyrics.',
    genres: ['R&B', 'Soul', 'Afrobeat'],
    socialMedia: {
      spotify: 'spotify.com/artist/sarahj',
      instagram: '@sarahjmusic',
      twitter: '@sarahjmusic',
      youtube: 'youtube.com/sarahjmusic'
    },
    stats: {
      totalStreams: 1250000,
      monthlyStreams: 45000,
      totalTracks: 12,
      totalAlbums: 2,
      followers: 8500,
      earnings: 45000
    },
    contract: {
      type: 'Exclusive',
      startDate: '2023-01-15',
      endDate: '2025-01-15',
      royaltyRate: 75,
      advance: 25000,
      status: 'active'
    },
    recentActivity: [
      { type: 'release', title: 'New Single Release', date: '2024-01-10', details: 'Released "Midnight Dreams"' },
      { type: 'performance', title: 'Live Performance', date: '2024-01-08', details: 'Performed at Accra Jazz Festival' },
      { type: 'milestone', title: 'Streaming Milestone', date: '2024-01-05', details: 'Reached 1M total streams' }
    ]
  },
  {
    id: 2,
    name: 'Michael Kwame',
    stageName: 'MK Beats',
    email: 'mk@example.com',
    phone: '+233 24 987 6543',
    location: 'Kumasi, Ghana',
    joinDate: '2023-03-22',
    status: 'active',
    profileImage: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/800/200',
    bio: 'Hip-hop producer and beatmaker creating innovative sounds that blend traditional African rhythms with modern hip-hop.',
    genres: ['Hip-Hop', 'Afrobeat', 'Electronic'],
    socialMedia: {
      spotify: 'spotify.com/artist/mkbeats',
      instagram: '@mkbeats',
      twitter: '@mkbeats',
      youtube: 'youtube.com/mkbeats'
    },
    stats: {
      totalStreams: 890000,
      monthlyStreams: 32000,
      totalTracks: 8,
      totalAlbums: 1,
      followers: 6200,
      earnings: 32000
    },
    contract: {
      type: 'Non-Exclusive',
      startDate: '2023-03-22',
      endDate: '2024-03-22',
      royaltyRate: 60,
      advance: 15000,
      status: 'active'
    },
    recentActivity: [
      { type: 'collaboration', title: 'New Collaboration', date: '2024-01-12', details: 'Produced track for Sarah J' },
      { type: 'release', title: 'Beat Pack Release', date: '2024-01-09', details: 'Released "Afro Vibes Vol. 2"' }
    ]
  },
  {
    id: 3,
    name: 'Amara Okafor',
    stageName: 'Amara Soul',
    email: 'amara@example.com',
    phone: '+233 24 555 7890',
    location: 'Lagos, Nigeria',
    joinDate: '2023-06-10',
    status: 'inactive',
    profileImage: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/800/200',
    bio: 'Soulful singer-songwriter with a voice that captivates audiences worldwide.',
    genres: ['Soul', 'R&B', 'Gospel'],
    socialMedia: {
      spotify: 'spotify.com/artist/amarasoul',
      instagram: '@amarasoul',
      twitter: '@amarasoul',
      youtube: 'youtube.com/amarasoul'
    },
    stats: {
      totalStreams: 567000,
      monthlyStreams: 12000,
      totalTracks: 6,
      totalAlbums: 1,
      followers: 3800,
      earnings: 18000
    },
    contract: {
      type: 'Exclusive',
      startDate: '2023-06-10',
      endDate: '2025-06-10',
      royaltyRate: 80,
      advance: 20000,
      status: 'active'
    },
    recentActivity: [
      { type: 'milestone', title: 'Chart Performance', date: '2024-01-07', details: 'Song entered local charts' }
    ]
  }
];

const ArtistsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showArtistDetails, setShowArtistDetails] = useState(false);
  const [showAddArtistModal, setShowAddArtistModal] = useState(false);

  // Add Artist Form State
  const [newArtist, setNewArtist] = useState({
    name: '',
    stageName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    genres: [] as string[],
    socialMedia: {
      spotify: '',
      instagram: '',
      twitter: '',
      youtube: ''
    },
    contract: {
      type: 'Exclusive',
      startDate: '',
      endDate: '',
      royaltyRate: 75,
      advance: 0
    },
    profileImage: '',
    coverImage: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredArtists = mockArtists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || artist.status === statusFilter;
    const matchesGenre = genreFilter === 'all' || artist.genres.includes(genreFilter);

    return matchesSearch && matchesStatus && matchesGenre;
  });

  const allGenres = Array.from(new Set(mockArtists.flatMap(artist => artist.genres)));

  // Form handling functions
  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewArtist(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setNewArtist(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGenreToggle = (genre: string) => {
    setNewArtist(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!newArtist.name.trim()) newErrors.name = 'Artist name is required';
    if (!newArtist.stageName.trim()) newErrors.stageName = 'Stage name is required';
    if (!newArtist.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newArtist.email)) newErrors.email = 'Email is invalid';

    if (!newArtist.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!newArtist.location.trim()) newErrors.location = 'Location is required';
    if (!newArtist.bio.trim()) newErrors.bio = 'Bio is required';
    if (newArtist.genres.length === 0) newErrors.genres = 'At least one genre is required';

    if (!newArtist.contract.startDate) newErrors.startDate = 'Start date is required';
    if (!newArtist.contract.endDate) newErrors.endDate = 'End date is required';
    if (new Date(newArtist.contract.endDate) <= new Date(newArtist.contract.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create new artist object
      const artist = {
        id: mockArtists.length + 1,
        ...newArtist,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active' as const,
        profileImage: newArtist.profileImage || '/api/placeholder/150/150',
        coverImage: newArtist.coverImage || '/api/placeholder/800/200',
        stats: {
          totalStreams: 0,
          monthlyStreams: 0,
          totalTracks: 0,
          totalAlbums: 0,
          followers: 0,
          earnings: 0
        },
        recentActivity: []
      };

      // In a real app, this would be an API call
      // For now, we'll just show success and close modal
      setShowAddArtistModal(false);

      // Reset form
      setNewArtist({
        name: '',
        stageName: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        genres: [],
        socialMedia: {
          spotify: '',
          instagram: '',
          twitter: '',
          youtube: ''
        },
        contract: {
          type: 'Exclusive',
          startDate: '',
          endDate: '',
          royaltyRate: 75,
          advance: 0
        },
        profileImage: '',
        coverImage: ''
      });

      setErrors({});

      // Show success message (you could add a toast notification here)
      alert('Artist added successfully!');

    } catch (error) {
      setErrors({ submit: 'Failed to add artist. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewArtist({
      name: '',
      stageName: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      genres: [],
      socialMedia: {
        spotify: '',
        instagram: '',
        twitter: '',
        youtube: ''
      },
      contract: {
        type: 'Exclusive',
        startDate: '',
        endDate: '',
        royaltyRate: 75,
        advance: 0
      },
      profileImage: '',
      coverImage: ''
    });
    setErrors({});
    setShowAddArtistModal(false);
  };

  const handleViewArtist = (artist: any) => {
    setSelectedArtist(artist);
    setShowArtistDetails(true);
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

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Artists Management</h1>
                  <p className="text-gray-600 dark:text-gray-300 font-light">
                    Manage your roster of artists, track their performance, and oversee music releases and royalty distributions
                  </p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {mockArtists.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Artists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {mockArtists.filter(a => a.status === 'active').length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Active Artists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatNumber(mockArtists.reduce((acc, artist) => acc + artist.stats.totalStreams, 0))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(mockArtists.reduce((acc, artist) => acc + artist.stats.earnings, 0))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Earnings</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddArtistModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Add Artist</span>
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
                placeholder="Search artists by name, email, or stage name..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
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

      {/* Artists Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => (
            <div key={artist.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-105 overflow-hidden">
              <div className="relative">
                <img
                  src={artist.coverImage}
                  alt={artist.stageName}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-lg">{artist.stageName}</h3>
                  <p className="text-white/80 text-sm">{artist.name}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    artist.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                  }`}>
                    {artist.status}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={artist.profileImage}
                      alt={artist.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{artist.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{artist.location}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {formatNumber(artist.stats.totalStreams)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Streams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatNumber(artist.stats.followers)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {artist.genres.slice(0, 2).map((genre, index) => (
                      <span key={index} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs">
                        {genre}
                      </span>
                    ))}
                    {artist.genres.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">+{artist.genres.length - 2}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Joined {new Date(artist.joinDate).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleViewArtist(artist)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Artist</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streams</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contract</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredArtists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={artist.profileImage} alt={artist.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{artist.stageName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{artist.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        artist.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                      }`}>
                        {artist.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatNumber(artist.stats.totalStreams)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(artist.stats.earnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {artist.contract.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewArtist(artist)}
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

      {/* Artist Details Modal */}
      {showArtistDetails && selectedArtist && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl">
            <div className="relative">
              <img
                src={selectedArtist.coverImage}
                alt={selectedArtist.stageName}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedArtist.stageName}</h2>
                <p className="text-white/80">{selectedArtist.name}</p>
              </div>
              <button
                onClick={() => setShowArtistDetails(false)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Artist Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Artist Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Email</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedArtist.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedArtist.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Location</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedArtist.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Joined</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(selectedArtist.joinDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedArtist.bio}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtist.genres.map((genre: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      {selectedArtist.recentActivity.map((activity: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                          <div className={`p-2 rounded-lg ${
                            activity.type === 'release' ? 'bg-green-100 dark:bg-green-900/30' :
                            activity.type === 'performance' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            activity.type === 'collaboration' ? 'bg-purple-100 dark:bg-purple-900/30' :
                            'bg-orange-100 dark:bg-orange-900/30'
                          }`}>
                            {activity.type === 'release' ? <Music className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                             activity.type === 'performance' ? <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" /> :
                             activity.type === 'collaboration' ? <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" /> :
                             <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats & Contract */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Performance Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Streams</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(selectedArtist.stats.totalStreams)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Streams</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(selectedArtist.stats.monthlyStreams)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Tracks</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedArtist.stats.totalTracks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Followers</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(selectedArtist.stats.followers)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(selectedArtist.stats.earnings)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contract Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedArtist.contract.type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{new Date(selectedArtist.contract.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">End Date</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{new Date(selectedArtist.contract.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Royalty Rate</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedArtist.contract.royaltyRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Advance</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedArtist.contract.advance)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <Edit className="w-4 h-4" />
                      <span>Edit Artist</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                      <MessageCircle className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No artists found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filter criteria.</p>
          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl mx-auto">
            <Plus className="w-4 h-4" />
            <span>Add Your First Artist</span>
          </button>
        </div>
      )}

      {/* Add Artist Modal */}
      {showAddArtistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Artist</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enter artist details to add them to your roster</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Basic Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Artist Name *
                        </label>
                        <input
                          type="text"
                          value={newArtist.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                          }`}
                          placeholder="Enter artist's full name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Stage Name *
                        </label>
                        <input
                          type="text"
                          value={newArtist.stageName}
                          onChange={(e) => handleInputChange('stageName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.stageName ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                          }`}
                          placeholder="Enter artist's stage name"
                        />
                        {errors.stageName && <p className="text-red-500 text-sm mt-1">{errors.stageName}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={newArtist.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                            }`}
                            placeholder="artist@example.com"
                          />
                          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={newArtist.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                            }`}
                            placeholder="+233 24 123 4567"
                          />
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={newArtist.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.location ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                          }`}
                          placeholder="City, Country"
                        />
                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bio</h3>
                    <div>
                      <textarea
                        value={newArtist.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                        }`}
                        placeholder="Tell us about the artist..."
                      />
                      {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Music className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Genres *
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {allGenres.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleGenreToggle(genre)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            newArtist.genres.includes(genre)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                    {errors.genres && <p className="text-red-500 text-sm mt-2">{errors.genres}</p>}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Social Media */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Share2 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Social Media
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Spotify Profile
                        </label>
                        <input
                          type="url"
                          value={newArtist.socialMedia.spotify}
                          onChange={(e) => handleInputChange('socialMedia.spotify', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="spotify.com/artist/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={newArtist.socialMedia.instagram}
                          onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="@artistname"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Twitter
                        </label>
                        <input
                          type="text"
                          value={newArtist.socialMedia.twitter}
                          onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="@artistname"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          YouTube Channel
                        </label>
                        <input
                          type="url"
                          value={newArtist.socialMedia.youtube}
                          onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="youtube.com/channel/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                      Contract Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contract Type
                        </label>
                        <select
                          value={newArtist.contract.type}
                          onChange={(e) => handleInputChange('contract.type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Exclusive">Exclusive</option>
                          <option value="Non-Exclusive">Non-Exclusive</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={newArtist.contract.startDate}
                            onChange={(e) => handleInputChange('contract.startDate', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                            }`}
                          />
                          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            End Date *
                          </label>
                          <input
                            type="date"
                            value={newArtist.contract.endDate}
                            onChange={(e) => handleInputChange('contract.endDate', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                            }`}
                          />
                          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Royalty Rate (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newArtist.contract.royaltyRate}
                            onChange={(e) => handleInputChange('contract.royaltyRate', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Advance Amount ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={newArtist.contract.advance}
                            onChange={(e) => handleInputChange('contract.advance', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
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
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding Artist...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Artist</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {errors.submit && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ArtistsManagement;
