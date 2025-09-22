import { useState, useEffect, useCallback } from 'react';
import { Activity, Eye, Logs, Search } from 'lucide-react';
import { baseUrl, publisherID, userToken } from '../../constants';
import { useNavigate } from 'react-router-dom';

const MatchLogViewer = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'playlogs' | 'matchlogs'>('playlogs');
  const [search, setSearch] = useState('');

  // Playlogs state
  const [playLogs, setPlayLogs] = useState<any[]>([]);
  const [playPage, setPlayPage] = useState(1);
  const [playTotalPages, setPlayTotalPages] = useState(1);

  // Matchlogs state
  const [matchLogs, setMatchLogs] = useState<any[]>([]);
  const [matchPage, setMatchPage] = useState(1);
  const [matchTotalPages, setMatchTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  // Flag modal state
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagComment, setFlagComment] = useState('Flagged from Full Detection view');
  const [selectedPlaylogId, setSelectedPlaylogId] = useState<number | null>(null);
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const currentPage = activeTab === 'playlogs' ? playPage : matchPage;
    const logPageState = activeTab === 'playlogs' ? 'playlog' : 'matchlog';

    try {
      const response = await fetch(
        `${baseUrl}api/publishers/playlogs/?search=${encodeURIComponent(search)}&publisher_id=${publisherID}&page=${currentPage}&log_page_state=${logPageState}`,
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
        isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'playlogs') setPlayPage(1);
    else setMatchPage(1);
  };

  const currentLogs = activeTab === 'playlogs' ? playLogs : matchLogs;
  const currentPage = activeTab === 'playlogs' ? playPage : matchPage;
  const totalPages = activeTab === 'playlogs' ? playTotalPages : matchTotalPages;
  const setPage = activeTab === 'playlogs' ? setPlayPage : setMatchPage;

  const openFlagModal = (playlogId: number) => {
    setSelectedPlaylogId(playlogId);
    setFlagError(null);
    setShowFlagModal(true);
  };

  const submitFlag = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPlaylogId) return;
    setFlagSubmitting(true);
    setFlagError(null);
    try {
      const form = new FormData();
      form.append('playlog_id', String(selectedPlaylogId));
      form.append('comment', flagComment || 'Flagged from Full Detection view');
      const resp = await fetch(`${baseUrl}api/music-monitor/flag-playlog/`, {
        method: 'POST',
        headers: { Authorization: `Token ${userToken}` },
        body: form,
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.message || 'Failed to flag');
      const disputeId = json?.data?.id;
      setShowFlagModal(false);
      if (disputeId) {
        navigate({ pathname: '/dispute-details', search: `?dispute_id=${disputeId}` }, { state: { dispute_id: disputeId } });
      }
    } catch (err: any) {
      setFlagError(err?.message || 'Failed to flag');
    } finally {
      setFlagSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Logs className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Full Detection view</h1>
                <p className="text-gray-300 text-sm">All Matched songs detected and accumulated royalties</p>
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
            <TabButton id="playlogs" label="Play Logs" icon={Activity} isActive={activeTab === 'playlogs'} onClick={handleTabChange} />
            <TabButton id="matchlogs" label="Match Logs" icon={Eye} isActive={activeTab === 'matchlogs'} onClick={handleTabChange} />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            {activeTab === 'playlogs' ? 'Detailed Play Logs' : 'Detailed Match Logs'}
          </h2>

          <div className="overflow-auto rounded-xl">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-white/5 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Song</th>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Matched at</th>
                  {activeTab === 'playlogs' ? (
                    <>
                      <th className="px-4 py-3">End Date & Time</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Avg. Confidence</th>
                      <th className="px-4 py-3">Earnings</th>
                      <th className="px-4 py-3">Status</th>
                    </>
                  ) : (
                    <th className="px-4 py-3">Confidence</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/10">
                {Array.isArray(currentLogs) && currentLogs.length > 0 ? (
                  currentLogs.map((log: any) => (
                    <tr
                      key={log.id}
                      className={activeTab === 'playlogs' ? 'hover:bg-white/10 cursor-pointer' : ''}
                      onClick={() => {
                        if (activeTab === 'playlogs') openFlagModal(log.id);
                      }}
                    >
                      <td className="px-4 py-2 text-white">{log.track_title || log.song}</td>
                      <td className="px-4 py-2">{log.station_name || log.station}</td>
                      <td className="px-4 py-2">{log.matched_at ? `${log.matched_at}` : `${log.start_time}`}</td>
                      {activeTab === 'playlogs' ? (
                        <>
                          <td className="px-4 py-2">{log.stop_time || '-'}</td>
                          <td className="px-4 py-2">{log.duration || '-'}</td>
                          <td className="px-4 py-2">{log.avg_confidence_score ? `${log.avg_confidence_score}%` : '-'}</td>
                          <td className="px-4 py-2 text-green-400 font-medium">
                            {typeof log.royalty_amount === 'number' ? `₵${log.royalty_amount.toFixed(2)}` : (log.royalty_amount ? `₵${log.royalty_amount}` : '₵0.00')}
                          </td>
                          <td className="px-4 py-2">
                            {(log.status || '').trim() ? (
                              <span className={
                                log.status === 'Flagged'
                                  ? 'px-2 py-1 rounded text-red-300 bg-red-500/10 border border-red-500/30'
                                  : log.status === 'Resolved'
                                  ? 'px-2 py-1 rounded text-green-300 bg-green-500/10 border border-green-500/30'
                                  : 'px-2 py-1 rounded text-gray-300 bg-white/5 border border-white/10'
                              }>
                                {log.status}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-2">{log.avg_confidence_score ? `${log.avg_confidence_score}%` : '-'}</td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'playlogs' ? 8 : 4} className="text-center text-white py-6">No logs found for this view.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-4 space-x-2">
            <button disabled={currentPage <= 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))} className="bg-white/10 text-white px-4 py-2 rounded disabled:opacity-40">Prev</button>
            <span className="text-white px-2">{`Page ${currentPage} of ${totalPages}`}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} className="bg-white/10 text-white px-4 py-2 rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {/* Flag modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-white text-lg font-semibold mb-2">Flag play for dispute</h3>
            <p className="text-gray-300 mb-4">Add a brief note to explain why you are flagging this play. You can provide more details on the next screen.</p>
            {flagError && <div className="mb-3 bg-red-500/10 border border-red-500/40 text-red-200 px-3 py-2 rounded">{flagError}</div>}
            <form onSubmit={submitFlag}>
              <textarea value={flagComment} onChange={(e)=>setFlagComment(e.target.value)} rows={3} className="w-full bg-white/10 text-white p-3 rounded border border-white/20" placeholder="Reason for dispute..." />
              <div className="flex items-center justify-end gap-2 mt-4">
                <button type="button" onClick={()=>setShowFlagModal(false)} className="px-4 py-2 bg-white/10 text-white rounded border border-white/20">Cancel</button>
                <button type="submit" disabled={flagSubmitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                  {flagSubmitting ? 'Flagging…' : 'Flag and Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchLogViewer;