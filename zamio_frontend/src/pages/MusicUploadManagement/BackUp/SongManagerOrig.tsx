import React, { useState } from 'react';
import {
  List,
  Grid3X3,
  Filter,
  Eye,
  Archive,
  Delete,
  DeleteIcon,
  LucideDelete,
  RemoveFormattingIcon,
  Plus,
  Search,
  Logs,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ArtistTracksView = () => {
  const [view, setView] = useState('table');
  const [filter, setFilter] = useState('all');

  const mockTracks = [
    {
      id: 1,
      title: 'Freedom Ride',
      duration: '3:45',
      released: '2023-10-01',
      genre: 'Afrobeat',
      plays: 143,
      status: 'Approved',
      cover: '/covers/freedom.jpg',
    },
    {
      id: 2,
      title: 'Echoes in Kumasi',
      duration: '4:02',
      released: '2022-06-15',
      genre: 'Highlife',
      plays: 98,
      status: 'Pending',
      cover: '/covers/echoes.jpg',
    },
    {
      id: 3,
      title: 'Soul Fire',
      duration: '3:33',
      released: '2024-01-20',
      genre: 'Hip Hop',
      plays: 215,
      status: 'Approved',
      cover: '/covers/soulfire.jpg',
    },
  ];

  const filteredTracks = mockTracks.filter((track) => {
    if (filter === 'all') return true;
    return track.status.toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-whiten text-black dark:bg-slate-950 dark:text-white px-6 py-10">
      {/* Header */}
      <header className="bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                <Logs className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">🎶 My Tracks</h1>
                <p className="text-gray-300 text-sm">
                  All tracks from all your albums
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
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🎶</h1>
          <div className="flex gap-4">
          <Link to="/add-track">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Song
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
            <button
              className={`p-2 rounded-md ${
                view === 'table' ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
              onClick={() => setView('table')}
            >
              <List size={18} />
            </button>
            <button
              className={`p-2 rounded-md ${
                view === 'grid' ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
              onClick={() => setView('grid')}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
        </div>

        {view === 'table' ? (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full text-sm text-white bg-white/5">
              <thead className="bg-slate-800 text-left">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Release Date</th>
                  <th className="p-3">Genre</th>
                  <th className="p-3">Airplays</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.map((track) => (
                  <tr
                    key={track.id}
                    className="border-t border-white/10 hover:bg-white/10"
                  >
                    <td className="p-3 font-medium">{track.title}</td>
                    <td className="p-3">{track.duration}</td>
                    <td className="p-3">{track.released}</td>
                    <td className="p-3">{track.genre}</td>
                    <td className="p-3">{track.plays}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          track.status === 'Approved'
                            ? 'bg-green-600'
                            : 'bg-yellow-600'
                        }`}
                      >
                        {track.status}
                      </span>
                    </td>

                    <td>
                      {' '}
                      <div className="flex">
                        <Link to={'/track-details'}>
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
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                className="bg-white/5 p-4 rounded-lg border border-white/10"
              >
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <h3 className="text-lg font-bold">{track.title}</h3>
                <p className="text-sm text-gray-300">{track.genre}</p>
                <p className="text-sm text-gray-400">📆 {track.released}</p>
                <p className="text-sm mt-2 text-indigo-400">
                  {track.plays} plays
                </p>
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    track.status === 'Approved'
                      ? 'bg-green-600'
                      : 'bg-yellow-600'
                  }`}
                >
                  {track.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistTracksView;
