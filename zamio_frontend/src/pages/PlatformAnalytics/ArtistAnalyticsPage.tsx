import React, { useEffect, useState } from 'react';
import { MapPin, BarChartBig, PieChart as PieChartIcon, Music2 } from 'lucide-react';
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip as ReTooltip } from 'recharts';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import RadioMap from '../../RadioMap';
import { PageBody, PageContainer, PageHeader, PageSection } from '../../components/ui';

interface StationShare {
  name: string;
  percent: number;
}

interface PlayOverTime {
  date: string;
  count: number;
}

interface SongSummary {
  title: string;
  plays: number;
}

const FALLBACK_PLAYS: PlayOverTime[] = [
  { date: 'Jul 1', count: 20 },
  { date: 'Jul 2', count: 32 },
  { date: 'Jul 3', count: 15 },
  { date: 'Jul 4', count: 50 },
  { date: 'Jul 5', count: 41 },
];

const FALLBACK_STATIONS: StationShare[] = [
  { name: 'South Joannaberg FM', percent: 33 },
  { name: 'Joshuafort FM', percent: 33 },
  { name: 'Christineborough FM', percent: 33 },
  { name: 'Others', percent: 1 },
];

const FALLBACK_SONGS: SongSummary[] = [
  { title: 'Blessings ft. XYZ', plays: 91 },
  { title: 'Midnight Drive', plays: 74 },
  { title: 'Rain On Me', plays: 63 },
  { title: 'Freedom', plays: 41 },
];

const COLOR_PALETTE = ['#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#38BDF8'];

const radioStations = [
  { name: 'Joy FM', latitude: 5.56, longitude: -0.21 },
  { name: 'Peace FM', latitude: 5.59, longitude: -0.24 },
  { name: 'YFM Accra', latitude: 5.58, longitude: -0.22 },
  { name: 'Luv FM', latitude: 6.6885, longitude: -1.6244 },
  { name: 'Skyy Power FM', latitude: 4.9437, longitude: -1.7587 },
  { name: 'Cape FM', latitude: 5.1053, longitude: -1.2466 },
  { name: 'Radio Central', latitude: 5.1066, longitude: -1.2474 },
  { name: 'Radio Savannah', latitude: 9.4075, longitude: -0.8419 },
];

const ArtistAnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [playsOverTime, setPlaysOverTime] = useState<PlayOverTime[]>(FALLBACK_PLAYS);
  const [topStations, setTopStations] = useState<StationShare[]>(FALLBACK_STATIONS);
  const [topSongs, setTopSongs] = useState<SongSummary[]>(FALLBACK_SONGS);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${baseUrl}api/artists/analytics/?artist_id=${getArtistId()}`,
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
        if (data?.data?.playsOverTime?.length) {
          setPlaysOverTime(data.data.playsOverTime);
        }
        if (data?.data?.topStations?.length) {
          setTopStations(data.data.topStations);
        } else if (data?.data?.setTopStations?.length) {
          setTopStations(data.data.setTopStations);
        }
        if (data?.data?.topSongs?.length) {
          setTopSongs(data.data.topSongs);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageContainer bleed padding="none">
      <PageBody>
        <PageHeader
          title="Airplay & Streaming Analytics"
          subtitle="Track how your catalogue performs across Zamio stations."
          icon={<BarChartBig className="h-6 w-6" />}
        />

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-[0_18px_45px_rgba(15,23,42,0.12)] transition dark:border-white/15 dark:bg-white/10 dark:text-white/70 dark:shadow-[0_18px_45px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl">
            Syncing real-time analytics…
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PageSection padding="lg">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <MapPin className="h-5 w-5 text-emerald-300" /> Airplay Map – Ghana
            </h2>
            <div className="mt-4 h-64 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-[0_12px_35px_rgba(15,23,42,0.1)] dark:border-white/15 dark:bg-white/5 dark:shadow-[0_18px_45px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl">
              <RadioMap radioStations={radioStations} />
            </div>
          </PageSection>

          <PageSection padding="lg">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <BarChartBig className="h-5 w-5 text-sky-300" /> Plays Over Time
            </h2>
            <div className="mt-4 space-y-3">
              {playsOverTime.map((day) => (
                <div key={day.date} className="flex items-center gap-3 text-sm text-slate-900 dark:text-white">
                  <span className="w-20 text-slate-600 dark:text-white/70">{day.date}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-sky-400"
                      style={{ width: `${Math.min(day.count * 2, 100)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-slate-600 dark:text-white/70">{day.count}</span>
                </div>
              ))}
            </div>
          </PageSection>
        </div>

        <PageSection padding="lg">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <PieChartIcon className="h-5 w-5 text-fuchsia-300" /> Station Breakdown
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:border-white/15 dark:bg-white/5 dark:shadow-[0_25px_55px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={topStations}
                    dataKey="percent"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {topStations.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(value: number) => `${value}%`} />
                </RPieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-sm text-slate-900 dark:text-white">
              {topStations.map((station) => (
                <li key={station.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.08)] dark:border-white/15 dark:bg-white/5 dark:shadow-[0_18px_45px_rgba(6,10,32,0.4)] dark:backdrop-blur-xl">
                  <span className="font-medium text-slate-900 dark:text-white">{station.name}</span>
                  <span className="text-fuchsia-500 dark:text-fuchsia-200">{station.percent}%</span>
                </li>
              ))}
            </ul>
          </div>
        </PageSection>

        <PageSection padding="lg">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Music2 className="h-5 w-5 text-amber-300" /> Top Songs Played
          </h2>
          <ul className="mt-4 divide-y divide-slate-100 text-sm text-slate-900 dark:divide-white/10 dark:text-white">
            {topSongs.map((song, index) => (
              <li key={song.title} className="flex items-center justify-between py-3">
                <span className="flex items-center gap-3 font-medium">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-white/70">
                    {index + 1}
                  </span>
                  {song.title}
                </span>
                <span className="text-fuchsia-600 dark:text-fuchsia-200">{song.plays} plays</span>
              </li>
            ))}
          </ul>
        </PageSection>
      </PageBody>
    </PageContainer>
  );
};

export default ArtistAnalyticsPage;
