import React, { useState } from 'react';
import {
  User,
  Music,
  TrendingUp,
  MapPin,
  Activity,
  Settings,
  Bell,
  BarChart3,
  Radio,
  Eye,
  Clock,
  Target,
  DollarSign,
  Share2,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Verified,
  Play,
  Calendar,
  Award,
  Star,
  Heart,
  Users,
  Globe,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Filter,
  Search,
  MoreVertical,
  Crown,
  Gem,
  Shield,
  Zap,
  Target as TargetIcon
} from 'lucide-react';

// Mock artist data with enhanced structure
const artistData = {
  name: 'Kofi Mensah',
  stageName: 'K-Mensah',
  bio: "Award-winning Ghanaian artist blending traditional highlife with modern Afrobeats. Known for hits like 'Ghana Na Woti' and 'Terminator'. With over 2.8 million plays and earnings exceeding ₵15,000, K-Mensah represents the new generation of Ghanaian music excellence.",
  avatar: '/api/placeholder/150/150',
  coverImage: '/api/placeholder/800/300',
  verified: true,
  followers: 45782,
  totalPlays: 2847592,
  totalEarnings: 15847.50,
  joinDate: '2020-03-15',
  location: 'Accra, Ghana',
  genres: ['Afrobeats', 'Highlife', 'Hip-Hop'],
  contact: {
    email: 'kofi@example.com',
    phone: '+233 24 123 4567',
    instagram: '@kmensahofficial',
    twitter: '@kmensah_music',
    facebook: 'KofiMensahMusic',
  },
  stats: {
    monthlyPlays: 1247,
    monthlyEarnings: 748.20,
    newFollowers: 234,
    radioCoverage: 12,
    avgRating: 4.8,
    totalSongs: 24
  },
  achievements: [
    { title: 'Gold Artist', description: 'Earned ₵10,000+ in royalties', icon: Crown, color: 'text-yellow-500' },
    { title: 'Rising Star', description: '1M+ total plays milestone', icon: Star, color: 'text-blue-500' },
    { title: 'Radio Favorite', description: 'Featured on 10+ radio stations', icon: Radio, color: 'text-purple-500' }
  ]
};

const songsData = [
  {
    id: 1,
    title: 'Ghana Na Woti',
    duration: '3:45',
    releaseDate: '2023-08-15',
    totalPlays: 8745,
    totalEarnings: 524.70,
    status: 'Active',
    album: 'Heritage Collection',
    genre: 'Afrobeats',
    contributors: [
      { name: 'Kofi Mensah', role: 'Lead Vocalist', percentage: 60 },
      { name: 'Kwame Asante', role: 'Producer', percentage: 25 },
      { name: 'Ama Serwaa', role: 'Songwriter', percentage: 15 },
    ],
    recentPlays: [
      { station: 'Peace FM', date: '2024-01-15', plays: 12, earnings: 7.20 },
      { station: 'Hitz FM', date: '2024-01-15', plays: 8, earnings: 4.80 },
      { station: 'Joy FM', date: '2024-01-14', plays: 15, earnings: 9.00 },
    ],
  },
  {
    id: 2,
    title: 'Terminator',
    duration: '4:12',
    releaseDate: '2023-12-01',
    totalPlays: 7234,
    totalEarnings: 434.04,
    status: 'Active',
    album: 'Street Vibes',
    genre: 'Hip-Hop',
    contributors: [
      { name: 'Kofi Mensah', role: 'Lead Vocalist', percentage: 70 },
      { name: 'Nana Yaw', role: 'Producer', percentage: 20 },
      { name: 'Efya', role: 'Featured Artist', percentage: 10 },
    ],
    recentPlays: [
      { station: 'Adom FM', date: '2024-01-15', plays: 10, earnings: 6.00 },
      { station: 'Okay FM', date: '2024-01-14', plays: 6, earnings: 3.60 },
    ],
  },
  {
    id: 3,
    title: 'Paris',
    duration: '3:28',
    releaseDate: '2023-06-20',
    totalPlays: 6543,
    totalEarnings: 392.58,
    status: 'Active',
    album: 'International Vibes',
    genre: 'R&B',
    contributors: [
      { name: 'Kofi Mensah', role: 'Lead Vocalist', percentage: 80 },
      { name: 'Richie Mensah', role: 'Producer', percentage: 20 },
    ],
    recentPlays: [
      { station: 'Y FM', date: '2024-01-15', plays: 5, earnings: 3.00 },
      { station: 'Live FM', date: '2024-01-14', plays: 7, earnings: 4.20 },
    ],
  },
];

