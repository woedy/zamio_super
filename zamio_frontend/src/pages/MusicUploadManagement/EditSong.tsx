import { useCallback, useEffect, useState } from 'react';
import { Music2Icon, UploadCloud, FileMusic } from 'lucide-react';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import ButtonLoader from '../../common/button_loader';
import { useLocation, useNavigate } from 'react-router-dom';

export default function EditTractDetails() {
  const [trackData, setTrackData] = useState({
    title: '',
    genre: '',
    album: '',
    audioFile: null,
    release_date: '',
  });
  const [inputError, setInputError] = useState(null); // "success", "error", null
  const [loading, setLoading] = useState(false);

  const [genres, setGenres] = useState([]);

  const [albums, setAlbums] = useState([]);

  const navigate = useNavigate();

  const location = useLocation();
  const { track_id } = location.state || {};

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}api/artists/get-edit-track-support-data/?artist_id=${encodeURIComponent(
          getArtistId(),
        )}&track_id=${encodeURIComponent(track_id)}`,
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
      setGenres(data.data.genres);
      setAlbums(data.data.albums);
      setTrackData({...data.data.track_details, release_date: data.data.track_details.release_date?.split('T')[0] || ''});
      console.log('ppp:', data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, userToken, track_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrackData({ ...trackData, [name]: value });
  };

  const handleSubmit = async (e) => {
    setLoading(true);

    e.preventDefault();

    const formData = new FormData();
    formData.append('track_id', track_id);
    formData.append('artist_id', getArtistId());
    formData.append('title', trackData.title);
    formData.append('album_id', trackData.album);
    formData.append('genre_id', trackData.genre);
    formData.append('release_date', trackData.release_date);

    try {
      const url = baseUrl + 'api/artists/edit-track/';

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Token ${userToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        // Display the first error message from the errors object
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setInputError(errorMessages.join('\n'));
          setLoading(false);
        } else {
          setInputError(data.message || 'Failed to upload data');
          setLoading(false);
        }
        return; // Prevent further code execution
      }

      // Registration successful
      console.log('Track added successfully');
      navigate('/track-details', {
        state: {
          successMessage: `${trackData.title} added succesfully.`,
          track_id: `${track_id}`,
        },
      });

      setLoading(false);
    } catch (error) {
      setInputError('error');
      setLoading(false);
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-emerald-300 flex items-center mb-4">
          <Music2Icon className="w-7 h-7 mr-3" /> Edit Track Details
        </h2>
        <p className="text-gray-500">Update your track info!</p>
      </div>

      {inputError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {inputError}</span>
        </div>
      )}

      <div className="bg-boxdark rounded-lg shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Track Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-emerald-200 text-sm font-bold mb-2"
            >
              Track Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={trackData.title}
              //value={trackData.title}
              onChange={handleChange}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
              placeholder="Enter track title"
              required
            />
          </div>

          <div className="">
            <label
              className="block text-emerald-200 text-sm font-bold mb-2"
              htmlFor="album"
            >
              Select Album
            </label>

            <select
              id="album"
              value={trackData.album}
              onChange={(e) => setTrackData((prev) => ({...prev, album: e.target.value}))}
              className="shadow-inner border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
            >
              <option value="">Select Album</option>

              {albums.map((_album) => (
                <option
                  key={_album.id}
                  value={_album.id}
                  className="hover:bg-graydark dark:hover:bg-graydark"
                >
                  {_album.title}
                </option>
              ))}
            </select>
          </div>

          <div className="">
            <label
              className="block text-emerald-200 text-sm font-bold mb-2"
              htmlFor="genre"
            >
              Select Genre
            </label>

            <select
              id="genre"
              value={trackData.genre}
              onChange={(e) => setTrackData((prev) => ({...prev, genre: e.target.value }))}
              className="shadow-inner border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
            >
              <option value="">Select Genre</option>

              {genres.map((gen) => (
                <option
                  key={gen.id}
                  value={gen.id}
                  className="hover:bg-graydark dark:hover:bg-graydark"
                >
                  {gen.name}
                </option>
              ))}
            </select>
          </div>

          {/* Release Date (Optional) */}
          <div>
            <label
              htmlFor="releaseDate"
              className="block text-emerald-200 text-sm font-bold mb-2"
            >
              Release Date (Optional)
            </label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              value={trackData.release_date}
              onChange={(e) => setTrackData((prev) => ({...prev, release_date: e.target.value}))}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
            />
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <UploadCloud className="w-5 h-5 mr-2" /> Update Track
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
