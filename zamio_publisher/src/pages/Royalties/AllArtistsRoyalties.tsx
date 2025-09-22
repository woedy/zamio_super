import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Search, Logs, ChevronLeft, ChevronRight } from 'lucide-react';
import { baseUrl, publisherID, userToken } from '../../constants';
import { useNavigate } from 'react-router-dom';

type ArtistRow = {
  artist_id: string;
  stage_name: string | null;
  photo: string | null;
  radioPlays: number;
  streamPlays: number;
  totalPlays: number;
  radioRoyalties: number;
  streamingRoyalties: number;
  totalRoyalties: number;
  lastPlayedAt: string | null;
};

const PAGE_SIZE = 10;

const AllArtistsRoyalties = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState<'Royalties' | 'Plays' | 'Name'>('Royalties');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ArtistRow[]>([]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('page_size', String(PAGE_SIZE));
    p.set('order_by', orderBy);
    if (publisherID) p.set('publisher_id', String(publisherID));
    if (search.trim()) p.set('search', search.trim());
    if (dateFrom) p.set('date_from', dateFrom);
    if (dateTo) p.set('date_to', dateTo);
    return p.toString();
  }, [page, orderBy, search, dateFrom, dateTo]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${baseUrl}api/publishers/royalties/artists/?${query}`;
      const resp = await fetch(url, { headers: { Authorization: `Token ${userToken}` } });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.message || 'Failed to load');
      const data = json.data;
      setRows(data.artists);
      setTotalPages(data.pagination.total_pages);
      setCount(data.pagination.count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = (artist_id: string) => {
    navigate(`/artist-royalties/${artist_id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Logs className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">All Artist Royalties</h1>
                <p className="text-gray-300 text-sm">All your managed artists royalties</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                  type="text"
                  placeholder="Search artist..."
                  className="bg-white/10 backdrop-blur-md text-white pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value as any)}
                className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20"
              >
                <option value="Royalties">Sort: Royalties</option>
                <option value="Plays">Sort: Plays</option>
                <option value="Name">Sort: Name</option>
              </select>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" /> Managed Artists
          </h2>
          <div className="overflow-auto rounded-xl">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-white/5 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Artist</th>
                  <th className="px-4 py-3">Radio Plays</th>
                  <th className="px-4 py-3">Streaming Plays</th>
                  <th className="px-4 py-3">Total Royalties</th>
                  <th className="px-4 py-3">Last Played</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/10">
                {loading ? (
                  <tr><td className="px-4 py-3" colSpan={6}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td className="px-4 py-3" colSpan={6}>No artists found</td></tr>
                ) : rows.map((r) => (
                  <tr key={r.artist_id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.photo ? (
                          <img src={r.photo} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-500" />
                        )}
                        <div className="text-white">{r.stage_name || '—'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{r.radioPlays}</td>
                    <td className="px-4 py-3">{r.streamPlays}</td>
                    <td className="px-4 py-3 text-green-400 font-medium">GHS {r.totalRoyalties.toFixed(2)}</td>
                    <td className="px-4 py-3">{r.lastPlayedAt ? new Date(r.lastPlayedAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(r.artist_id)} className="text-xs bg-blue-600 text-white px-3 py-2 rounded-md font-semibold hover:shadow-lg">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-white">
            <div>Total: {count}</div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="disabled:opacity-50 p-2 bg-white/10 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="disabled:opacity-50 p-2 bg-white/10 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllArtistsRoyalties;