const playLogsData = [
  {
    id: 1,
    song: 'Ghana Na Woti',
    station: 'Peace FM',
    date: '2024-01-15 14:30',
    duration: '3:45',
    earnings: 0.60,
  },
  {
    id: 2,
    song: 'Terminator',
    station: 'Hitz FM',
    date: '2024-01-15 12:15',
    duration: '4:12',
    earnings: 0.60,
  },
  {
    id: 3,
    song: 'Paris',
    station: 'Joy FM',
    date: '2024-01-15 10:45',
    duration: '3:28',
    earnings: 0.60,
  },
  {
    id: 4,
    song: 'Ghana Na Woti',
    station: 'Adom FM',
    date: '2024-01-15 09:20',
    duration: '3:45',
    earnings: 0.60,
  },
  {
    id: 5,
    song: 'Terminator',
    station: 'Okay FM',
    date: '2024-01-15 08:10',
    duration: '4:12',
    earnings: 0.60,
  },
];

const royaltyHistoryData = [
  {
    date: '2024-01-15',
    amount: 145.30,
    source: 'Radio Airplay',
    status: 'Paid',
  },
  { date: '2024-01-14', amount: 98.75, source: 'Streaming', status: 'Paid' },
  {
    date: '2024-01-13',
    amount: 234.50,
    source: 'Radio Airplay',
    status: 'Paid',
  },
  {
    date: '2024-01-12',
    amount: 67.20,
    source: 'Radio Airplay',
    status: 'Pending',
  },
  {
    date: '2024-01-11',
    amount: 189.40,
    source: 'Radio Airplay',
    status: 'Paid',
  },
];

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSong, setExpandedSong] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: artistData.name,
    stageName: artistData.stageName,
    bio: artistData.bio,
    location: artistData.location,
    genres: artistData.genres,
    contact: {
      email: artistData.contact.email,
      phone: artistData.contact.phone,
      instagram: artistData.contact.instagram,
      twitter: artistData.contact.twitter,
      facebook: artistData.contact.facebook,
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleGenreChange = (index: number, value: string) => {
    const newGenres = [...editFormData.genres];
    newGenres[index] = value;
    setEditFormData(prev => ({
      ...prev,
      genres: newGenres
    }));
  };

  const addGenre = () => {
    setEditFormData(prev => ({
      ...prev,
      genres: [...prev.genres, '']
    }));
  };

  const removeGenre = (index: number) => {
    const newGenres = editFormData.genres.filter((_, i) => i !== index);
    setEditFormData(prev => ({
      ...prev,
      genres: newGenres
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    // Basic validation
    if (!editFormData.name.trim() || !editFormData.stageName.trim() || !editFormData.bio.trim()) {
      setSaveMessage({ type: 'error', text: 'Please fill in all required fields.' });
      setIsSaving(false);
      return;
    }

    try {
      // In a real app, this would make an API call to save the profile
      // For now, we'll simulate an API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Close modal after a short delay
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveMessage(null);
      }, 2000);

    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }: {
    id: string;
    label: string;
    icon: any;
    isActive: boolean;
    onClick: (id: string) => void;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const SongCard = ({ song }: { song: any }) => (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{song.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {song.duration} • {song.album} • {song.genre}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Released {formatDate(song.releaseDate)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-gray-900 dark:text-white font-semibold">
              {song.totalPlays.toLocaleString()} plays
            </div>
            <div className="text-green-600 dark:text-green-400 text-sm">
              {formatCurrency(song.totalEarnings)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-green-500/20 text-green-400 p-2 rounded-lg hover:bg-green-500/30 transition-colors">
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpandedSong(expandedSong === song.id ? null : song.id)}
              className="bg-white/10 dark:bg-slate-800/60 p-2 rounded-lg hover:bg-white/20 dark:hover:bg-slate-800/80 transition-colors"
            >
              {expandedSong === song.id ? (
                <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {expandedSong === song.id && (
        <div className="space-y-4 border-t border-gray-200 dark:border-slate-600 pt-4">
          {/* Contributors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Contributors & Splits
              </h4>
              <button className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors flex items-center">
                <Plus className="w-3 h-3 mr-1" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {song.contributors.map((contributor: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg"
                >
                  <div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {contributor.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {contributor.role}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      {contributor.percentage}%
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Plays */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Recent Plays
            </h4>
            <div className="space-y-2">
              {song.recentPlays.map((play: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <Radio className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {play.station}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{formatDate(play.date)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 dark:text-white">{play.plays} plays</div>
                    <div className="text-green-600 dark:text-green-400 text-sm">
                      {formatCurrency(play.earnings)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <button className="bg-indigo-500/20 text-indigo-400 px-3 py-2 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors flex items-center">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button className="bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-sm hover:bg-blue-500/30 transition-colors flex items-center">
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </button>
            <button className="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm hover:bg-green-500/30 transition-colors flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Royalties
            </button>
            <button className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors flex items-center">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Artist Profile</h1>
                  <p className="text-gray-600 dark:text-gray-300 font-light">
                    Manage your music profile, track performance, and view earnings
                  </p>
                </div>
              </div>

              {/* Quick Stats in Header */}
              <div className="flex items-center space-x-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {artistData.totalPlays.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Plays</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(artistData.totalEarnings)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {songsData.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Songs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {artistData.followers.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Share2 className="w-4 h-4" />
                <span>Share Profile</span>
              </button>
              <button
                onClick={() => {
                  setEditFormData({
                    name: artistData.name,
                    stageName: artistData.stageName,
                    bio: artistData.bio,
                    location: artistData.location,
                    genres: [...artistData.genres],
                    contact: { ...artistData.contact }
                  });
                  setIsEditModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/60 dark:border-slate-600/60 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Artist Header Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/30 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {artistData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {artistData.verified && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 p-1 rounded-full">
                    <Verified className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {artistData.name}
                  </h1>
                  <span className="text-lg text-gray-600 dark:text-gray-300">
                    ({artistData.stageName})
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3 max-w-2xl leading-relaxed">{artistData.bio}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{artistData.location}</span>
                  </div>
                  <span>•</span>
                  <span>Joined {formatDate(artistData.joinDate)}</span>
                  <span>•</span>
                  <span>
                    {artistData.followers.toLocaleString()} followers
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  {artistData.genres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{artistData.contact.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{artistData.contact.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Instagram className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Instagram</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{artistData.contact.instagram}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Twitter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Twitter</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{artistData.contact.twitter}</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {artistData.achievements.map((achievement, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
                <div className={`p-2 rounded-lg ${achievement.color.replace('text-', 'bg-').replace('-500', '-100 dark:bg-').replace('-400', '-900/30')}`}>
                  <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{achievement.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-white/10 dark:bg-slate-800/50 backdrop-blur-md rounded-lg border border-white/20 dark:border-slate-700/30">
          <TabButton
            id="overview"
            label="Overview"
            icon={Eye}
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="songs"
            label="Songs"
            icon={Music}
            isActive={activeTab === 'songs'}
            onClick={setActiveTab}
          />
          <TabButton
            id="playlogs"
            label="Play Logs"
            icon={Activity}
            isActive={activeTab === 'playlogs'}
            onClick={setActiveTab}
          />
          <TabButton
            id="royalties"
            label="Royalties"
            icon={DollarSign}
            isActive={activeTab === 'royalties'}
            onClick={setActiveTab}
          />
          <TabButton
            id="analytics"
            label="Analytics"
            icon={BarChart3}
            isActive={activeTab === 'analytics'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {playLogsData.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/80 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                          <Radio className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">
                            {log.song}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {log.station} • {log.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-semibold">
                        {formatCurrency(log.earnings)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Performance */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  This Month's Performance
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Total Plays</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{artistData.stats.monthlyPlays}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Total Earnings</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {formatCurrency(artistData.stats.monthlyEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">New Followers</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">+{artistData.stats.newFollowers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Radio Coverage</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {artistData.stats.radioCoverage} stations
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Performing Songs */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                  Top Performing Songs
                </h2>
                <div className="space-y-3">
                  {songsData.slice(0, 3).map((song, idx) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-slate-800/60 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/80 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">
                            {song.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {song.totalPlays.toLocaleString()} plays
                          </div>
                        </div>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-semibold">
                        {formatCurrency(song.totalEarnings)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Royalties */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-amber-500" />
                  Pending Royalties
                </h2>
                <div className="space-y-3">
                  {royaltyHistoryData
                    .filter((r) => r.status === 'Pending')
                    .map((transaction, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-amber-50/80 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50"
                      >
                        <div>
                          <div className="text-gray-900 dark:text-white font-medium">
                            {transaction.source}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(transaction.date)}
                          </div>
                        </div>
                        <div className="text-amber-600 dark:text-amber-400 font-semibold">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Songs Tab */}
          {activeTab === 'songs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {songsData.map((song) => (
                <SongCard song={song} />
              ))}
            </div>
          )}

          {/* Play Logs Tab */}
          {activeTab === 'playlogs' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detailed Play Logs</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl">
                <table className="min-w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50/80 dark:bg-slate-800/60 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-3">Song</th>
                      <th className="px-6 py-3">Station</th>
                      <th className="px-6 py-3">Date & Time</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Earnings</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-900 dark:text-white">
                    {playLogsData.map((log) => (
                      <tr key={log.id} className="bg-white/50 dark:bg-slate-800/30 border-b border-gray-200 dark:border-slate-600 hover:bg-gray-50/80 dark:hover:bg-slate-800/60">
                        <td className="px-6 py-4 font-medium">{log.song}</td>
                        <td className="px-6 py-4">{log.station}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{log.date}</td>
                        <td className="px-6 py-4">{log.duration}</td>
                        <td className="px-6 py-4 text-green-600 dark:text-green-400 font-semibold">{formatCurrency(log.earnings)}</td>
                        <td className="px-6 py-4">
                          <button className="p-1.5 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors duration-200">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Royalties Tab */}
          {activeTab === 'royalties' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Royalty History</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
              <div className="space-y-4">
                {royaltyHistoryData.map((transaction, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${
                      transaction.status === 'Paid'
                        ? 'bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'
                        : 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        transaction.status === 'Paid'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-amber-100 dark:bg-amber-900/30'
                      }`}>
                        {transaction.status === 'Paid' ? (
                          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-gray-900 dark:text-white font-semibold">
                          {transaction.source}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.status === 'Paid'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        transaction.status === 'Paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/30 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
                <select className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Last year</option>
                </select>
              </div>

              <div className="h-64 flex items-center justify-center bg-gray-50/50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Analytics Dashboard</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Interactive charts showing performance trends and insights
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Success/Error Message */}
              {saveMessage && (
                <div className={`p-4 rounded-lg ${
                  saveMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50'
                }`}>
                  <div className={`text-sm font-medium ${
                    saveMessage.type === 'success'
                      ? 'text-green-800 dark:text-green-400'
                      : 'text-red-800 dark:text-red-400'
                  }`}>
                    {saveMessage.text}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.stageName}
                    onChange={(e) => handleInputChange('stageName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your stage name"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your location"
                />
              </div>

              {/* Genres */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Genres
                  </label>
                  <button
                    onClick={addGenre}
                    className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Genre</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {editFormData.genres.map((genre, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={genre}
                        onChange={(e) => handleGenreChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter genre"
                      />
                      {editFormData.genres.length > 1 && (
                        <button
                          onClick={() => removeGenre(index)}
                          className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.contact.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.contact.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={editFormData.contact.instagram}
                      onChange={(e) => handleContactChange('instagram', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={editFormData.contact.twitter}
                      onChange={(e) => handleContactChange('twitter', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-slate-600">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                    isSaving
                      ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
