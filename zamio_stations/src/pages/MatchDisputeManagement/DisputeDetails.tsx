import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@zamio/ui';
import { Clock, BarChart3, Calendar, MapPin, Music, Play, Pause, Volume2, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

export default function DisputeDetails() {
  const [loading, setLoading] = useState(false);
  const [dispute, setDispute] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToReview, setItemToReview] = useState(null);
  const [comment, setComment] = useState("");
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [inputError, setInputError] = useState('');

  const location = useLocation();
  const { dispute_id } = location.state || {};

  // Audio Player
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

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
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRangeChange = (e) => {
    const time = e.target.value;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    // Load dispute data from demo data
    const selectedDispute = demoDisputes.find(d => d.id === dispute_id);
    if (selectedDispute) {
      setDispute(selectedDispute);
      setAudioUrl(selectedDispute.audio_file_mp3);
    }
  }, [dispute_id]);

  const handleReview = async (itemId) => {
    if (comment === '') {
      setInputError('Your comment is required.');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setAlert({ message: 'Dispute marked as resolved', type: 'success' });
      setIsModalOpen(false);
      setItemToReview(null);

      // Update dispute status in demo data
      const updatedDisputes = demoDisputes.map(d =>
        d.id === itemId ? { ...d, status: 'Resolved' } : d
      );
      // In a real app, you'd update the state properly here
    }, 1000);
  };

  const openReviewModal = (itemId) => {
    setItemToReview(itemId);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setItemToReview(null);
  };

  const closeAlert = () => {
    setAlert({ message: '', type: '' });
  };

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

  // Simple Review Modal
  const ReviewModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Review Dispute</h3>
            <button
              onClick={closeReviewModal}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You are about to review this music identification dispute. Please provide your assessment and comments.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Comment <span className="text-red-500">*</span>
              </label>
              {inputError && (
                <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{inputError}</p>
                </div>
              )}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your review comments..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleReview(itemToReview)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Resolve Dispute
              </button>
              <button
                onClick={closeReviewModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dispute Details</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-2">
            Review and resolve music identification disputes with detailed analysis.
          </p>
        </div>
        <Link to="/dashboard/match-disputes">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200">
            ← Back to Disputes
          </button>
        </Link>
      </div>

      {/* Alert */}
      {alert.message && (
        <Card className={`p-4 ${alert.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {alert.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              )}
              <p className={`text-sm font-medium ${alert.type === 'success' ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
                {alert.message}
              </p>
            </div>
            <button onClick={closeAlert} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              ×
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Track Information */}
          <Card className="bg-gradient-to-br from-slate-50/90 via-gray-50/80 to-zinc-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-600/60 p-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <img
                  src={dispute?.cover_art}
                  alt={dispute.title}
                  className="w-32 h-32 object-cover rounded-xl shadow-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {dispute.title}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                      {dispute.artist_name}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{dispute.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{dispute.release_date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{dispute.plays} plays</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{dispute.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(dispute?.status).bg} ${getStatusColor(dispute?.status).border} ${getStatusColor(dispute?.status).text}`}>
                      {dispute?.status === 'Resolved' ? (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      ) : dispute?.status === 'Flagged' ? (
                        <AlertTriangle className="w-4 h-4 mr-1" />
                      ) : (
                        <Clock className="w-4 h-4 mr-1" />
                      )}
                      {dispute?.status || 'Pending'}
                    </div>

                    {dispute?.status !== 'Resolved' && (
                      <button
                        onClick={() => openReviewModal(dispute.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105"
                      >
                        Review Dispute
                      </button>
                    )}
                  </div>
                </div>

                {dispute.comment && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Comment:</span> {dispute.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Audio Player */}
          <Card className="bg-gradient-to-br from-blue-50/90 via-cyan-50/80 to-indigo-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-slate-600/60 p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center">
                <Music className="w-5 h-5 mr-2 text-blue-500" />
                Audio Preview
              </h3>

              {audioUrl ? (
                <div className="space-y-6">
                  <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />

                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Loading audio preview...</p>
                </div>
              )}
            </div>
          </Card>

          {/* Analysis Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Waveform Analysis */}
            <Card className="bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-slate-600/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" />
                Audio Waveform
              </h3>
              <div className="h-32 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center space-x-1 mb-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                      <div key={i} className="w-2 h-8 bg-emerald-400 rounded" style={{height: `${Math.random() * 32 + 8}px`}}></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Audio waveform visualization</p>
                </div>
              </div>
            </Card>

            {/* Spectrum Analysis */}
            <Card className="bg-gradient-to-br from-purple-50/90 via-pink-50/80 to-rose-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-slate-600/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                Frequency Spectrum
              </h3>
              <div className="h-32 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center space-x-2 mb-2">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                      <div key={i} className={`w-1 h-16 rounded ${Math.random() > 0.7 ? 'bg-red-400' : 'bg-purple-400'}`} style={{height: `${Math.random() * 64 + 8}px`}}></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Frequency spectrum analysis</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Play Logs */}
          <Card className="bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-200/50 dark:border-slate-600/60 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
              Play History
            </h3>
            <div className="space-y-3">
              {dispute?.playLogs?.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {log.station}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.time).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {log.region}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Dispute Stats */}
          <Card className="bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/50 dark:border-slate-600/60 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-amber-500" />
              Dispute Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Confidence Score</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{dispute.confidence}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Earnings</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">₵{dispute.earnings?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Play Duration</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{dispute.duration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Plays</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{dispute.plays}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal />
    </div>
  );
}
