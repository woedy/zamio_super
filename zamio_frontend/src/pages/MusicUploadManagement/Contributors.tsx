import { useCallback, useEffect, useState } from 'react';
import { Search, UserPlus, Music } from 'lucide-react'; // Added relevant icons
import { Link, useLocation } from 'react-router-dom';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import Pagination from '../../components/Pagination';

export default function TrackContributors() {
  const [contributors, setContributors] = useState([]);

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

  const { track_id } = location.state || {};

  useEffect(() => {
    // Clear the message after 5 seconds (optional)
    const timer = setTimeout(() => setSuccessMessage(''), 5000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}api/artists/get-all-contributors/?search=${encodeURIComponent(
          search,
        )}&track_id=${encodeURIComponent(
          track_id,
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
      setContributors(data.data.contributors);
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
          <h3 className="text-xl font-semibold">Song Contributors</h3>

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

            <option value="Name" className="text-body dark:text-bodydark">
              Name
            </option>
            <option value="Role" className="text-body dark:text-bodydark">
              Role
            </option>
            <option value="Split" className="text-body dark:text-bodydark">
            Split
            </option>

       
          </select>
        </div>

        <Link to="/add-track-contributor" state={{ track_id: track_id }}>
          <button className="flex items-center px-4 py-2 bg-indigo-900 rounded-full hover:bg-indigo-800 transition">
            <UserPlus className="w-4 h-4 mr-2" /> Add New Contributor
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

      {/* Contributors Table */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-indigo-950 rounded-md shadow-md">
          <table className="w-full mb-5">
            <thead>
              <tr className="border-b border-indigo-800">
                <th className="text-left py-3 px-4 font-medium">Contributor ID</th>
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">% Split</th>
        
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributors?.map((contributor) => (
                <tr
                  key={contributor?.contributor_id || 'default-key'}
                  className="border-b border-indigo-800 hover:bg-indigo-900/20"
                >
                  <td className="py-3 px-4">{contributor?.contributor_id}</td>
                  <td className="py-3 px-4">{contributor?.name}</td>
                  <td className="py-3 px-4">{contributor?.role}</td>
                  <td className="py-3 px-4">{contributor?.percent_split}</td>
                
                  <td className="py-3 px-4">
                    {/* Add action buttons here, e.g., View Profile, Edit */}
                    <Link
                      to="/contributor-details"
                      state={{ contributor_id: contributor?.contributor_id }}
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
