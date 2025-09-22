import { useCallback, useEffect, useState } from 'react';
import { Search, UserPlus, Music } from 'lucide-react'; // Added relevant icons
import { Link, useLocation } from 'react-router-dom';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../../lib/auth';
import Pagination from '../../components/Pagination';

export default function SongManager() {
  const [tracks, setTracks] = useState([]);

  const [search, setSearch] = useState('');
  const [filterSongs, setFilterSongs] = useState('');
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
        `${baseUrl}api/artists/get-all-tracks/?search=${encodeURIComponent(
          search,
        )}&artist_id=${encodeURIComponent(
          getArtistId(),
        )}&filter=${encodeURIComponent(filterSongs)}&page=${page}`,
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
      setTracks(data.data.tracks);
      setTotalPages(data.data.pagination.total_pages);
      setItemCount(data.data.pagination.count);
      console.log('Total Pages:', data.data.pagination.total_pages);
      console.log('ppp:', data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, search, page, userToken, filterSongs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center p-6">
        <div className="flex gap-5 items-center">
          <h3 className="text-xl font-semibold">My Songs</h3>

          <input
            type="text"
            placeholder="Search here"
            className="w-250 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterSongs}
            onChange={(e) => setFilterSongs(e.target.value)}
            className="relative z-20 w-250 rounded border border-stroke bg-transparent py-3 px-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input "
          >
            <option value="" disabled="" class="text-body dark:text-bodydark">
              Filter
            </option>

            <option value="Title" className="text-body dark:text-bodydark">
              Title
            </option>
            <option value="Genre" className="text-body dark:text-bodydark">
              Genre
            </option>
            <option value="Album" className="text-body dark:text-bodydark">
              Album
            </option>

            <option
              value="Release Date"
              className="text-body dark:text-bodydark"
            >
              Release Date
            </option>
          </select>
        </div>

        <Link to="/add-track">
          <button className="flex items-center px-4 py-2 bg-indigo-900 rounded-full hover:bg-indigo-800 transition">
            <UserPlus className="w-4 h-4 mr-2" /> Add New Track
          </button>
        </Link>
      </div>

      {successMessage && (
        <div
          className="mb-4 rounded-lg border border-green bg-green px-4 py-3 text-white relative"
          role="alert"
        >
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline ml-2">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-700"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      {/* Tracks Table */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-indigo-950 rounded-md shadow-md">
          <table className="w-full mb-5">
            <thead>
              <tr className="border-b border-indigo-800">
                <th className="text-left py-3 px-4 font-medium">Track ID</th>
                <th className="text-left py-3 px-4 font-medium">Title</th>
                <th className="text-left py-3 px-4 font-medium">Artist</th>
                <th className="text-left py-3 px-4 font-medium">Genre</th>
                <th className="text-left py-3 px-4 font-medium">Album</th>
                <th className="text-left py-3 px-4 font-medium">
                  Release Date
                </th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tracks?.map((track) => (
                <tr
                  key={track?.track_id || 'default-key'}
                  className="border-b border-indigo-800 hover:bg-indigo-900/20"
                >
                  <td className="py-3 px-4">{track?.track_id}</td>
                  <td className="py-3 px-4">{track?.title}</td>
                  <td className="py-3 px-4">{track?.artist_name}</td>
                  <td className="py-3 px-4">{track?.genre_name}</td>
                  <td className="py-3 px-4">{track?.album_title}</td>
                  <td className="py-3 px-4">{track?.release_date}</td>
                  <td className="py-3 px-4">
                    {/* Add action buttons here, e.g., View Profile, Edit */}
                    <Link
                      to="/track-details"
                      state={{ track_id: track?.track_id }}
                    >
                      <button className="text-gray-300 hover:text-white mr-2">
                        View
                      </button>
                    </Link>
                    <button className="text-gray-300 hover:text-white">
                      Edit
                    </button>
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
  );
}
