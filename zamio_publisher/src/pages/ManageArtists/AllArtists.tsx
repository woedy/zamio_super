import { useCallback, useEffect, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { baseUrl, publisherID, userToken } from '../../constants';
import { Link } from 'react-router-dom';

type ArtistItem = {
  artist_id: string;
  stage_name: string;
  total_earnings?: string | null;
  photo?: string | null;
  registered_on?: string | null;
};

const AllArtists = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [itemCount, setItemCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [artists, setArtists] = useState<ArtistItem[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${baseUrl}api/publishers/all-managed-artists/?search=${encodeURIComponent(search)}&publisher_id=${encodeURIComponent(String(publisherID || ''))}&page=${page}`;
      const resp = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${userToken}`,
        },
      });

      const json = await resp.json();
      if (!resp.ok) {
        const msg = json?.errors ? (Object.values(json.errors).flat() as string[]).join('\n') : json?.message || 'Failed to load';
        throw new Error(msg);
      }

      setArtists(json?.data?.artists || []);
      const pag = json?.data?.pagination || {};
      setTotalPages(pag?.total_pages || 1);
      setItemCount(pag?.count || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return String(iso);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">All Artists</h1>
                <p className="text-gray-300 text-sm">All your managed artists on portfolio</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or bio..."
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  className="bg-white/10 backdrop-blur-md text-white pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-between">
          {/* Period Selector */}
          <div className="mb-8">
            <div className="flex space-x-2 bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20 w-fit">
              {['daily', 'weekly', 'monthly', 'all-time'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Managed Artists
            </h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">{error}</div>
            )}

            <div className="overflow-auto rounded-xl">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-white/5 text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Artist</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3">Total Earnings</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {!loading && artists.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-400" colSpan={4}>
                        No managed artists found.
                      </td>
                    </tr>
                  )}

                  {artists.map((a) => (
                    <tr key={a.artist_id}>
                      <td className="px-4 py-3 flex items-center gap-3">
                        {a.photo ? (
                          <img
                            src={a.photo}
                            alt={a.stage_name}
                            className="w-10 h-10 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20" />
                        )}
                        <span className="text-white font-medium">{a.stage_name}</span>
                      </td>
                      <td className="px-4 py-3">{formatDate(a.registered_on)}</td>
                      <td className="px-4 py-3 text-green-400 font-medium">
                        ₵{(a.total_earnings ? Number(a.total_earnings) : 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to="/artist-details"
                          state={{ artist_id: a.artist_id }}
                          className="inline-block text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-sm font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {loading && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-400" colSpan={4}>
                        Loading...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-300 text-sm">
                Total: <span className="text-white font-medium">{itemCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-gray-300 text-sm">
                  Page <span className="text-white">{page}</span> / <span className="text-white">{totalPages}</span>
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded bg-white/10 text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllArtists;
