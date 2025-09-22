import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Search,
  Eye,
  Logs,
  Archive,
  RemoveFormattingIcon,
  Plus,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { baseUrl, baseUrlMedia, userToken } from '../../constants';
import Pagination from '../../components/Pagination';

const AllStationsPage = () => {
  const [activeTab, setActiveTab] = useState('playlogs');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const [filter, setFilter] = useState('all');
  const [stations, setStations] = useState<any[]>([]);
  const [linksByStation, setLinksByStation] = useState<Record<string, any[]>>({});

  const [search, setSearch] = useState('');
  const [orderStations, setOrderStations] = useState('');
  const [page, setPage] = useState(1);
  const [itemCount, setItemCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1); // Default to 1 to avoid issues
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || '',
  );

  useEffect(() => {
    // Clear the message after 5 seconds (optional)
    const timer = setTimeout(() => setSuccessMessage(''), 5000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}api/stations/get-all-stations/?search=${encodeURIComponent(
          search,
        )}&order_by=${encodeURIComponent(orderStations)}&page=${page}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${userToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setStations(data.data.stations);
      setTotalPages(data.data.pagination.total_pages);
      setItemCount(data.data.pagination.count);
      console.log('Total Pages:', data.data.pagination.total_pages);
      console.log('ppp:', data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, search, page, userToken, orderStations]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Resolve media URLs for images
  const mediaUrl = (u?: string | null) => {
    if (!u) return '';
    if ((u as string).startsWith('http')) return u as string;
    if ((u as string).startsWith('/')) return `${baseUrlMedia}${u}`;
    return `${baseUrlMedia}/${u}`;
  };

  // Load stream links for visible stations
  useEffect(() => {
    const loadLinks = async () => {
      const missing = stations.filter((s) => s?.station_id && !linksByStation[s.station_id]);
      for (const s of missing) {
        try {
          const res = await fetch(
            `${baseUrl}api/stations/get-station-stream-links/?station_id=${encodeURIComponent(s.station_id)}`,
            { headers: { 'Content-Type': 'application/json', Authorization: `Token ${userToken}` } }
          );
          if (!res.ok) continue;
          const payload = await res.json();
          setLinksByStation((prev) => ({ ...prev, [s.station_id]: payload?.data?.links || [] }));
        } catch {}
      }
    };
    if (stations?.length) loadLinks();
  }, [stations]);


  return (
    <div className="min-h-screen bg-gradient-to-br ">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Logs className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">All Stations</h1>
                <p className="text-gray-300 text-sm">
                  All stations in the database.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-white/10 backdrop-blur-md text-white pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Link to="/add-station">
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Station
                </button>
              </Link>
              <select
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 text-white border border-white/10 rounded px-3 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
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
            <div className="overflow-auto rounded-xl">
              <table className="min-w-full text-sm text-left text-gray-300 mb-4">
                <thead className="text-xs uppercase bg-white/5 text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Station ID</th>
                    <th className="px-4 py-3">Station</th>
                    <th className="px-4 py-3">Region</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Streams</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {stations.map((station) => (
                    <tr key={station.station_id}>
                      <td className="px-4 py-2">{station.station_id}</td>
                      <td className="px-4 py-2 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/10">
                            {station.photo ? (
                              <img src={mediaUrl(station.photo)} alt="Station" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-white/60">FM</div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{station.name}</div>
                            <div className="text-xs text-gray-400">{[station.city, station.country].filter(Boolean).join(', ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">{station.region}</td>

                      <td className="px-4 py-2">
                        <div>{station.created_at}</div>
                        <div className="text-[11px] text-cyan-300 truncate">
                          {(linksByStation[station.station_id] && linksByStation[station.station_id][0]?.link) ? (
                            <a href={linksByStation[station.station_id][0].link} target="_blank" rel="noreferrer">
                              {linksByStation[station.station_id][0].link}
                            </a>
                          ) : (
                            '—'
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-2 text-xs text-gray-300">—</td>

                      <td>
                        {' '}
                        <div className="flex">
                          <Link to={`/station-details?station_id=${station.station_id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                          </Link>

                          <Archive className="w-4 h-4 mr-2" />
                          <RemoveFormattingIcon className="w-4 h-4 mr-2" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                pagination={{
                  page_number: page,
                  total_pages: totalPages,
                  next: page < totalPages ? page + 1 : null,
                  previous: page > 1 ? page - 1 : null,
                }}
                setPage={setPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllStationsPage;
