import { useCallback, useEffect, useState } from 'react';
import { baseUrl, publisherID, userToken } from '../../constants';
import { Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type DisputeRow = {
  id: number;
  track_title: string;
  artist_name: string;
  station_name: string;
  station_region?: string | null;
  played_at?: string | null;
  confidence: number;
  royalty: number;
  dispute_status?: string | null;
  comment?: string | null;
  age?: string | null;
  flagged: boolean;
};

const DisputesList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [station, setStation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minConf, setMinConf] = useState('');
  const [orderBy, setOrderBy] = useState('Newest');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<DisputeRow[]>([]);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (publisherID) params.set('publisher_id', String(publisherID));
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (station) params.set('station', station);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      if (minConf) params.set('min_confidence', minConf);
      if (orderBy) params.set('order_by', orderBy);
      params.set('page', String(page));

      const url = `${baseUrl}api/publishers/disputes/?${params.toString()}`;
      const resp = await fetch(url, { headers: { Authorization: `Token ${userToken}` } });
      const json = await resp.json();
      if (!resp.ok) {
        const msg = json?.errors ? (Object.values(json.errors).flat() as string[]).join('\n') : json?.message || 'Failed to load';
        throw new Error(msg);
      }
      setRows(json?.data?.disputes || []);
      const pag = json?.data?.pagination || {};
      setCount(pag?.count || 0);
      setTotalPages(pag?.total_pages || 1);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [search, status, station, dateFrom, dateTo, minConf, orderBy, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Match Disputes</h1>
          <div className="text-gray-300 text-sm">Total: <span className="text-white font-semibold">{count}</span></div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e)=>{setPage(1);setSearch(e.target.value);}} placeholder="Search track/artist/station" className="w-full bg-white/10 text-white pl-9 pr-3 py-2 rounded border border-white/20" />
          </div>
          <select value={status} onChange={(e)=>{setPage(1);setStatus(e.target.value);}} className="bg-white/10 text-white px-3 py-2 rounded border border-white/20">
            <option value="">All Status</option>
            {['Flagged','Pending','Verified','Resolving','Review','Resolved'].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={station} onChange={(e)=>{setPage(1);setStation(e.target.value);}} placeholder="Station" className="bg-white/10 text-white px-3 py-2 rounded border border-white/20" />
          <input type="date" value={dateFrom} onChange={(e)=>{setPage(1);setDateFrom(e.target.value);}} className="bg-white/10 text-white px-3 py-2 rounded border border-white/20" />
          <input type="date" value={dateTo} onChange={(e)=>{setPage(1);setDateTo(e.target.value);}} className="bg-white/10 text-white px-3 py-2 rounded border border-white/20" />
          <input type="number" step="0.01" value={minConf} onChange={(e)=>{setPage(1);setMinConf(e.target.value);}} placeholder="Min confidence" className="bg-white/10 text-white px-3 py-2 rounded border border-white/20" />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <select value={orderBy} onChange={(e)=>{setPage(1);setOrderBy(e.target.value);}} className="bg-white/10 text-white px-3 py-2 rounded border border-white/20">
            {['Newest','Oldest','Confidence','Royalty'].map(o=> <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {error && <div className="mb-3 bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-2 rounded">{error}</div>}

        <div className="bg-white/10 rounded-2xl border border-white/20 overflow-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-gray-400">
              <tr>
                <th className="px-4 py-3">Track</th>
                <th className="px-4 py-3">Artist</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Played</th>
                <th className="px-4 py-3">Conf.</th>
                <th className="px-4 py-3">Royalty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {rows.map(r => (
                <tr key={r.id} onClick={() => navigate('/dispute-details', { state: { dispute_id: r.id } })} className="cursor-pointer hover:bg-white/10">
                  <td className="px-4 py-2 text-white">{r.track_title}</td>
                  <td className="px-4 py-2">{r.artist_name}</td>
                  <td className="px-4 py-2">{r.station_name}{r.station_region ? ` • ${r.station_region}`: ''}</td>
                  <td className="px-4 py-2">{r.played_at ? new Date(r.played_at).toLocaleString() : '—'}</td>
                  <td className="px-4 py-2">{r.confidence}%</td>
                  <td className="px-4 py-2 text-green-400">₵{(r.royalty || 0).toFixed(2)}</td>
                  <td className="px-4 py-2">{r.dispute_status || (r.flagged ? 'Flagged' : '')}</td>
                  <td className="px-4 py-2">{r.age || '—'}</td>
                  <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                    <Link to={{ pathname: '/dispute-details', search: `?dispute_id=${r.id}` }} state={{ dispute_id: r.id }} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-sm font-semibold">Review</Link>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && (
                <tr><td className="px-4 py-6 text-center text-gray-400" colSpan={9}>No disputes found.</td></tr>
              )}
              {loading && (
                <tr><td className="px-4 py-6 text-center text-gray-400" colSpan={9}>Loading...</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-gray-300 text-sm">Total: <span className="text-white font-medium">{count}</span></div>
          <div className="flex items-center gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40">Prev</button>
            <span className="text-gray-300 text-sm">Page <span className="text-white">{page}</span> / <span className="text-white">{totalPages}</span></span>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputesList;