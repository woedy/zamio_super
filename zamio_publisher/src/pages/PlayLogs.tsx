import React, { useState, useMemo } from 'react';
import { Activity, Eye, Search, Clock, Radio, Music, TrendingUp, Filter, Download, ArrowUpDown, ArrowUp, ArrowDown, Building2 } from 'lucide-react';

// Type definitions for publisher-focused data
interface PublisherPlayLogData {
  id: number;
  track_title: string;
  artist: string;
  publisher_catalog_id: string;
  station_name: string;
  station_region: string;
  matched_at: string;
  stop_time: string;
  duration: string;
  plays: number;
  royalty_amount: number;
  status: 'Confirmed' | 'Pending' | 'Disputed';
  license_type: 'Mechanical' | 'Performance' | 'Sync';
  territory: string;
}

interface PublisherMatchLogData {
  id: number;
  song: string;
  artist: string;
  publisher_catalog_id: string;
  station: string;
  station_region: string;
  matched_at: string;
  confidence: number;
  status: 'Verified' | 'Pending' | 'Disputed' | 'Rejected';
  license_status: 'Active' | 'Expired' | 'Pending';
}

// Publisher-focused mock data
const publisherPlayLogsData: PublisherPlayLogData[] = [
  {
    id: 1,
    track_title: 'Ghana Na Woti',
    artist: 'King Promise',
    publisher_catalog_id: 'PUB-001-2024',
    station_name: 'Peace FM',
    station_region: 'Greater Accra',
    matched_at: '2024-10-16T10:30:00Z',
    stop_time: '2024-10-16T10:33:45Z',
    duration: '3:45',
    plays: 12,
    royalty_amount: 45.60,
    status: 'Confirmed',
    license_type: 'Performance',
    territory: 'Ghana'
  },
  {
    id: 2,
    track_title: 'Obra',
    artist: 'Samini',
    publisher_catalog_id: 'PUB-002-2024',
    station_name: 'Hitz FM',
    station_region: 'Greater Accra',
    matched_at: '2024-10-16T11:15:00Z',
    stop_time: '2024-10-16T11:18:30Z',
    duration: '3:30',
    plays: 8,
    royalty_amount: 32.40,
    status: 'Confirmed',
    license_type: 'Performance',
    territory: 'Ghana'
  },
  {
    id: 3,
    track_title: 'Krom Aye De',
    artist: 'Okra Tom Dawidi',
    publisher_catalog_id: 'PUB-003-2024',
    station_name: 'Adom FM',
    station_region: 'Ashanti',
    matched_at: '2024-10-16T12:45:00Z',
    stop_time: '2024-10-16T12:49:15Z',
    duration: '4:15',
    plays: 15,
    royalty_amount: 57.50,
    status: 'Pending',
    license_type: 'Performance',
    territory: 'Ghana'
  },
  {
    id: 4,
    track_title: 'Love & Light',
    artist: 'Kuami Eugene',
    publisher_catalog_id: 'PUB-004-2024',
    station_name: 'Joy FM',
    station_region: 'Greater Accra',
    matched_at: '2024-10-16T14:20:00Z',
    stop_time: '2024-10-16T14:23:45Z',
    duration: '3:45',
    plays: 22,
    royalty_amount: 82.50,
    status: 'Confirmed',
    license_type: 'Performance',
    territory: 'Ghana'
  },
  {
    id: 5,
    track_title: 'Dance Floor',
    artist: 'Kofi Kinaata',
    publisher_catalog_id: 'PUB-005-2024',
    station_name: 'Okay FM',
    station_region: 'Greater Accra',
    matched_at: '2024-10-16T15:10:00Z',
    stop_time: '2024-10-16T15:13:20Z',
    duration: '3:20',
    plays: 18,
    royalty_amount: 67.50,
    status: 'Confirmed',
    license_type: 'Performance',
    territory: 'Ghana'
  }
];

const publisherMatchLogsData: PublisherMatchLogData[] = [
  {
    id: 1,
    song: 'Ghana Na Woti',
    artist: 'King Promise',
    publisher_catalog_id: 'PUB-001-2024',
    station: 'Peace FM',
    station_region: 'Greater Accra',
    matched_at: '2024-10-16T10:30:00Z',
    confidence: 96,
    status: 'Verified',
    license_status: 'Active'
  },
  {
    id: 2,
    song: 'Obra',
    artist: 'Samini',
    publisher_catalog_id: 'PUB-002-2024',
    station: 'Hitz FM',
    station_region: 'Greater Accra',
    matched_at: '2024-10-16T11:15:00Z',
    confidence: 94,
    status: 'Verified',
    license_status: 'Active'
  },
  {
    id: 3,
    song: 'Angela',
    artist: 'Kuami Eugene',
    publisher_catalog_id: 'PUB-004-2024',
    station: 'Peace FM',
    station_region: 'Greater Accra',
    matched_at: '2024-10-16T16:30:00Z',
    confidence: 89,
    status: 'Pending',
    license_status: 'Active'
  },
  {
    id: 4,
    song: 'My Level',
    artist: 'Shatta Wale',
    publisher_catalog_id: 'PUB-006-2024',
    station: 'Hitz FM',
    station_region: 'Greater Accra',
    matched_at: '2024-10-16T17:45:00Z',
    confidence: 87,
    status: 'Disputed',
    license_status: 'Active'
  }
];

const PublisherPlayLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('playlogs');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [sortBy, setSortBy] = useState('matched_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data: (PublisherPlayLogData | PublisherMatchLogData)[] = activeTab === 'playlogs' ? publisherPlayLogsData : publisherMatchLogsData;

    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        if (activeTab === 'playlogs') {
          const playLog = item as PublisherPlayLogData;
          return (
            playLog.track_title.toLowerCase().includes(searchLower) ||
            playLog.artist.toLowerCase().includes(searchLower) ||
            playLog.station_name.toLowerCase().includes(searchLower) ||
            playLog.publisher_catalog_id.toLowerCase().includes(searchLower)
          );
        } else {
          const matchLog = item as PublisherMatchLogData;
          return (
            matchLog.song.toLowerCase().includes(searchLower) ||
            matchLog.artist.toLowerCase().includes(searchLower) ||
            matchLog.station.toLowerCase().includes(searchLower) ||
            matchLog.publisher_catalog_id.toLowerCase().includes(searchLower)
          );
        }
      });
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue, bValue;

      if (activeTab === 'playlogs') {
        const playLogA = a as PublisherPlayLogData;
        const playLogB = b as PublisherPlayLogData;
        switch (sortBy) {
          case 'track_title':
            aValue = playLogA.track_title;
            bValue = playLogB.track_title;
            break;
          case 'station_name':
            aValue = playLogA.station_name;
            bValue = playLogB.station_name;
            break;
          case 'royalty_amount':
            aValue = playLogA.royalty_amount;
            bValue = playLogB.royalty_amount;
            break;
          case 'plays':
            aValue = playLogA.plays;
            bValue = playLogB.plays;
            break;
          default:
            aValue = new Date(playLogA.matched_at);
            bValue = new Date(playLogB.matched_at);
        }
      } else {
        const matchLogA = a as PublisherMatchLogData;
        const matchLogB = b as PublisherMatchLogData;
        switch (sortBy) {
          case 'song':
            aValue = matchLogA.song;
            bValue = matchLogB.song;
            break;
          case 'station':
            aValue = matchLogA.station;
            bValue = matchLogB.station;
            break;
          case 'confidence':
            aValue = matchLogA.confidence;
            bValue = matchLogB.confidence;
            break;
          default:
            aValue = new Date(matchLogA.matched_at);
            bValue = new Date(matchLogB.matched_at);
        }
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
  }, [activeTab, searchTerm, sortBy, sortOrder]);

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
    return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
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
      className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
          : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border border-white/20 hover:border-white/40'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Publisher-focused header */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Catalog Performance Logs</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Track your music catalog performance and revenue across all licensed stations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="all">All Territories</option>
                <option value="ghana">Ghana</option>
                <option value="west-africa">West Africa</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl border border-gray-200 dark:border-slate-600 backdrop-blur-sm">
            <TabButton
              id="playlogs"
              label="Play Logs"
              icon={Activity}
              isActive={activeTab === 'playlogs'}
              onClick={setActiveTab}
            />
            <TabButton
              id="matchlogs"
              label="Match Logs"
              icon={Eye}
              isActive={activeTab === 'matchlogs'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-slate-700/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {activeTab === 'playlogs' ? (
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              )}
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {activeTab === 'playlogs' ? 'Publisher Play Logs' : 'Publisher Match Logs'}
              </h2>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{filteredAndSortedData.length} total entries</span>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-1 rounded border border-gray-200 dark:border-slate-600"
              >
                <option value="matched_at">Date</option>
                {activeTab === 'playlogs' ? (
                  <>
                    <option value="track_title">Song Title</option>
                    <option value="station_name">Station</option>
                    <option value="royalty_amount">Revenue</option>
                    <option value="plays">Plays</option>
                  </>
                ) : (
                  <>
                    <option value="song">Song</option>
                    <option value="station">Station</option>
                    <option value="confidence">Confidence</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    {activeTab === 'playlogs' ? (
                      <>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <Music className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Song</span>
                            <span className="sm:hidden">Song</span>
                            <span className="text-xs">{getSortIcon('track_title')}</span>
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Station</span>
                            <span className="sm:hidden">Station</span>
                            <span className="text-xs">{getSortIcon('station_name')}</span>
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Played At</span>
                            <span className="text-xs">{getSortIcon('matched_at')}</span>
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                          License
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Revenue</span>
                            <span className="sm:hidden">$</span>
                            <span className="text-xs">{getSortIcon('royalty_amount')}</span>
                          </div>
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Song
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                          Station
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                          License Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                  {paginatedData.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200">
                      {activeTab === 'playlogs' ? (
                        <>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <div className="flex flex-col">
                              <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                                {(log as PublisherPlayLogData).track_title}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs truncate">by {(log as PublisherPlayLogData).artist}</span>
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                {(log as PublisherPlayLogData).publisher_catalog_id}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <div className="flex flex-col">
                              <span className="text-gray-900 dark:text-white text-xs sm:text-sm font-medium">
                                {(log as PublisherPlayLogData).station_name}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {(log as PublisherPlayLogData).station_region}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden md:table-cell">
                            <div className="flex flex-col">
                              <span className="sm:hidden">{new Date((log as PublisherPlayLogData).matched_at).toLocaleDateString()}</span>
                              <span className="hidden sm:inline">{new Date((log as PublisherPlayLogData).matched_at).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                              (log as PublisherPlayLogData).license_type === 'Performance'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : (log as PublisherPlayLogData).license_type === 'Mechanical'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {(log as PublisherPlayLogData).license_type}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
                              ₵{(log as PublisherPlayLogData).royalty_amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                              (log as PublisherPlayLogData).status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {(log as PublisherPlayLogData).status}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <div className="flex flex-col">
                              <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate max-w-[120px]">
                                {(log as PublisherMatchLogData).song}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs truncate">by {(log as PublisherMatchLogData).artist}</span>
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                {(log as PublisherMatchLogData).publisher_catalog_id}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell truncate max-w-[100px]">
                            <div className="flex flex-col">
                              <span className="font-medium">{(log as PublisherMatchLogData).station}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {(log as PublisherMatchLogData).station_region}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden md:table-cell">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                              (log as PublisherMatchLogData).license_status === 'Active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : (log as PublisherMatchLogData).license_status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {(log as PublisherMatchLogData).license_status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <div className="w-8 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(log as PublisherMatchLogData).confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm">{(log as PublisherMatchLogData).confidence}%</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                              (log as PublisherMatchLogData).status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : (log as PublisherMatchLogData).status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                : (log as PublisherMatchLogData).status === 'Disputed'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {(log as PublisherMatchLogData).status}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan={activeTab === 'playlogs' ? 6 : 5}
                        className="px-3 sm:px-6 py-8 sm:py-16 text-center text-gray-500 dark:text-gray-400"
                      >
                        No logs found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-800/30 -mx-8 px-8 py-4 rounded-b-2xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Showing <span className="text-green-600 dark:text-green-400 font-semibold">{startIndex + 1}</span> to{' '}
                <span className="text-green-600 dark:text-green-400 font-semibold">{Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)}</span> of{' '}
                <span className="text-green-600 dark:text-green-400 font-semibold">{filteredAndSortedData.length}</span> entries
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
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md transform scale-105'
                            : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
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
                Showing all {filteredAndSortedData.length} entries
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublisherPlayLogs;
