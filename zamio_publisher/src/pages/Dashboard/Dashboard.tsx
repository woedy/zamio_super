import { useEffect, useMemo, useState } from 'react';
import {
  Music,
  TrendingUp,
  MapPin,
  Users,
  Settings,
  Bell,
  Search,
  PieChart,
  Globe,
  Radio,
  Eye,
  DollarSign,
  Download,
  Share2,
  Headphones,
  Mic,
  Award,
  Smartphone,
} from 'lucide-react';
import { publisherID } from '../../constants';
import api from '../../lib/api';
  import type {
    ApiEnvelope,
    PublisherDashboardData,
    PlaysOverTimePoint,
    GhanaRegionBreakdownItem,
    StationBreakdownItem,
    RecentPlay,
    Pipeline,
    Splits,
    TopSong,
  } from '../../types/dashboard';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const [totalPlays, setTotalPlays] = useState<number>(0);
  const [publisherName, setPublisherName] = useState<string>('');
  const [totalStations, setTotalStations] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [streamingPlays, setStreamingPlays] = useState<number>(0);
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
  const [playsOverTime, setPlaysOverTime] = useState<PlaysOverTimePoint[]>([]);
  const [stationBreakdown, setStationBreakdown] = useState<StationBreakdownItem[]>([]);
  const [ghanaRegions, setGhanaRegions] = useState<GhanaRegionBreakdownItem[]>([]);
  const [worksCount, setWorksCount] = useState<number>(0);
  const [writersCount, setWritersCount] = useState<number>(0);
  const [agreementsCount, setAgreementsCount] = useState<number>(0);
  const [recentPlays, setRecentPlays] = useState<RecentPlay[]>([]);
  const [pipeline, setPipeline] = useState<Pipeline>({ accrued: 0, unclaimedCount: 0, disputesCount: 0 });
  const [splits, setSplits] = useState<Splits>({ publisher: 0, writers: 0 });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);




  const maxPlays = useMemo(() => {
    const vals = playsOverTime.flatMap((d) => [d.airplay, d.streaming]);
    return vals.length ? Math.max(...vals) : 1;
  }, [playsOverTime]);

  const maxRegionalPlays = useMemo(() => {
    return ghanaRegions.length ? Math.max(...ghanaRegions.map((r) => r.plays)) : 1;
  }, [ghanaRegions]);

  const getRegionColors = (index) => {
    const colors = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-blue-500',
      'from-yellow-500 to-green-500',
      'from-orange-500 to-yellow-500',
      'from-red-500 to-orange-500',
      'from-purple-500 to-pink-500',
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (!publisherID) {
        setError('Missing publisher ID');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<ApiEnvelope<PublisherDashboardData>>(
          'api/publishers/dashboard/',
          { params: { publisher_id: publisherID, period: selectedPeriod } }
        );
        if (cancelled) return;
        const d = data.data;
        setPublisherName(d.publisherName || '');
        setTotalPlays(d.totalPlays);
        setTotalStations(d.totalStations);
        setTotalEarnings(d.totalEarnings);
        setStreamingPlays(d.streamingPlays);
        setTopSongs(d.topSongs || []);
        setPlaysOverTime(d.playsOverTime || []);
        setGhanaRegions(d.ghanaRegions || []);
        setStationBreakdown(d.stationBreakdown || []);
        setWorksCount(d.worksCount || 0);
        setWritersCount(d.writersCount || 0);
        setAgreementsCount(d.agreementsCount || 0);
        setRecentPlays(d.recentPlays || []);
        setPipeline(d.pipeline || { accrued: 0, unclaimedCount: 0, disputesCount: 0 });
        setSplits(d.splits || { publisher: 0, writers: 0 });
      } catch (e: any) {
        console.error('Error fetching dashboard:', e);
        setError(e?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [selectedPeriod, publisherID]);

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
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
                <Mic className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{publisherName || 'Publisher'}</h1>
                <p className="text-gray-300 text-sm">Publisher Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search your tracks..."
                  className="bg-white/10 backdrop-blur-md text-white pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                <Bell className="w-5 h-5 text-gray-300" />
              </button>
              <button className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                <Settings className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20 w-fit">
            {['daily', 'weekly', 'monthly', 'all-time'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-gray-300 mb-6">Loading dashboard...</div>
        )}
        {!loading && error && (
          <div className="mb-6 text-red-300">{error}</div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple/20 to-slate-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-xl">
                <Radio className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{totalPlays.toLocaleString()}</div>
                <div className="text-sm text-gray-300">Total Performances</div>
              </div>
            </div>
            <div className="text-xs text-purple-400">Across selected period</div>
          </div>

          <div className="bg-gradient-to-br from-green/20 to-emerald/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green/20 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">₵{totalEarnings.toLocaleString()}</div>
                <div className="text-sm text-gray-300">Total Earnings</div>
              </div>
            </div>
            <div className="text-xs text-green-400">Gross accrued</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Headphones className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{worksCount.toLocaleString()}</div>
                <div className="text-sm text-gray-300">Works in Catalog</div>
              </div>
            </div>
            <div className="text-xs text-blue-400">Tracks under administration</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <Globe className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{totalStations}</div>
                <div className="text-sm text-gray-300">Active Stations</div>
              </div>
            </div>
            <div className="text-xs text-orange-400">Across Ghana</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Plays Over Time */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                  Plays Over Time
                </h2>
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Airplay</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Streaming</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {playsOverTime.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray">{month.date}</span>
                      <div className="flex space-x-4">
                        <span className="text-gray">
                          {month.airplay.toLocaleString()}
                        </span>
                        <span className="text-blue-400">
                          {month.streaming.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple to-pink rounded-full transition-all duration-500"
                          style={{
                            width: `${(month.airplay / maxPlays) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${(month.streaming / maxPlays) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Songs Played */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Music className="w-5 h-5 mr-2 text-purple-400" />
                  Top Works by Plays
                </h2>
                <button className="text-sm text-gray-300 hover:text-white flex items-center">
                  View All <Eye className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {topSongs.map((song, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-purple to-pink text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {song.title}
                        </div>
                        <div className="text-sm text-gray-300">
                          {song.stations} stations • {song.confidence}% accuracy
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                        <div className="text-white font-semibold">{song.plays.toLocaleString()}</div>
                      <div className="text-sm text-green-400">
                        ₵{song.earnings.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Airplay Map - Ghana Regions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-400" />
                  Airplay Map - Ghana Regions
                </h2>
                <select
                  className="bg-white/10 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="all">All Regions</option>
                  {ghanaRegions.map((region) => (
                    <option key={region.region} value={region.region}>
                      {region.region}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ghanaRegions.map((region, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-white">
                        {region.region}
                      </div>
                      <div className="text-sm text-green-400">
                        +{region.growth}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Plays</span>
                        <span className="text-white">
                          {region.plays.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Earnings</span>
                        <span className="text-green-400">
                          ₵{region.earnings.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Stations</span>
                        <span className="text-orange-400">
                          {region.stations}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`h-full bg-gradient-to-r ${getRegionColors(
                          index,
                        )} rounded-full transition-all duration-500`}
                        style={{
                          width: `${(region.plays / maxRegionalPlays) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Station Breakdown */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-yellow-400" />
                  Top Stations
                </h2>
              </div>
              <div className="space-y-4">
                {stationBreakdown.map((station, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-white text-sm">
                        {station.station}
                      </div>
                      <div className="text-sm text-yellow-400">
                        {station.percentage}%
                      </div>
                    </div>
                    <div className="text-xs text-gray-300 mb-2">
                      {station.region} • {station.plays.toLocaleString()} plays
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                        style={{ width: `${station.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-pink-400" />
                  Recent Activity
                </h2>
              </div>
              <div className="space-y-3">
                {recentPlays.slice(0, 8).map((rp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{rp.track}</div>
                      <div className="text-xs text-gray-300 truncate">{rp.station} • {rp.region} • {rp.source}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-300">{formatDateTime(rp.playedAt)}</div>
                      <div className="text-xs text-green-400">₵{rp.royalty.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                {!recentPlays.length && (
                  <div className="text-sm text-gray-300">No recent plays.</div>
                )}
              </div>
            </div>

            {/* Roster & Agreements */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-400" />
                  Roster & Agreements
                </h2>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Writers</span>
                  <span className="text-white font-semibold">{writersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Agreements</span>
                  <span className="text-white font-semibold">{agreementsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Publisher Split</span>
                  <span className="text-white font-semibold">{splits.publisher}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Writers Split</span>
                  <span className="text-white font-semibold">{splits.writers}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Unclaimed Logs</span>
                  <span className="text-yellow-400 font-semibold">{pipeline.unclaimedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Disputes</span>
                  <span className="text-red-400 font-semibold">{pipeline.disputesCount}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </button>
                <button className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Stats
                </button>
                <button className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
