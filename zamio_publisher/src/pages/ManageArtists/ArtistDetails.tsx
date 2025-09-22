import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Activity,
  Users,
  Radio,
  DollarSign,
  MapPin,
  Verified,
  Music,
} from 'lucide-react';
import { baseUrl, baseUrlMedia, userToken } from '../../constants';

// Types aligned to backend publishers/managed-artist-details payload
type ArtistData = {
  name: string;
  stageName: string;
  bio?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
  verified: boolean;
  followers: number;
  totalPlays: number;
  totalEarnings: number;
  joinDate: string; // ISO date
  location?: string | null;
  genres?: string[];
  contact?: {
    email?: string | null;
    phone?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    facebook?: string | null;
  };
};

type Song = {
  id: number;
  title: string;
  duration?: string | null;
  releaseDate?: string | null;
  totalPlays: number;
  totalEarnings: number;
  status: string; // Active/Inactive
  album?: string | null;
  genre?: string | null;
  contributors?: { name: string; role: string; percentage: number }[];
  recentPlays?: { station: string; date: string; plays: number; earnings: number }[];
};

type RoyaltyItem = {
  date: string; // YYYY-MM-DD
  amount: number;
  source: string; // Radio Airplay / Streaming
  status: string; // Paid/Pending
};

type PlayLog = {
  id: number;
  song: string;
  station: string;
  date: string; // YYYY-MM-DD HH:mm
  duration?: string | null;
  confidence: number;
  earnings: number;
};

const ArtistDetails = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const stateArtistId = (location.state as any)?.artist_id as string | undefined;
  const qpArtistId = params.get('artist_id') || undefined;
  const artistId = stateArtistId || qpArtistId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'royalty' | 'plays'>('catalog');

  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [royaltyHistory, setRoyaltyHistory] = useState<RoyaltyItem[]>([]);
  const [playLogs, setPlayLogs] = useState<PlayLog[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (!artistId) {
        setError('Missing artist_id');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const url = `${baseUrl}api/publishers/managed-artist-details/?artist_id=${encodeURIComponent(
          String(artistId),
        )}`;
        const resp = await fetch(url, {
          headers: { 'Content-Type': 'application/json', Authorization: `Token ${userToken}` },
        });
        const json = await resp.json();
        if (!resp.ok) {
          const msg = json?.errors ? (Object.values(json.errors).flat() as string[]).join('\n') : json?.message || 'Failed to load';
          throw new Error(msg);
        }
        if (cancelled) return;
        setArtistData(json?.data?.artistData || null);
        setSongs(json?.data?.songs || []);
        setRoyaltyHistory(json?.data?.royaltyHistory || []);
        setPlayLogs(json?.data?.playLogs || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [artistId]);

  const totalCatalogPlays = useMemo(() => songs.reduce((a, s) => a + (s.totalPlays || 0), 0), [songs]);
  const totalCatalogEarnings = useMemo(() => songs.reduce((a, s) => a + (s.totalEarnings || 0), 0), [songs]);

  const avatarUrl = artistData?.avatar ? (artistData.avatar.startsWith('http') ? artistData.avatar : `${baseUrlMedia}${artistData.avatar}`) : '';

  const TabButton = ({ id, label }: { id: 'catalog' | 'royalty' | 'plays'; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
        activeTab === id
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{artistData?.name || 'Artist'}</h1>
                <p className="text-gray-300 text-sm">Artist Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Link to="/all-artists" className="bg-white/10 px-3 py-2 rounded border border-white/20 text-white hover:bg-white/20">
                Back to Artists
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={artistData?.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-white/10 border-4 border-white/20" />
                )}
                {artistData?.verified && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 p-1 rounded-full">
                    <Verified className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{artistData?.name}</h1>
                  {artistData?.stageName && (
                    <span className="text-lg text-gray-300">({artistData.stageName})</span>
                  )}
                </div>
                {artistData?.bio && <p className="text-gray-300 mb-3 max-w-2xl">{artistData.bio}</p>}
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{artistData?.location || '—'}</span>
                  </div>
                  <span>•</span>
                  <span>Joined {artistData?.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-300">Total Plays</div>
                  <div className="text-2xl font-bold text-white">{artistData?.totalPlays?.toLocaleString?.() || 0}</div>
                </div>
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-300">Total Earnings</div>
                  <div className="text-2xl font-bold text-green-400">₵{(artistData?.totalEarnings || 0).toFixed(2)}</div>
                </div>
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-300">Followers</div>
                  <div className="text-2xl font-bold text-white">{artistData?.followers || 0}</div>
                </div>
                <Users className="w-6 h-6 text-pink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20 w-fit">
            <TabButton id="catalog" label="Catalog" />
            <TabButton id="royalty" label="Royalty History" />
            <TabButton id="plays" label="Recent Plays" />
          </div>
        </div>

        {/* Tab Panels */}
        {activeTab === 'catalog' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Music className="w-5 h-5 mr-2 text-purple-400" /> Catalog
              </h2>
            </div>
            <div className="overflow-auto rounded-xl">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-white/5 text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Album</th>
                    <th className="px-4 py-3">Genre</th>
                    <th className="px-4 py-3">Release</th>
                    <th className="px-4 py-3">Plays</th>
                    <th className="px-4 py-3">Earnings</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {songs.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2 text-white">{s.title}</td>
                      <td className="px-4 py-2">{s.album || '—'}</td>
                      <td className="px-4 py-2">{s.genre || '—'}</td>
                      <td className="px-4 py-2">{s.releaseDate || '—'}</td>
                      <td className="px-4 py-2">{(s.totalPlays || 0).toLocaleString()}</td>
                      <td className="px-4 py-2 text-green-400">₵{(s.totalEarnings || 0).toFixed(2)}</td>
                      <td className="px-4 py-2">{s.status}</td>
                    </tr>
                  ))}
                  {!songs.length && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-400" colSpan={7}>No catalog yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'royalty' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-400" /> Royalty History
            </h2>
            <div className="overflow-auto rounded-xl">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-white/5 text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {royaltyHistory.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">{r.date}</td>
                      <td className="px-4 py-2 text-green-400">₵{(r.amount || 0).toFixed(2)}</td>
                      <td className="px-4 py-2">{r.source}</td>
                      <td className="px-4 py-2">{r.status}</td>
                    </tr>
                  ))}
                  {!royaltyHistory.length && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-400" colSpan={4}>No royalty entries.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'plays' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Radio className="w-5 h-5 mr-2 text-yellow-400" /> Recent Plays
            </h2>
            <div className="overflow-auto rounded-xl">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-white/5 text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Song</th>
                    <th className="px-4 py-3">Station</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Earnings</th>
                  </tr>
                </thead>
                <tbody className="bg-white/5 divide-y divide-white/10">
                  {playLogs.map((pl) => (
                    <tr key={pl.id}>
                      <td className="px-4 py-2 text-white">{pl.song}</td>
                      <td className="px-4 py-2">{pl.station}</td>
                      <td className="px-4 py-2">{pl.date}</td>
                      <td className="px-4 py-2">{pl.confidence}%</td>
                      <td className="px-4 py-2 text-green-400">₵{(pl.earnings || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {!playLogs.length && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-400" colSpan={5}>No recent plays.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded shadow">{error}</div>
      )}
    </div>
  );
};

export default ArtistDetails;
