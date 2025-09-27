import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CircleDollarSign,
  Download,
  Globe,
  MapPin,
  Music,
  Radio,
  Search,
  Settings,
  ShieldAlert,
  Target,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import api from '../../lib/api';
import { getStationId, persistStationId } from '../../lib/auth';
import { useStationOnboardingContext } from '../../contexts/StationOnboardingContext';

const PERIOD_OPTIONS = ['daily', 'weekly', 'monthly', 'all-time'] as const;
type DashboardPeriod = (typeof PERIOD_OPTIONS)[number];

type DashboardTopSong = {
  title: string;
  artist: string;
  plays: number;
  confidence: number;
};

type DashboardAirplay = {
  day: string;
  plays: number;
};

type DashboardRegional = {
  region: string;
  plays: number;
  growth: number;
};

type DashboardTrend = {
  date: string;
  plays: number;
};

type DashboardDisputeSummary = {
  total: number;
  disputed: number;
  undisputed: number;
};

type StationDashboardData = {
  stationName: string;
  period: DashboardPeriod | 'custom';
  totalSongs: number;
  totalPlays: number;
  confidenceScore: number;
  activeRegions: number;
  totalRoyalties: number;
  topSongs: DashboardTopSong[];
  airplayData: DashboardAirplay[];
  regionalData: DashboardRegional[];
  disputeSummary: DashboardDisputeSummary;
  trendData: DashboardTrend[];
};

const safeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const safeString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
};

const ensureArray = <T,>(value: unknown, mapper: (item: any, index: number) => T | null): T[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const result: T[] = [];
  value.forEach((item, index) => {
    const mapped = mapper(item, index);
    if (mapped) {
      result.push(mapped);
    }
  });
  return result;
};

const normalizeDashboardPayload = (
  raw: any,
  fallbackStationName: string,
  period: DashboardPeriod,
): StationDashboardData => {
  const totalSongs = Math.max(0, Math.round(safeNumber(raw?.totalSongs)));
  const totalPlays = Math.max(0, Math.round(safeNumber(raw?.totalPlays)));
  const confidenceScoreRaw = safeNumber(raw?.confidenceScore);
  const confidenceScore = Math.max(0, Math.min(100, Math.round(confidenceScoreRaw * 10) / 10));
  const activeRegions = Math.max(0, Math.round(safeNumber(raw?.activeRegions)));
  const totalRoyalties = Math.max(0, safeNumber(raw?.totalRoyalties));

  const topSongs = ensureArray<DashboardTopSong>(raw?.topSongs, (item) => {
    const title = safeString(item?.title, 'Untitled Record');
    const artist = safeString(item?.artist, 'Unknown Artist');
    const plays = Math.max(0, Math.round(safeNumber(item?.plays)));
    const confidence = Math.max(0, Math.min(100, Math.round(safeNumber(item?.confidence))));

    if (!title && !artist && plays === 0) {
      return null;
    }

    return {
      title,
      artist,
      plays,
      confidence,
    };
  });

  const airplayData = ensureArray<DashboardAirplay>(raw?.airplayData, (item) => {
    const day = safeString(item?.day, '');
    if (!day) {
      return null;
    }
    const plays = Math.max(0, Math.round(safeNumber(item?.plays)));
    return { day, plays };
  });

  const regionalData = ensureArray<DashboardRegional>(raw?.regionalData, (item) => {
    const region = safeString(item?.region, 'Unclassified');
    const plays = Math.max(0, Math.round(safeNumber(item?.plays)));
    const growth = Math.round(safeNumber(item?.growth) * 10) / 10;
    return { region, plays, growth };
  });

  const disputeSummaryRaw = raw?.disputeSummary ?? {};
  const disputeSummary: DashboardDisputeSummary = {
    total: Math.max(0, Math.round(safeNumber(disputeSummaryRaw?.total))),
    disputed: Math.max(0, Math.round(safeNumber(disputeSummaryRaw?.disputed))),
    undisputed: Math.max(0, Math.round(safeNumber(disputeSummaryRaw?.undisputed))),
  };

  const trendData = ensureArray<DashboardTrend>(raw?.trendData, (item) => {
    const date = safeString(item?.date, '');
    if (!date) {
      return null;
    }
    const plays = Math.max(0, Math.round(safeNumber(item?.plays)));
    return { date, plays };
  });

  return {
    stationName: safeString(raw?.stationName, fallbackStationName) || fallbackStationName,
    period: safeString(raw?.period, period) as StationDashboardData['period'],
    totalSongs,
    totalPlays,
    confidenceScore,
    activeRegions,
    totalRoyalties,
    topSongs,
    airplayData,
    regionalData,
    disputeSummary,
    trendData,
  };
};

const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    ...options,
  }).format(value);
};

