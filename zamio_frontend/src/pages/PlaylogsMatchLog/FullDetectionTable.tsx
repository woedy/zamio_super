import { useState, useEffect, useCallback } from 'react';
import { Activity, Eye, Logs, Search } from 'lucide-react';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';

const MatchLogViewer = () => {
  const [activeTab, setActiveTab] = useState('playlogs');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const [search, setSearch] = useState('');

  // Playlogs state
  const [playLogs, setPlayLogs] = useState([]);
  const [playPage, setPlayPage] = useState(1);
  const [playTotalPages, setPlayTotalPages] = useState(1);

  // Matchlogs state
  const [matchLogs, setMatchLogs] = useState([]);
  const [matchPage, setMatchPage] = useState(1);
  const [matchTotalPages, setMatchTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const currentPage = activeTab === 'playlogs' ? playPage : matchPage;
    const logPageState = activeTab === 'playlogs' ? 'playlog' : 'matchlog';

    try {
      const response = await fetch(
        `${baseUrl}api/artists/playlogs/?search=${encodeURIComponent(
          search,
        )}&artist_id=${getArtistId()}&page=${currentPage}&log_page_state=${logPageState}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${userToken}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', result);
        return;
      }

      const data = result?.data || {};

      if (activeTab === 'playlogs') {
        setPlayLogs(Array.isArray(data.playLogs?.results) ? data.playLogs.results : []);
        setPlayTotalPages(data.playLogs?.pagination?.total_pages || 1);
      } else {
        setMatchLogs(Array.isArray(data.matchLogs?.results) ? data.matchLogs.results : []);
        setMatchTotalPages(data.matchLogs?.pagination?.total_pages || 1);
      }
      
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [search, playPage, matchPage, activeTab]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        isActive
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Optionally reset pagination per tab
    if (tab === 'playlogs') setPlayPage(1);
    else setMatchPage(1);
  };

  const currentLogs = activeTab === 'playlogs' ? playLogs : matchLogs;
  const currentPage = activeTab === 'playlogs' ? playPage : matchPage;
  const totalPages =
    activeTab === 'playlogs' ? playTotalPages : matchTotalPages;
  const setPage = activeTab === 'playlogs' ? setPlayPage : setMatchPage;

  return (
    <div className="min-h-screen bg-gradient-to-br">
      {/* Header */}
      <header className="bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Logs className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Full Detection view
                </h1>
                <p className="text-gray-300 text-sm">
                  All Matched songs detected and accumulated royalties
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-white/10 text-white pl-10 pr-4 py-2 rounded-lg border border-white/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex justify-between">
          <div className="flex space-x-2 mb-8 bg-white/10 p-1 rounded-lg border border-white/20 w-fit">
            <TabButton
              id="playlogs"
              label="Play Logs"
              icon={Activity}
              isActive={activeTab === 'playlogs'}
              onClick={handleTabChange}
            />
            <TabButton
              id="matchlogs"
              label="Match Logs"
              icon={Eye}
              isActive={activeTab === 'matchlogs'}
              onClick={handleTabChange}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20" aria-busy={loading}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            {activeTab === 'playlogs'
              ? 'Detailed Play Logs'
              : 'Detailed Match Logs'}
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin h-6 w-6 text-white mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-white">Loading logs...</span>
            </div>
          ) : (
            <>
              <div className="overflow-auto rounded-xl">
                <table className="min-w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase bg-white/5 text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Song</th>
                      <th className="px-4 py-3">Station</th>
                      <th className="px-4 py-3">Matched at</th>
                      {activeTab === 'playlogs' && (
                        <>
                          <th className="px-4 py-3">End Date & Time</th>
                          <th className="px-4 py-3">Duration</th>
                          <th className="px-4 py-3">Earnings</th>
                          <th className="px-4 py-3">Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white/5 divide-y divide-white/10">
                    {Array.isArray(currentLogs) && currentLogs.length > 0 ? (
                      currentLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-2 text-white">
                            <div className="flex items-center gap-2">
                              <span>{log.track_title || log.song}</span>
                              {log.attribution_source === 'Partner' && (
                                <span
                                  title={log.partner_name ? `Collected via ${log.partner_name} in Ghana` : 'Collected via Partner in Ghana'}
                                  className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-200 border border-yellow-400/40"
                                >
                                  {log.partner_name ? `Partner: ${log.partner_name}` : 'Partner'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {log.station_name || log.station}
                          </td>
                          <td className="px-4 py-2">
                          {log.matched_at
                                  ? `${log.matched_at}`
                                  : `${log.start_time}`}
                          </td>
                          {activeTab === 'playlogs' && (
                            <>
                              <td className="px-4 py-2">{log.stop_time || '-'}</td>
                              <td className="px-4 py-2">{log.duration || '-'}</td>
                              <td className="px-4 py-2 text-green-400 font-medium">
                                {log.royalty_amount
                                  ? `₵${log.royalty_amount}`
                                  : '₵0.00'}
                              </td>
                              <td className="px-4 py-2">{log.status || '-'}</td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={activeTab === 'playlogs' ? 7 : 3}
                          className="text-center text-white py-6"
                        >
                          No logs found for this view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="bg-white/10 text-white px-4 py-2 rounded disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-white px-2">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="bg-white/10 text-white px-4 py-2 rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchLogViewer;
