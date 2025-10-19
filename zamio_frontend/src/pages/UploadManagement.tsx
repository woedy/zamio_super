import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileAudio,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Play,
  Pause,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Album
} from 'lucide-react';

// Type definitions for upload management
interface UploadData {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  duration?: string;
  artist?: string;
  album?: string;
  title?: string;
  station?: string;
  error?: string;
  retryCount?: number;
}

// Mock data for uploads
const uploadData: UploadData[] = [
  {
    id: '1',
    filename: 'track_001.mp3',
    fileType: 'audio/mpeg',
    fileSize: 5242880, // 5MB
    uploadDate: '2024-10-16T10:30:00Z',
    status: 'completed',
    progress: 100,
    duration: '3:45',
    artist: 'King Promise',
    album: '5 Star',
    title: 'Ghana Na Woti',
    station: 'Peace FM'
  },
  {
    id: '2',
    filename: 'album_mix.wav',
    fileType: 'audio/wav',
    fileSize: 15728640, // 15MB
    uploadDate: '2024-10-16T11:15:00Z',
    status: 'processing',
    progress: 75,
    duration: '4:22',
    artist: 'Samini',
    album: 'Obra',
    title: 'Obra Mix'
  },
  {
    id: '3',
    filename: 'live_session.flac',
    fileType: 'audio/flac',
    fileSize: 26214400, // 25MB
    uploadDate: '2024-10-16T12:00:00Z',
    status: 'failed',
    progress: 0,
    error: 'File too large - maximum 20MB allowed',
    retryCount: 2,
    artist: 'Kuami Eugene',
    album: 'Son Of Africa',
    title: 'Angela'
  },
  {
    id: '4',
    filename: 'radio_show.mp3',
    fileType: 'audio/mpeg',
    fileSize: 10485760, // 10MB
    uploadDate: '2024-10-16T12:30:00Z',
    status: 'uploading',
    progress: 45,
    duration: '2:15:30',
    artist: 'Various Artists',
    album: 'Morning Drive Compilation',
    title: 'Morning Drive Show'
  },
  {
    id: '5',
    filename: 'single_release.mp3',
    fileType: 'audio/mpeg',
    fileSize: 3670016, // 3.5MB
    uploadDate: '2024-10-16T13:00:00Z',
    status: 'completed',
    progress: 100,
    duration: '3:12',
    artist: 'Kuami Eugene',
    album: 'Love & Light',
    title: 'Love & Light'
  },
  {
    id: '6',
    filename: 'podcast_episode.wav',
    fileType: 'audio/wav',
    fileSize: 8388608, // 8MB
    uploadDate: '2024-10-16T13:30:00Z',
    status: 'cancelled',
    progress: 30,
    duration: '45:20',
    artist: 'Various Hosts',
    album: 'Tech Talk Ghana',
    title: 'Tech Talk Ghana'
  }
];

const UploadManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [selectedUploads, setSelectedUploads] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isAddAlbumModalOpen, setIsAddAlbumModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState({
    title: '',
    artist: '',
    genre: '',
    releaseDate: '',
    description: ''
  });

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
    setIsBulkUploadModalOpen(false);
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

  const handleViewTrack = (trackId: string) => {
    navigate('/dashboard/track-details', { state: { trackId } });
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = uploadData;

    // Apply tab filter
    if (activeTab !== 'all') {
      data = data.filter(item => {
        switch (activeTab) {
          case 'uploading':
            return item.status === 'uploading';
          case 'processing':
            return item.status === 'processing';
          case 'completed':
            return item.status === 'completed';
          case 'failed':
            return item.status === 'failed' || item.status === 'cancelled';
          default:
            return true;
        }
      });
    }

    // Apply album filter
    if (selectedAlbum !== 'all') {
      data = data.filter(item => item.album === selectedAlbum);
    }

    // Apply search filter
    if (searchTerm) {
      data = data.filter(item =>
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.album?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.station?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'filename':
          aValue = a.filename;
          bValue = b.filename;
          break;
        case 'album':
          aValue = a.album || '';
          bValue = b.album || '';
          break;
        case 'fileSize':
          aValue = a.fileSize;
          bValue = a.fileSize;
          break;
        case 'uploadDate':
          aValue = new Date(a.uploadDate);
          bValue = new Date(b.uploadDate);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.filename;
          bValue = b.filename;
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
  }, [activeTab, selectedAlbum, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

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

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'uploading':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'uploading':
        return <Upload className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick, count }: {
    id: string;
    label: string;
    icon: any;
    isActive: boolean;
    onClick: (id: string) => void;
    count?: number;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
          : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border border-white/20 hover:border-white/40'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          isActive
            ? 'bg-white/20 text-white'
            : 'bg-gray-600 text-gray-300'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const statsData = {
    total: uploadData.length,
    uploading: uploadData.filter(u => u.status === 'uploading').length,
    processing: uploadData.filter(u => u.status === 'processing').length,
    completed: uploadData.filter(u => u.status === 'completed').length,
    failed: uploadData.filter(u => u.status === 'failed' || u.status === 'cancelled').length
  };

  return (
    <>
      {/* Page header - matching dashboard style */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Upload Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Manage your audio file uploads, processing status, and batch operations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAddAlbumModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-slate-600 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Album className="w-4 h-4" />
                <span>Add Album</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/album-list')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-slate-600 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Album className="w-4 h-4" />
                <span>Album Management</span>
              </button>
              <button
                onClick={() => {
                  setIsBulkUploadModalOpen(true);
                  setBulkUploadStep(1);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Upload</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/add-track')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-slate-600 hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Upload className="w-4 h-4" />
                <span>Add Single Track</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Total Files</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {statsData.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/60 dark:to-indigo-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <FileAudio className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Uploading</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                  {statsData.uploading}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50/90 via-cyan-50/80 to-teal-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Processing</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {statsData.processing}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/60 dark:to-cyan-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  {statsData.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/60 dark:to-green-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50/90 via-pink-50/80 to-rose-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-red-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-red-300 dark:hover:border-red-700/70 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Failed</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                  {statsData.failed}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/60 dark:to-pink-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl border border-gray-200 dark:border-slate-600 backdrop-blur-sm">
            <TabButton
              id="all"
              label="All Files"
              icon={FileAudio}
              isActive={activeTab === 'all'}
              onClick={setActiveTab}
              count={statsData.total}
            />
            <TabButton
              id="uploading"
              label="Uploading"
              icon={Upload}
              isActive={activeTab === 'uploading'}
              onClick={setActiveTab}
              count={statsData.uploading}
            />
            <TabButton
              id="processing"
              label="Processing"
              icon={RefreshCw}
              isActive={activeTab === 'processing'}
              onClick={setActiveTab}
              count={statsData.processing}
            />
            <TabButton
              id="completed"
              label="Completed"
              icon={CheckCircle}
              isActive={activeTab === 'completed'}
              onClick={setActiveTab}
              count={statsData.completed}
            />
            <TabButton
              id="failed"
              label="Failed"
              icon={XCircle}
              isActive={activeTab === 'failed'}
              onClick={setActiveTab}
              count={statsData.failed}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileAudio className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Upload Management
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>
              <select
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Albums</option>
                <option value="5 Star">5 Star</option>
                <option value="Obra">Obra</option>
                <option value="Son Of Africa">Son Of Africa</option>
                <option value="Morning Drive Compilation">Morning Drive Compilation</option>
                <option value="Love & Light">Love & Light</option>
                <option value="Tech Talk Ghana">Tech Talk Ghana</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="uploadDate">Upload Date</option>
                <option value="filename">Filename</option>
                <option value="album">Album</option>
                <option value="fileSize">File Size</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Upload Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>File Details</span>
                        <span className="text-xs">{getSortIcon('filename')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      <div className="flex items-center space-x-1">
                        <span>Album</span>
                        <span className="text-xs">{getSortIcon('album')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      <div className="flex items-center space-x-1">
                        <span>Size</span>
                        <span className="text-xs">{getSortIcon('fileSize')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      <div className="flex items-center space-x-1">
                        <span>Upload Date</span>
                        <span className="text-xs">{getSortIcon('uploadDate')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Progress</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        <span className="text-xs">{getSortIcon('status')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredAndSortedData.map((upload) => (
                    <tr key={upload.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUploads.includes(upload.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUploads([...selectedUploads, upload.id]);
                            } else {
                              setSelectedUploads(selectedUploads.filter(id => id !== upload.id));
                            }
                          }}
                          className="rounded border-gray-300 dark:border-slate-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 dark:text-white font-medium text-sm truncate max-w-[200px]">
                            {upload.filename}
                          </span>
                          {upload.artist && upload.album && upload.title && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs truncate">
                              {upload.artist} - {upload.album} - {upload.title}
                            </span>
                          )}
                          {upload.station && (
                            <span className="text-blue-600 dark:text-blue-400 text-xs">
                              Station: {upload.station}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm hidden md:table-cell truncate max-w-[150px]">
                        {upload.album || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm hidden sm:table-cell">
                        {formatFileSize(upload.fileSize)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm hidden md:table-cell">
                        {new Date(upload.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                upload.status === 'completed' ? 'bg-emerald-500' :
                                upload.status === 'processing' ? 'bg-blue-500' :
                                upload.status === 'uploading' ? 'bg-amber-500' :
                                upload.status === 'failed' || upload.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${upload.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 w-12">
                            {upload.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusColor(upload.status)}`}>
                          {getStatusIcon(upload.status)}
                          <span className="ml-1 capitalize">{upload.status}</span>
                        </span>
                        {upload.error && (
                          <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                            {upload.error}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {upload.status === 'uploading' && (
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                          {upload.status === 'failed' && (
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewTrack(upload.id)}
                            className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                        No uploads found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination - More Visible */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-800/30 -mx-8 px-8 py-4 rounded-b-2xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Showing <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{startIndex + 1}</span> to{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)}</span> of{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{filteredAndSortedData.length}</span> uploads
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <span>Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Show pagination info even when only one page */}
          {totalPages === 1 && filteredAndSortedData.length > 0 && (
            <div className="flex justify-center mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing all {filteredAndSortedData.length} uploads
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Album Modal */}
      {isAddAlbumModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Album</h2>
              <button
                onClick={() => setIsAddAlbumModalOpen(false)}
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
                  Album Title
                </label>
                <input
                  type="text"
                  value={newAlbumData.title}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, title: e.target.value })}
                  placeholder="Enter album title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={newAlbumData.artist}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, artist: e.target.value })}
                  placeholder="Enter artist name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genre
                </label>
                <select
                  value={newAlbumData.genre}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, genre: e.target.value })}
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
                  Release Date
                </label>
                <input
                  type="date"
                  value={newAlbumData.releaseDate}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, releaseDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newAlbumData.description}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the album (optional)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsAddAlbumModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would make an API call to create the album
                    alert(`Album "${newAlbumData.title}" by ${newAlbumData.artist} has been created successfully!`);
                    setNewAlbumData({
                      title: '',
                      artist: '',
                      genre: '',
                      releaseDate: '',
                      description: ''
                    });
                    setIsAddAlbumModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  Create Album
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal - Multi-Step Wizard */}
      {isBulkUploadModalOpen && (
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

export default UploadManagement;