const formatDateLabel = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('monthly');
  const [data, setData] = useState<StationDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { details, status, loading: onboardingLoading, refresh: refreshOnboarding } = useStationOnboardingContext();

  const [stationId, setStationId] = useState<string>(() => safeString(getStationId(), ''));
  const pendingRefresh = useRef(false);
  const attemptedRefresh = useRef(false);
  const requestCounter = useRef(0);

  const setStationIdentifier = useCallback(
    (candidate: unknown): string => {
      const trimmed = safeString(candidate, '');
      if (!trimmed) {
        return '';
      }

      persistStationId(trimmed);
      setStationId((prev) => (prev === trimmed ? prev : trimmed));
      return trimmed;
    },
    [],
  );

  const contextStationId = useMemo(() => {
    const directStationId = safeString(status?.station_id, '');
    const profileStationId = safeString((details as any)?.station_id, '');
    const profileId = safeString((details as any)?.id, '');
    return directStationId || profileStationId || profileId;
  }, [(details as any)?.id, (details as any)?.station_id, status?.station_id]);

  const availableStationId = useMemo(() => {
    if (stationId) {
      return stationId;
    }

    if (contextStationId) {
      return contextStationId;
    }

    return '';
  }, [contextStationId, stationId]);

  useEffect(() => {
    if (!contextStationId) {
      return;
    }

    setStationIdentifier(contextStationId);
  }, [contextStationId, setStationIdentifier]);

  const fallbackStationName = useMemo(() => {
    const nameFromDetails = safeString(details?.name, '');
    const nameFromStatus = safeString(status?.station_name, '');
    return nameFromDetails || nameFromStatus || 'Your Station';
  }, [details?.name, status?.station_name]);

  const loadDashboard = useCallback(
    async (targetStationId: string) => {
      const normalizedStationId = safeString(targetStationId, '') || safeString(getStationId(), '');

      if (!normalizedStationId) {
        setError('We could not determine your station ID. Please sign in again.');
        setData(null);
        return;
      }

      const currentStationId = setStationIdentifier(normalizedStationId);

      if (!currentStationId) {
        setError('We could not determine your station ID. Please sign in again.');
        setData(null);
        return;
      }

      const requestId = ++requestCounter.current;

      setDashboardLoading(true);
      setError(null);

      try {
        const response = await api.get('api/stations/dashboard/', {
          params: {
            station_id: currentStationId,
            period: selectedPeriod,
          },
        });

        if (requestId !== requestCounter.current) {
          return;
        }

        const payload = response?.data?.data ?? {};
        const normalized = normalizeDashboardPayload(payload, fallbackStationName, selectedPeriod);
        setData(normalized);
      } catch (err: any) {
        if (requestId !== requestCounter.current) {
          return;
        }

        const message = err?.response?.data?.message || err?.message || 'Unable to load dashboard data.';
        setError(message);
        setData(null);
      } finally {
        if (requestId === requestCounter.current) {
          setDashboardLoading(false);
        }
      }
    },
    [fallbackStationName, selectedPeriod, setStationIdentifier],
  );

  useEffect(() => {
    const storedStationId = safeString(getStationId(), '');
    const candidateStationId = availableStationId || storedStationId;

    if (candidateStationId) {
      pendingRefresh.current = false;
      attemptedRefresh.current = false;

      const normalized = setStationIdentifier(candidateStationId);
      if (!normalized) {
        setError('We could not determine your station ID. Please sign in again.');
        setData(null);
        return;
      }

      void loadDashboard(normalized);
      return;
    }

    if (onboardingLoading) {
      setError(null);
      return;
    }

    if (pendingRefresh.current) {
      return;
    }

    if (attemptedRefresh.current) {
      setError('We could not determine your station ID. Please sign in again.');
      return;
    }

    attemptedRefresh.current = true;
    pendingRefresh.current = true;
    void refreshOnboarding({ silent: true }).finally(() => {
      pendingRefresh.current = false;
      const refreshed = safeString(getStationId(), '');
      if (refreshed) {
        setStationIdentifier(refreshed);
      }
    });
  }, [availableStationId, onboardingLoading, loadDashboard, refreshOnboarding, selectedPeriod, setStationIdentifier]);

  const handleManualRefresh = useCallback(() => {
    const identifier = availableStationId || safeString(getStationId(), '');
    if (!identifier) {
      setError('We could not determine your station ID. Please sign in again.');
      return;
    }

    const normalized = setStationIdentifier(identifier);
    if (!normalized) {
      setError('We could not determine your station ID. Please sign in again.');
      return;
    }

    attemptedRefresh.current = false;
    void loadDashboard(normalized);
  }, [availableStationId, loadDashboard, setStationIdentifier]);

  const stationName = data?.stationName || fallbackStationName;

  const maxAirplay = useMemo(() => {
    if (!data?.airplayData?.length) {
      return 0;
    }
    return data.airplayData.reduce((max, day) => Math.max(max, day.plays), 0);
  }, [data?.airplayData]);

  const maxRegionalPlays = useMemo(() => {
    if (!data?.regionalData?.length) {
      return 0;
    }
    return data.regionalData.reduce((max, region) => Math.max(max, region.plays), 0);
  }, [data?.regionalData]);

  const disputeRate = useMemo(() => {
    if (!data?.disputeSummary || data.disputeSummary.total === 0) {
      return 0;
    }
    return Math.round((data.disputeSummary.disputed / data.disputeSummary.total) * 1000) / 10;
  }, [data?.disputeSummary]);

  const earningsPerPlay = useMemo(() => {
    if (!data || data.totalPlays === 0) {
      return 0;
    }
    return data.totalRoyalties / data.totalPlays;
  }, [data]);

  const renderSummaryCards = () => {
    const cards = [
      {
        label: 'Total Songs',
        value: data ? formatNumber(data.totalSongs, { maximumFractionDigits: 0 }) : '--',
        description: 'Unique tracks detected',
        icon: Music,
        gradient: 'from-blue-500/20 to-purple-600/20',
        iconAccent: 'bg-blue-500/20 text-blue-400',
      },
      {
        label: 'Total Plays',
        value: data ? formatNumber(data.totalPlays, { maximumFractionDigits: 0 }) : '--',
        description: `${selectedPeriod === 'all-time' ? 'Lifetime' : 'Period'} airplay count`,
        icon: Volume2,
        gradient: 'from-green-500/20 to-emerald-600/20',
        iconAccent: 'bg-green-500/20 text-emerald-400',
      },
      {
        label: 'Avg Confidence',
        value: data ? `${formatNumber(data.confidenceScore, { maximumFractionDigits: 1 })}%` : '--',
        description: 'Detection accuracy',
        icon: Target,
        gradient: 'from-orange-500/20 to-red-500/20',
        iconAccent: 'bg-orange-500/20 text-orange-400',
      },
      {
        label: 'Active Regions',
        value: data ? formatNumber(data.activeRegions, { maximumFractionDigits: 0 }) : '--',
        description: 'Geographic reach',
        icon: Globe,
        gradient: 'from-purple-500/20 to-pink-500/20',
        iconAccent: 'bg-purple-500/20 text-purple-400',
      },
      {
        label: 'Total Royalties',
        value: data ? `₵${formatNumber(data.totalRoyalties, { minimumFractionDigits: 2 })}` : '--',
        description: 'Reported for this period',
        icon: CircleDollarSign,
        gradient: 'from-yellow-500/20 to-amber-500/20',
        iconAccent: 'bg-yellow-500/20 text-yellow-400',
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {cards.map(({ label, value, description, icon: Icon, gradient, iconAccent }) => (
          <div
            key={label}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} backdrop-blur-lg p-6 shadow-lg shadow-black/20`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${iconAccent}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs uppercase tracking-wide text-white/60">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <p className="mt-2 text-sm text-white/70">{description}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderTopSongs = () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center text-white">
          <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
          Top Played Songs
        </h2>
        <button
          type="button"
          className="flex items-center text-sm text-white/70 hover:text-white transition-colors"
          onClick={handleManualRefresh}
        >
          Refresh
          <Download className="w-4 h-4 ml-2" />
        </button>
      </div>
      {dashboardLoading && !data ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse h-16 rounded-xl bg-white/10" />
          ))}
        </div>
      ) : data?.topSongs.length ? (
        <div className="space-y-4">
          {data.topSongs.map((song, index) => (
            <div
              key={`${song.title}-${song.artist}-${index}`}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/10 p-4 backdrop-blur"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-white">{song.title}</p>
                  <p className="text-sm text-white/70">{song.artist}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{formatNumber(song.plays, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-white/60">{song.confidence}% confidence</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/70">No song activity yet for this period.</p>
      )}
    </div>
  );

  const renderAirplayTimeline = () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center text-white">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          Airplay Activity
        </h2>
        <span className="text-xs text-white/60 uppercase">7-day view</span>
      </div>
      {data?.airplayData.length ? (
        <div className="space-y-4">
          {data.airplayData.map((day) => {
            const width = maxAirplay === 0 ? 0 : Math.round((day.plays / maxAirplay) * 100);
            return (
              <div key={day.day} className="flex items-center space-x-4">
                <div className="w-12 text-sm text-white/70">{day.day}</div>
                <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="w-20 text-right text-white font-semibold">
                  {formatNumber(day.plays, { maximumFractionDigits: 0 })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-white/70">No airplay data captured for this selection.</p>
      )}
    </div>
  );

  const renderTrendData = () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center text-white">
          <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
          Daily Trend
        </h2>
        <span className="text-xs uppercase text-white/60">{selectedPeriod === 'all-time' ? 'All time' : selectedPeriod}</span>
      </div>
      {data?.trendData.length ? (
        <div className="space-y-3">
          {data.trendData.slice(-8).map((entry) => (
            <div key={entry.date} className="flex items-center justify-between text-sm">
              <span className="text-white/70">{formatDateLabel(entry.date)}</span>
              <span className="font-medium text-white">{formatNumber(entry.plays, { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/70">Trend data will appear once we collect plays over time.</p>
      )}
    </div>
  );

  const renderRegionalInsights = () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center text-white">
          <MapPin className="w-5 h-5 mr-2 text-green-400" />
          Regional Insights
        </h2>
        <span className="text-xs uppercase text-white/60">{data?.regionalData.length || 0} regions</span>
      </div>
      {data?.regionalData.length ? (
        <div className="space-y-4">
          {data.regionalData.map((region) => {
            const width = maxRegionalPlays === 0 ? 0 : Math.round((region.plays / maxRegionalPlays) * 100);
            return (
              <div key={region.region} className="rounded-xl border border-white/5 bg-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-white">{region.region}</p>
                  <span className="text-xs text-emerald-400">+{formatNumber(region.growth)}%</span>
                </div>
                <p className="text-sm text-white/70 mb-2">
                  {formatNumber(region.plays, { maximumFractionDigits: 0 })} plays
                </p>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-white/70">We will show regions once airplay is detected.</p>
      )}
    </div>
  );

  const renderDisputeSummary = () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center text-white">
          <ShieldAlert className="w-5 h-5 mr-2 text-red-400" />
          Dispute Overview
        </h2>
        <span className="text-xs uppercase text-white/60">{formatNumber(disputeRate)}% dispute rate</span>
      </div>
      {data?.disputeSummary ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Total Playlogs</span>
            <span className="text-white font-semibold">
              {formatNumber(data.disputeSummary.total, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-300">Flagged for dispute</span>
            <span className="text-white font-semibold">
              {formatNumber(data.disputeSummary.disputed, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-300">Cleared</span>
            <span className="text-white font-semibold">
              {formatNumber(data.disputeSummary.undisputed, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500"
              style={{ width: `${Math.min(100, Math.max(0, disputeRate))}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/70">No dispute data is available for the selected range.</p>
      )}
    </div>
  );

  const renderRoyaltySummary = () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center text-white">
          <CircleDollarSign className="w-5 h-5 mr-2 text-amber-300" />
          Royalty Snapshot
        </h2>
        <button
          type="button"
          className="text-xs uppercase text-white/60 hover:text-white transition-colors"
          onClick={handleManualRefresh}
        >
          Sync
        </button>
      </div>
      {data ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">Total Royalties</p>
            <p className="text-2xl font-semibold text-white">
              ₵{formatNumber(data.totalRoyalties, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-white/70">Per play</p>
              <p className="text-lg font-semibold text-white">₵{formatNumber(earningsPerPlay, { minimumFractionDigits: 4 })}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-white/70">Playlogs</p>
              <p className="text-lg font-semibold text-white">
                {formatNumber(data.totalPlays, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <p className="text-xs text-white/60">
            Royalty amounts reflect reconciled detection logs for the selected period.
          </p>
        </div>
      ) : (
        <p className="text-sm text-white/70">Sign in to view royalty performance.</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <header className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-4 shadow-lg shadow-yellow-500/40">
                <Radio className="w-8 h-8 text-black" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-white/60">Station Dashboard</p>
                <h1 className="text-2xl font-bold text-white">{stationName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  className="hidden md:block bg-white/10 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Search dashboard"
                  type="search"
                />
                <span className="pointer-events-none absolute inset-y-0 left-3 hidden items-center md:flex">
                  <Search className="w-4 h-4 text-white/40" />
                </span>
              </div>
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/10 p-2 hover:bg-white/20 transition-colors"
              >
                <Bell className="w-5 h-5 text-white/70" />
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/10 p-2 hover:bg-white/20 transition-colors"
              >
                <Settings className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur">
            {PERIOD_OPTIONS.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriod(period)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {period.replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            {dashboardLoading ? 'Loading metrics…' : 'Updated just now'}
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              ZamIO compliance grade monitoring active
            </span>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                className="rounded-lg border border-red-500/40 px-3 py-1 text-xs font-medium text-red-100 hover:bg-red-500/20"
                onClick={handleManualRefresh}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {renderSummaryCards()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {renderTopSongs()}
            {renderAirplayTimeline()}
            {renderTrendData()}
          </div>
          <div className="space-y-8">
            {renderRegionalInsights()}
            {renderRoyaltySummary()}
            {renderDisputeSummary()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
