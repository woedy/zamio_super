import React, { useState, useMemo } from 'react';
import { Activity, Eye, Search, Clock, Radio, Music, TrendingUp, Filter, Download } from 'lucide-react';

// Type definitions for better type safety
interface PlayLogData {
  id: number;
  track_title: string;
  artist: string;
  station_name: string;
  matched_at: string;
  stop_time: string;
  duration: string;
  royalty_amount: number;
  status: string;
  attribution_source: string;
  plays: number;
  partner_name?: string;
}

interface MatchLogData {
  id: number;
  song: string;
  artist: string;
  station: string;
  matched_at: string;
  confidence: number;
  source: string;
  match_type: string;
  status: string;
}

// Demo data for play logs
const playLogsData: PlayLogData[] = [
  {
    id: 1,
    track_title: "Enjoyment",
    artist: "Sarkodie",
    station_name: "Joy FM",
    matched_at: "2024-01-15 14:30:00",
    stop_time: "2024-01-15 14:33:45",
    duration: "3:45",
    royalty_amount: 12.50,
    status: "Confirmed",
    attribution_source: "Station",
    plays: 156
  },
  {
    id: 2,
    track_title: "Kpokeke",
    artist: "Stonebwoy",
    station_name: "Adom FM",
    matched_at: "2024-01-15 16:15:00",
    stop_time: "2024-01-15 16:18:20",
    duration: "3:20",
    royalty_amount: 8.75,
    status: "Pending",
    attribution_source: "Partner",
    partner_name: "Ghana Music Rights",
    plays: 89
  },
  {
    id: 3,
    track_title: "Aseda",
    artist: "King Promise",
    station_name: "Peace FM",
    matched_at: "2024-01-15 19:45:00",
    stop_time: "2024-01-15 19:49:30",
    duration: "4:30",
    royalty_amount: 15.20,
    status: "Confirmed",
    attribution_source: "Station",
    plays: 203
  },
  {
    id: 4,
    track_title: "Heat",
    artist: "Wendy Shay",
    station_name: "Citi FM",
    matched_at: "2024-01-15 12:20:00",
    stop_time: "2024-01-15 12:23:15",
    duration: "3:15",
    royalty_amount: 6.80,
    status: "Confirmed",
    attribution_source: "Station",
    plays: 67
  },
  {
    id: 5,
    track_title: "Second Sermon",
    artist: "Black Sherif",
    station_name: "Angel FM",
    matched_at: "2024-01-15 21:10:00",
    stop_time: "2024-01-15 21:14:45",
    duration: "4:45",
    royalty_amount: 18.90,
    status: "Confirmed",
    attribution_source: "Partner",
    partner_name: "Audiomack Ghana",
    plays: 245
  },
  {
    id: 6,
    track_title: "Yentie Obiaa",
    artist: "Kuami Eugene",
    station_name: "Okay FM",
    matched_at: "2024-01-15 08:30:00",
    stop_time: "2024-01-15 08:33:25",
    duration: "3:25",
    royalty_amount: 9.45,
    status: "Pending",
    attribution_source: "Station",
    plays: 112
  },
  {
    id: 7,
    track_title: "Mood",
    artist: "Mr Drew",
    station_name: "Joy FM",
    matched_at: "2024-01-15 17:55:00",
    stop_time: "2024-01-15 17:58:40",
    duration: "3:40",
    royalty_amount: 11.30,
    status: "Confirmed",
    attribution_source: "Station",
    plays: 178
  },
  {
    id: 8,
    track_title: "Abodie",
    artist: "Captain Planet",
    station_name: "Adom FM",
    matched_at: "2024-01-15 13:45:00",
    stop_time: "2024-01-15 13:48:15",
    duration: "3:15",
    royalty_amount: 7.25,
    status: "Confirmed",
    attribution_source: "Partner",
    partner_name: "Boomplay Ghana",
    plays: 94
  }
];

