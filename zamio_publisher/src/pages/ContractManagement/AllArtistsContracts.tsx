import { useCallback, useEffect, useState } from 'react';
import { Activity, Search, FileText, Plus } from 'lucide-react';
import { baseUrl, publisherID, userToken } from '../../constants';
import { Link } from 'react-router-dom';

type ContractRow = {
  id: number;
  track: number;
  track_title: string;
  songwriter: number;
  artist_name: string;
  publisher_share: number;
  writer_share: number;
  status: string;
  verified_by_admin: boolean;
  agreement_date: string; // ISO
  contract_file?: string | null;
};

const AllArtistsContracts = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ContractRow[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${baseUrl}api/publishers/all-contracts/?search=${encodeURIComponent(search)}&publisher_id=${encodeURIComponent(String(publisherID || ''))}&page=${page}`;
      const resp = await fetch(url, { headers: { 'Content-Type': 'application/json', Authorization: `Token ${userToken}` } });
      const json = await resp.json();
      if (!resp.ok) {
        const msg = json?.errors ? (Object.values(json.errors).flat() as string[]).join('\n') : json?.message || 'Failed to load';
        throw new Error(msg);
      }
      setRows(json?.data?.artists_contracts || []);
      const pag = json?.data?.pagination || {};
      setTotalPages(pag?.total_pages || 1);
      setCount(pag?.count || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Artist Contracts</h1>
                <p className="text-gray-300 text-sm">All agreements between you and your roster</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by artist, track or status..."
                  className="bg-white/10 text-white pl-10 pr-4 py-2 rounded-lg border border-white/20"
                  value={search}
                  onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                />
              </div>
              <Link to="/add-contract" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                <Plus className="w-4 h-4" /> New Contract
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-6 py-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" /> Contracts
          </h2>

          {error && (
            <div className="mb-3 bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-2 rounded">{error}</div>
          )}

          <div className="overflow-auto rounded-xl">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-white/5 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Artist</th>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Writer Share</th>
                  <th className="px-4 py-3">Publisher Share</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Agreement Date</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/10">
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-2 text-white">{c.artist_name}</td>
                    <td className="px-4 py-2">{c.track_title}</td>
                    <td className="px-4 py-2">{(c.writer_share ?? 0).toFixed ? (c.writer_share as any).toFixed(2) : c.writer_share}%</td>
                    <td className="px-4 py-2">{(c.publisher_share ?? 0).toFixed ? (c.publisher_share as any).toFixed(2) : c.publisher_share}%</td>
                    <td className="px-4 py-2">{c.verified_by_admin ? <span className="px-2 py-1 rounded text-green-300 bg-green-500/10 border border-green-500/30">Yes</span> : <span className="px-2 py-1 rounded text-yellow-300 bg-yellow-500/10 border border-yellow-500/30">Pending</span>}</td>
                    <td className="px-4 py-2">{c.status}</td>
                    <td className="px-4 py-2">{c.agreement_date}</td>
                    <td className="px-4 py-2">
                      <Link to="/contract-details" state={{ contract_id: c.id }} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-sm font-semibold">View</Link>
                    </td>
                  </tr>
                ))}
                {!rows.length && !loading && (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 px-4 py-6">No contracts found.</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 px-4 py-6">Loading…</td>
                  </tr>
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
    </div>
  );
};

export default AllArtistsContracts;