import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  List,
  Grid3X3,
  Eye,
  Archive,
  RemoveFormattingIcon,
  Plus,
  Search,
  Logs,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { baseUrl, baseUrlMedia, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import Pagination from '../../components/Pagination';
import { PageBody, PageContainer, PageHeader, PageSection } from '../../components/ui';
import { cn } from '../../utils/cn';

interface Track {
  track_id: string;
  title: string;
  duration: string;
  release_date: string;
  genre_name: string;
  airplays: number;
  status: string;
  plays?: number;
  cover_art?: string;
}

const STATUS_TONES: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-100',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-400/25 dark:text-amber-100',
  rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-500/25 dark:text-rose-100',
};

const ArtistTracksView = () => {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [filter, setFilter] = useState<string>('all');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [itemCount, setItemCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => setSuccessMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}api/artists/get-all-tracks/?search=${encodeURIComponent(
          search,
        )}&artist_id=${encodeURIComponent(getArtistId())}&page=${page}`,
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
      setTracks(data?.data?.tracks ?? []);
      setTotalPages(data?.data?.pagination?.total_pages ?? 1);
      setItemCount(data?.data?.pagination?.count ?? 0);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTracks = useMemo(() => {
    const normalizedFilter = filter.toLowerCase();
    return tracks.filter((track) => {
      if (!track?.status) return normalizedFilter === 'all';
      if (normalizedFilter === 'all') return true;
      return track.status.toLowerCase() === normalizedFilter;
    });
  }, [tracks, filter]);

  const isEmpty = !loading && filteredTracks.length === 0;
  const totalLabel = new Intl.NumberFormat().format(itemCount);

  const statusBadgeClass = (status: string) =>
    cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
      STATUS_TONES[status?.toLowerCase?.() ?? ''] ?? 'bg-sky-400/25 text-sky-100',
    );

  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  return (
    <PageContainer bleed padding="none">
      <PageBody>
        {successMessage && (
          <div className="rounded-2xl border border-emerald-300/60 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-900 transition dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-100">
            {successMessage}
          </div>
        )}

        <PageHeader
          title="My Tracks"
          subtitle="All tracks from all your albums"
          icon={<Logs className="h-6 w-6" />}
          actions={
            <>
              <div className="relative w-full min-w-[220px] sm:w-72">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors dark:text-white/60" />
                <input
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search tracks"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 pl-11 text-sm text-slate-900 placeholder:text-slate-500 shadow-[0_15px_45px_rgba(15,23,42,0.12)] transition focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/40 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/60 dark:shadow-[0_15px_45px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl"
                  type="search"
                />
              </div>
              <Link to="/add-track">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(168,85,247,0.35)] transition hover:shadow-[0_22px_55px_rgba(168,85,247,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-0"
                >
                  <Plus className="h-4 w-4" />
                  Add Song
                </button>
              </Link>
            </>
          }
        />

        <PageSection className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-white/70">{totalLabel} tracks</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.12)] transition focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/40 dark:border-white/20 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_12px_40px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView('table')}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-500 shadow-[0_12px_35px_rgba(15,23,42,0.12)] transition-colors hover:border-purple-400/40 hover:text-purple-500 dark:border-white/15 dark:bg-white/5 dark:text-white/60 dark:shadow-[0_12px_35px_rgba(6,10,32,0.4)] dark:hover:border-purple-400/50 dark:hover:text-white backdrop-blur-xl',
                  view === 'table'
                    ? 'border-purple-400/60 bg-gradient-to-br from-purple-500/10 via-sky-500/10 to-indigo-500/20 text-purple-600 shadow-[0_20px_45px_rgba(129,140,248,0.35)] dark:from-purple-500/60 dark:via-sky-500/50 dark:to-indigo-500/60 dark:text-white dark:shadow-[0_20px_45px_rgba(129,140,248,0.45)]'
                    : undefined,
                )}
                aria-pressed={view === 'table'}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-500 shadow-[0_12px_35px_rgba(15,23,42,0.12)] transition-colors hover:border-purple-400/40 hover:text-purple-500 dark:border-white/15 dark:bg-white/5 dark:text-white/60 dark:shadow-[0_12px_35px_rgba(6,10,32,0.4)] dark:hover:border-purple-400/50 dark:hover:text-white backdrop-blur-xl',
                  view === 'grid'
                    ? 'border-purple-400/60 bg-gradient-to-br from-purple-500/10 via-sky-500/10 to-indigo-500/20 text-purple-600 shadow-[0_20px_45px_rgba(129,140,248,0.35)] dark:from-purple-500/60 dark:via-sky-500/50 dark:to-indigo-500/60 dark:text-white dark:shadow-[0_20px_45px_rgba(129,140,248,0.45)]'
                    : undefined,
                )}
                aria-pressed={view === 'grid'}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center text-slate-600 dark:text-white/70">
              Loading tracks…
            </div>
          ) : isEmpty ? (
            <div className="flex min-h-[240px] items-center justify-center text-slate-600 dark:text-white/70">
              No tracks found for your current filters.
            </div>
          ) : view === 'table' ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-[0_20px_55px_rgba(15,23,42,0.12)] transition dark:border-white/15 dark:bg-white/5 dark:shadow-[0_25px_55px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-900 dark:divide-white/10 dark:text-white">
                <thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-white/70">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Title</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Duration</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Release Date</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Genre</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Airplays</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/95 dark:divide-white/10 dark:bg-white/5">
                  {filteredTracks.map((track) => (
                    <tr key={track.track_id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/10">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{track.title}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-white/70">{track.duration}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-white/70">{track.release_date}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-white/70">{track.genre_name}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-white/70">{track.airplays}</td>
                      <td className="px-4 py-3">
                        <span className={statusBadgeClass(track.status)}>{track.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-3 text-slate-500 dark:text-white/60">
                          <Link
                            to="/track-details"
                            state={{ track_id: track?.track_id }}
                            className="transition hover:text-purple-500 dark:hover:text-white"
                            aria-label={`View details for ${track.title}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            className="transition hover:text-purple-500 dark:hover:text-white"
                            title="Archive track"
                            aria-label="Archive track"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="transition hover:text-purple-500 dark:hover:text-white"
                            title="Remove from playlists"
                            aria-label="Remove from playlists"
                          >
                            <RemoveFormattingIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTracks.map((track) => (
                <Link
                  key={track.track_id}
                  to="/track-details"
                  state={{ track_id: track?.track_id }}
                  className="group"
                >
                  <article className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-4 text-slate-900 shadow-[0_25px_55px_rgba(15,23,42,0.12)] transition-transform duration-300 hover:shadow-[0_32px_70px_rgba(15,23,42,0.16)] dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-[0_25px_55px_rgba(6,10,32,0.45)] dark:hover:shadow-[0_30px_65px_rgba(6,10,32,0.55)] dark:backdrop-blur-xl group-hover:-translate-y-1">
                    <div className="relative overflow-hidden rounded-2xl bg-slate-100/60 dark:bg-white/10">
                      <img
                        src={`${baseUrlMedia}${track?.cover_art ?? ''}`}
                        alt={track.title}
                        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{track.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-white/70">{track.genre_name}</p>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-white/60">📆 {track.release_date}</p>
                      <p className="text-sm font-medium text-slate-700 dark:text-white/80">{track.airplays} airplays</p>
                      <span className={statusBadgeClass(track.status)}>{track.status}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </PageSection>

        <div className="flex justify-center">
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
      </PageBody>
    </PageContainer>
  );
};

export default ArtistTracksView;