// Demo data for match logs
const matchLogsData: MatchLogData[] = [
  {
    id: 1,
    song: "Enjoyment",
    artist: "Sarkodie",
    station: "Joy FM",
    matched_at: "2024-01-15 14:30:00",
    confidence: 98.5,
    source: "ACRCloud",
    match_type: "Exact Match",
    status: "Verified"
  },
  {
    id: 2,
    song: "Kpokeke",
    artist: "Stonebwoy",
    station: "Adom FM",
    matched_at: "2024-01-15 16:15:00",
    confidence: 94.2,
    source: "Partner Detection",
    match_type: "Partial Match",
    status: "Under Review"
  },
  {
    id: 3,
    song: "Aseda",
    artist: "King Promise",
    station: "Peace FM",
    matched_at: "2024-01-15 19:45:00",
    confidence: 99.1,
    source: "ACRCloud",
    match_type: "Exact Match",
    status: "Verified"
  },
  {
    id: 4,
    song: "Heat",
    artist: "Wendy Shay",
    station: "Citi FM",
    matched_at: "2024-01-15 12:20:00",
    confidence: 87.3,
    source: "Station Upload",
    match_type: "Metadata Match",
    status: "Verified"
  },
  {
    id: 5,
    song: "Second Sermon",
    artist: "Black Sherif",
    station: "Angel FM",
    matched_at: "2024-01-15 21:10:00",
    confidence: 95.8,
    source: "ACRCloud",
    match_type: "Exact Match",
    status: "Verified"
  }
];

const PlayLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('playlogs');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [sortBy, setSortBy] = useState('matched_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data: (PlayLogData | MatchLogData)[] = activeTab === 'playlogs' ? playLogsData : matchLogsData;

    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        if (activeTab === 'playlogs') {
          const playLog = item as PlayLogData;
          return (
            playLog.track_title.toLowerCase().includes(searchLower) ||
            playLog.artist.toLowerCase().includes(searchLower) ||
            playLog.station_name.toLowerCase().includes(searchLower) ||
            playLog.status.toLowerCase().includes(searchLower)
          );
        } else {
          const matchLog = item as MatchLogData;
          return (
            matchLog.song.toLowerCase().includes(searchLower) ||
            matchLog.artist.toLowerCase().includes(searchLower) ||
            matchLog.station.toLowerCase().includes(searchLower) ||
            matchLog.status.toLowerCase().includes(searchLower)
          );
        }
      });
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue, bValue;

      if (activeTab === 'playlogs') {
        const playLogA = a as PlayLogData;
        const playLogB = b as PlayLogData;
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
        const matchLogA = a as MatchLogData;
        const matchLogB = b as MatchLogData;
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
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
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
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
          : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border border-white/20 hover:border-white/40'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Page header - matching dashboard style */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Play & Match Logs</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                Track your music performance and detection across all platforms
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Time</option>
                <option value="monthly">This Month</option>
                <option value="weekly">This Week</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content - matching dashboard layout */}
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
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              )}
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {activeTab === 'playlogs' ? 'Play Logs' : 'Match Logs'}
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
                    <option value="royalty_amount">Earnings</option>
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
                            <Radio className="w-3 h-3 sm:w-4 sm:h-4" />
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
                          Duration
                        </th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Earnings</span>
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
                          Matched At
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
                                {(log as PlayLogData).track_title}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs truncate">by {(log as PlayLogData).artist}</span>
                              {(log as PlayLogData).attribution_source === 'Partner' && (
                                <span className="inline-flex items-center mt-1 px-3 py-1.5 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                  Partner: {(log as PlayLogData).partner_name || 'Ghana Music Rights'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-900 dark:text-white text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-none">
                            {(log as PlayLogData).station_name}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden md:table-cell">
                            <div className="flex flex-col">
                              <span className="sm:hidden">{new Date((log as PlayLogData).matched_at).toLocaleDateString()}</span>
                              <span className="hidden sm:inline">{new Date((log as PlayLogData).matched_at).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell">
                            {(log as PlayLogData).duration}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
                              ₵{(log as PlayLogData).royalty_amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                              (log as PlayLogData).status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {(log as PlayLogData).status}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate max-w-[120px]">
                            {(log as MatchLogData).song}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden sm:table-cell truncate max-w-[100px]">
                            {(log as MatchLogData).station}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-600 dark:text-gray-300 text-xs sm:text-sm hidden md:table-cell">
                            <div className="flex flex-col">
                              <span className="sm:hidden">{new Date((log as MatchLogData).matched_at).toLocaleDateString()}</span>
                              <span className="hidden sm:inline">{new Date((log as MatchLogData).matched_at).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <div className="w-8 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(log as MatchLogData).confidence}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm">{(log as MatchLogData).confidence}%</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                              (log as MatchLogData).status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {(log as MatchLogData).status}
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

          {/* Enhanced Pagination - More Visible */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-800/30 -mx-8 px-8 py-4 rounded-b-2xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Showing <span className="text-blue-600 dark:text-blue-400 font-semibold">{startIndex + 1}</span> to{' '}
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)}</span> of{' '}
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{filteredAndSortedData.length}</span> entries
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
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105'
                            : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
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

export default PlayLogs;
