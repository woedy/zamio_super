import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Album,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  Music,
  Users,
  Play,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

// Type definitions for albums
interface AlbumData {
  id: string;
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  trackCount: number;
  totalPlays: number;
  totalRevenue: number;
  coverArt?: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
}

// Mock data for albums
const albumData: AlbumData[] = [
  {
    id: '1',
    title: '5 Star',
    artist: 'King Promise',
    genre: 'Afrobeats',
    releaseDate: '2023-06-15',
    trackCount: 12,
    totalPlays: 1247000,
    totalRevenue: 23475.50,
    coverArt: '/albums/5-star.jpg',
    description: 'King Promise\'s highly anticipated album featuring hit singles',
    status: 'active',
    createdAt: '2023-05-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Obra',
    artist: 'Samini',
    genre: 'Dancehall',
    releaseDate: '2023-03-20',
    trackCount: 15,
    totalPlays: 892000,
    totalRevenue: 18750.00,
    coverArt: '/albums/obra.jpg',
    description: 'Samini\'s latest dancehall masterpiece',
    status: 'active',
    createdAt: '2023-02-15T14:30:00Z'
  },
  {
    id: '3',
    title: 'Son Of Africa',
    artist: 'Kuami Eugene',
    genre: 'Afro Pop',
    releaseDate: '2023-08-10',
    trackCount: 10,
    totalPlays: 2150000,
    totalRevenue: 45230.75,
    coverArt: '/albums/son-of-africa.jpg',
    description: 'Kuami Eugene\'s chart-topping album',
    status: 'active',
    createdAt: '2023-07-01T09:15:00Z'
  },
  {
    id: '4',
    title: 'Morning Drive Compilation',
    artist: 'Various Artists',
    genre: 'Mixed',
    releaseDate: '2023-09-05',
    trackCount: 25,
    totalPlays: 567000,
    totalRevenue: 12345.20,
    coverArt: '/albums/morning-drive.jpg',
    description: 'Daily morning drive compilation tracks',
    status: 'active',
    createdAt: '2023-08-20T16:45:00Z'
  },
  {
    id: '5',
    title: 'Love & Light',
    artist: 'Kuami Eugene',
    genre: 'R&B',
    releaseDate: '2023-11-12',
    trackCount: 8,
    totalPlays: 345000,
    totalRevenue: 7890.50,
    coverArt: '/albums/love-light.jpg',
    description: 'Intimate R&B collection from Kuami Eugene',
    status: 'active',
    createdAt: '2023-10-15T11:20:00Z'
  },
  {
    id: '6',
    title: 'Tech Talk Ghana',
    artist: 'Various Hosts',
    genre: 'Podcast',
    releaseDate: '2023-12-01',
    trackCount: 50,
    totalPlays: 156000,
    totalRevenue: 3456.80,
    coverArt: '/albums/tech-talk.jpg',
    description: 'Weekly technology discussions and interviews',
    status: 'inactive',
    createdAt: '2023-11-01T13:00:00Z'
  }
];

const AlbumList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = albumData;

    // Apply search filter
    if (searchTerm) {
      data = data.filter(album =>
        album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply genre filter
    if (selectedGenre !== 'all') {
      data = data.filter(album => album.genre === selectedGenre);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      data = data.filter(album => album.status === selectedStatus);
    }

    // Apply sorting
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
        case 'releaseDate':
          aValue = new Date(a.releaseDate);
          bValue = new Date(b.releaseDate);
          break;
        case 'trackCount':
          aValue = a.trackCount;
          bValue = b.trackCount;
          break;
        case 'totalPlays':
          aValue = a.totalPlays;
          bValue = b.totalPlays;
          break;
        case 'totalRevenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
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
  }, [searchTerm, selectedGenre, selectedStatus, sortBy, sortOrder]);

  const handleViewAlbum = (albumId: string) => {
    navigate('/dashboard/album-details', { state: { albumId } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'draft':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const statsData = {
    total: albumData.length,
    active: albumData.filter(a => a.status === 'active').length,
    inactive: albumData.filter(a => a.status === 'inactive').length,
    draft: albumData.filter(a => a.status === 'draft').length
  };

  return (
    <>
      {/* Page header - matching dashboard style */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm mb-2" aria-label="Breadcrumb">
                <button
                  onClick={() => navigate('/dashboard/upload-management')}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1"
                  aria-label="Go back to upload management"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Upload Management</span>
                  <span className="sm:hidden">Back</span>
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">Album Management</span>
              </nav>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Album Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Manage your music albums, track performance, and organize your catalog
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard/upload-management')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Add Album</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Total Albums</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {statsData.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/60 dark:to-indigo-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Album className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Active Albums</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  {statsData.active}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/60 dark:to-green-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Draft Albums</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                  {statsData.draft}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Edit className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/90 via-pink-50/80 to-rose-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  ₵{albumData.reduce((sum, album) => sum + album.totalRevenue, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/60 dark:to-pink-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Album className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Album Catalog
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search albums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Genres</option>
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
                <option value="Mixed">Mixed</option>
                <option value="Podcast">Podcast</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedData.map((album) => (
              <div key={album.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-600 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                {/* Album Cover */}
                <div className="relative mb-4">
                  <div className="w-full aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                    {album.coverArt ? (
                      <img
                        src={album.coverArt}
                        alt={`${album.title} cover`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Album className="w-16 h-16 text-indigo-400 dark:text-indigo-300" />
                    )}
                  </div>
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(album.status)}`}>
                    {album.status}
                  </span>
                </div>

                {/* Album Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 truncate">
                    {album.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by {album.artist}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{album.genre}</p>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2">
                    <span className="flex items-center space-x-1">
                      <Music className="w-4 h-4" />
                      <span>{album.trackCount} tracks</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(album.releaseDate).toLocaleDateString()}</span>
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {album.totalPlays.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Plays</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">
                        ₵{album.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3">
                    <button
                      onClick={() => handleViewAlbum(album.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-16">
              <Album className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No albums found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedGenre !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first album to get started.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AlbumList;
