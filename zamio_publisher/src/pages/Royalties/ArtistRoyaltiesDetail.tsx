import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { baseUrl, userToken, publisherID } from '../../constants';

type Summary = {
  artist_id: string;
  stage_name: string | null;
  photo: string | null;
  radioPlays: number;
  streamPlays: number;
  totalPlays: number;
  radioRoyalties: number;
  streamingRoyalties: number;
  totalRoyalties: number;
  paidRoyalties: number;
  pendingRoyalties: number;
  avgConfidence: number;
};

type TrackRow = {
  track_id: string | null;
  title: string;
  album: string | null;
  genre: string | null;
  radioPlays: number;
  streamPlays: number;
  totalPlays: number;
  radioRoyalties: number;
  streamingRoyalties: number;
  totalRoyalties: number;
};

type StationRow = { station: string; plays: number; royalties: number };
type TrendPoint = { month: string; radioRoyalties: number; streamingRoyalties: number; totalRoyalties: number };
type RecentLog = { id: number; date: string | null; source: 'Radio'|'Streaming'; station: string | null; song: string; royalty: number; confidence: number };

export default function ArtistRoyaltiesDetail() {
  const { artistId } = useParams<{ artistId: string }>();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tracks, setTracks] = useState<TrackRow[]>([]);
  const [topStations, setTopStations] = useState<StationRow[]>([]);
  const [monthly, setMonthly] = useState<TrendPoint[]>([]);
  const [recent, setRecent] = useState<RecentLog[]>([]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks'|'stations'|'recent'>('tracks');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (artistId) params.set('artist_id', artistId);
    if (publisherID) params.set('publisher_id', String(publisherID));
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    return params.toString();
  }, [artistId, dateFrom, dateTo]);

  useEffect(() => {
    if (!artistId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}api/publishers/royalties/artist-details/?${query}`, {
          headers: { Authorization: `Token ${userToken}` },
        });
        const json = await res.json();
        if (!cancelled && res.ok) {
          const d = json.data;
          setSummary(d.summary);
          setTracks(d.tracks);
          setTopStations(d.topStations);
          setMonthly(d.monthlyTrend);
          setRecent(d.recentLogs);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [artistId, query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20" />
      </div>

      {loading && <div className="text-white">Loading…</div>}

      {summary && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white">
          <div className="flex items-center gap-3">
            {summary.photo ? <img alt="" src={summary.photo} className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-gray-500" />}
            <div className="text-xl font-semibold">{summary.stage_name || '-'}</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>Radio Plays: {summary.radioPlays}</div>
            <div>Streaming Plays: {summary.streamPlays}</div>
            <div>Total Royalties: GHS {summary.totalRoyalties.toFixed(2)}</div>
            <div>Paid: GHS {summary.paidRoyalties.toFixed(2)}</div>
            <div>Pending: GHS {summary.pendingRoyalties.toFixed(2)}</div>
            <div>Avg Confidence: {summary.avgConfidence.toFixed(2)}</div>
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab('tracks')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab==='tracks' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'text-gray-300 bg-white/5'}`}>Per-Track Breakdown</button>
          <button onClick={() => setActiveTab('stations')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab==='stations' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'text-gray-300 bg-white/5'}`}>Top Stations</button>
          <button onClick={() => setActiveTab('recent')} className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab==='recent' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'text-gray-300 bg-white/5'}`}>Recent Logs</button>
        </div>

        {activeTab === 'tracks' && (
          <div className="overflow-auto rounded-xl">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-white/5 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Radio Plays</th>
                  <th className="px-4 py-3">Streaming Plays</th>
                  <th className="px-4 py-3">Total Royalties</th>
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/10">
                {tracks.length === 0 ? (
                  <tr><td className="px-4 py-3" colSpan={4}>No tracks</td></tr>
                ) : tracks.map(t => (
                  <tr key={`${t.track_id}-${t.title}`}>
                    <td className="px-4 py-3">{t.title}</td>
                    <td className="px-4 py-3">{t.radioPlays}</td>
                    <td className="px-4 py-3">{t.streamPlays}</td>
                    <td className="px-4 py-3 text-green-400 font-medium">GHS {t.totalRoyalties.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stations' && (
          <div className="overflow-auto rounded-xl">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-white/5 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Plays</th>
                  <th className="px-4 py-3">Royalties</th>
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/10">
                {topStations.length === 0 ? (
                  <tr><td className="px-4 py-3" colSpan={3}>No station data</td></tr>
                ) : topStations.map(s => (
                  <tr key={s.station}>
                    <td className="px-4 py-3">{s.station}</td>
                    <td className="px-4 py-3">{s.plays}</td>
                    <td className="px-4 py-3">GHS {s.royalties.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="overflow-auto rounded-xl">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-white/5 text-gray-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Song</th>
                  <th className="px-4 py-3">Royalty</th>
                  <th className="px-4 py-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="bg-white/5 divide-y divide-white/10">
                {recent.length === 0 ? (
                  <tr><td className="px-4 py-3" colSpan={6}>No recent logs</td></tr>
                ) : recent.map(r => (
                  <tr key={`${r.source}-${r.id}`}>
                    <td className="px-4 py-3">{r.date ? new Date(r.date).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3">{r.source}</td>
                    <td className="px-4 py-3">{r.station || '-'}</td>
                    <td className="px-4 py-3">{r.song}</td>
                    <td className="px-4 py-3">GHS {r.royalty.toFixed(2)}</td>
                    <td className="px-4 py-3">{r.confidence.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

