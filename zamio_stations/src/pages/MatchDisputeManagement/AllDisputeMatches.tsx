import { useState } from 'react';
import { Card } from '@zamio/ui';
import { Activity, Search, Eye, Logs, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Demo data for Match Dispute Management
const demoDisputes = [
  {
    id: 1,
    track_title: 'Midnight Vibes',
    artist_name: 'Ghana Artists Collective',
    start_time: '2024-01-15 14:30:00',
    stop_time: '2024-01-15 14:33:45',
    duration: '3:45',
    confidence: 98,
    earnings: 2.50,
    status: 'Flagged',
    comment: 'Low confidence match detected',
    timestamp: '2024-01-15 14:35:00',
    cover_art: '/demo-images/midnight-vibes.jpg',
    audio_file_mp3: '/demo-audio/midnight-vibes.mp3',
    release_date: '2023-12-01',
    plays: 15,
    title: 'Midnight Vibes',
    playLogs: [
      { time: '2024-01-15 14:30:00', station: 'Peace FM', region: 'Accra' },
      { time: '2024-01-15 12:15:00', station: 'Hitz FM', region: 'Kumasi' },
    ]
  },
  {
    id: 2,
    track_title: 'Ghana My Home',
    artist_name: 'Pat Thomas',
    start_time: '2024-01-15 12:15:00',
    stop_time: '2024-01-15 12:19:12',
    duration: '4:12',
    confidence: 96,
    earnings: 2.80,
    status: 'Resolved',
    comment: 'Verified match - no issues',
    timestamp: '2024-01-15 12:20:00',
    cover_art: '/demo-images/ghana-my-home.jpg',
    audio_file_mp3: '/demo-audio/ghana-my-home.mp3',
    release_date: '2023-11-15',
    plays: 22,
    title: 'Ghana My Home',
    playLogs: [
      { time: '2024-01-15 12:15:00', station: 'Hitz FM', region: 'Kumasi' },
      { time: '2024-01-15 10:45:00', station: 'Joy FM', region: 'Accra' },
    ]
  },
  {
    id: 3,
    track_title: 'Love Letter',
    artist_name: 'Sarkodie ft. Efya',
    start_time: '2024-01-15 10:45:00',
    stop_time: '2024-01-15 10:48:28',
    duration: '3:28',
    confidence: 94,
    earnings: 2.20,
    status: 'Flagged',
    comment: 'Potential duplicate detection',
    timestamp: '2024-01-15 10:50:00',
    cover_art: '/demo-images/love-letter.jpg',
    audio_file_mp3: '/demo-audio/love-letter.mp3',
    release_date: '2023-10-20',
    plays: 18,
    title: 'Love Letter',
    playLogs: [
      { time: '2024-01-15 10:45:00', station: 'Joy FM', region: 'Accra' },
      { time: '2024-01-15 09:20:00', station: 'Adom FM', region: 'Tema' },
    ]
  },
  {
    id: 4,
    track_title: 'Midnight Vibes',
    artist_name: 'Ghana Artists Collective',
    start_time: '2024-01-15 09:20:00',
    stop_time: '2024-01-15 09:23:45',
    duration: '3:45',
    confidence: 92,
    earnings: 2.50,
    status: 'Pending',
    comment: 'Under review by admin',
    timestamp: '2024-01-15 09:25:00',
    cover_art: '/demo-images/midnight-vibes.jpg',
    audio_file_mp3: '/demo-audio/midnight-vibes.mp3',
    release_date: '2023-12-01',
    plays: 15,
    title: 'Midnight Vibes',
    playLogs: [
      { time: '2024-01-15 09:20:00', station: 'Adom FM', region: 'Tema' },
      { time: '2024-01-15 08:10:00', station: 'Okay FM', region: 'Cape Coast' },
    ]
  },
  {
    id: 5,
    track_title: 'Ghana My Home',
    artist_name: 'Pat Thomas',
    start_time: '2024-01-15 08:10:00',
    stop_time: '2024-01-15 08:14:12',
    duration: '4:12',
    confidence: 89,
    earnings: 2.80,
    status: 'Dispute',
    comment: 'Artist disputes this match',
    timestamp: '2024-01-15 08:15:00',
    cover_art: '/demo-images/ghana-my-home.jpg',
    audio_file_mp3: '/demo-audio/ghana-my-home.mp3',
    release_date: '2023-11-15',
    plays: 22,
    title: 'Ghana My Home',
    playLogs: [
      { time: '2024-01-15 08:10:00', station: 'Okay FM', region: 'Cape Coast' },
    ]
  }
];

const AllDisputeMatches = () => {
  const [activeTab, setActiveTab] = useState('playlogs');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [search, setSearch] = useState('');
  const [disputes, setDisputes] = useState(demoDisputes);

  const statusColors = {
    excellent: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      accent: 'text-emerald-600 dark:text-emerald-400'
    },
    good: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      accent: 'text-blue-600 dark:text-blue-400'
    },
    average: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      accent: 'text-amber-600 dark:text-amber-400'
    },
    poor: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      accent: 'text-red-600 dark:text-red-400'
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return statusColors.excellent;
      case 'flagged':
        return statusColors.poor;
      case 'pending':
        return statusColors.average;
      case 'dispute':
        return statusColors.poor;
      default:
        return statusColors.average;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'dispute':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Match Disputes</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-2">
            Manage and resolve music identification disputes, review contested matches, and maintain accurate reporting.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search disputes..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all duration-200"
            />
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all duration-200"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all-time">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50/90 via-orange-50/80 to-pink-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-red-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-red-300 dark:hover:border-red-700/70 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Total Disputes</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                {disputes.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/60 dark:to-orange-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700/70 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Resolved</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                {disputes.filter(d => d.status === 'Resolved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/60 dark:to-green-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700/70 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Pending Review</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                {disputes.filter(d => d.status === 'Pending' || d.status === 'Flagged').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50/90 via-violet-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700/70 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-normal text-gray-700 dark:text-slate-300 leading-relaxed">Avg. Confidence</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                {Math.round(disputes.reduce((acc, d) => acc + d.confidence, 0) / disputes.length)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/60 dark:to-indigo-900/60 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Disputes Table */}
      <Card className="bg-gradient-to-br from-slate-50/90 via-gray-50/80 to-zinc-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-600/60 p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            All Match Disputes
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Showing {disputes.length} disputes</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-600">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Track Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Confidence & Earnings
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
              {disputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={dispute.cover_art}
                          alt={dispute.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {dispute.track_title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {dispute.artist_name}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {dispute.start_time} • {dispute.duration}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {dispute.confidence}% confidence
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ₵{dispute.earnings.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(dispute.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status).bg} ${getStatusColor(dispute.status).border} ${getStatusColor(dispute.status).text}`}>
                        {dispute.status || 'Pending'}
                      </span>
                    </div>
                    {dispute.comment && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {dispute.comment}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link to="/dashboard/match-dispute-details" state={{ dispute_id: dispute.id }}>
                      <button className={`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md transition-all duration-200 hover:scale-105 ${
                        dispute.status === 'Resolved'
                          ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50'
                          : 'text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50'
                      }`}>
                        {dispute.status === 'Resolved' ? 'View Details' : 'Review Dispute'}
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AllDisputeMatches;
