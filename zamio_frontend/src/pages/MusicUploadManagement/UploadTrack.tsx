import { useCallback, useEffect, useState } from 'react';
import { Music2Icon, UploadCloud, FileMusic, Plus } from 'lucide-react';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import ButtonLoader from '../../common/button_loader';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function UploadTrack() {
  const [trackData, setTrackData] = useState({
    title: '',
    audioFile: null,
    audioFileName: null,
    releaseDate: '', // Optional
  });
  const [inputError, setInputError] = useState(null); // "success", "error", null
  const [loading, setLoading] = useState(false);

  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState('');

  const [albums, setAlbums] = useState([]);
  const [album, setAlbum] = useState('');

  const navigate = useNavigate();

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
        `${baseUrl}api/artists/get-upload-track-support-data/?artist_id=${encodeURIComponent(
          getArtistId(),
        )}`,
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
      console.log('ppp:', data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, userToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrackData({ ...trackData, [name]: value });
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setTrackData({ ...trackData, audioFile: null, audioFileName: null });
      return;
    }
    const allowed = ['audio/mpeg', 'audio/wav'];
    const maxBytes = 50 * 1024 * 1024; // 50MB
    if (!allowed.includes(file.type)) {
      setInputError('Only MP3 or WAV files are allowed.');
      return;
    }
    if (file.size > maxBytes) {
      setInputError('File too large. Max 50MB.');
      return;
    }
    setInputError(null);
    setTrackData({ ...trackData, audioFile: file, audioFileName: file.name });
  };

  const handleSubmit = async (e) => {
    setLoading(true);

    e.preventDefault();
    if (!trackData.audioFile) {
      setInputError('error');
      return;
    }

    const formData = new FormData();
    formData.append('artist_id', getArtistId());
    formData.append('title', trackData.title);
    formData.append('album_id', album);
    formData.append('audio_file', trackData.audioFile);
    formData.append('genre_id', genre);
    formData.append('release_date', trackData.releaseDate);

    try {
      const url = baseUrl + 'api/artists/add-track/';

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
      const created = data?.data || {};
      const nextTrackId = created.track_id || created.db_id; // prefer public track_id
      // Step to cover art upload next
      navigate('/add-track-cover', {
        state: {
          successMessage: `${trackData.title} added succesfully.`,
          track_id: nextTrackId,
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
        <h2 className="text-3xl font-semibold flex items-center mb-4">
          <Music2Icon className="w-7 h-7 mr-3" /> Upload New Track
        </h2>
        <p className="text-gray-500">Share your latest music with your fans!</p>
      </div>

      {inputError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {inputError}</span>
        </div>
      )}

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

      {/* Stepper */}
      <div className="mb-4 flex items-center space-x-4 text-sm">
        {[
          { label: 'Upload', active: true },
          { label: 'Cover Art' },
          { label: 'Contributors' },
          { label: 'Review' },
        ].map((s, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${
                s.active ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              {i + 1}
            </div>
            <span className={`mr-4 ${s.active ? 'text-white' : 'text-gray-400'}`}>{s.label}</span>
            {i < 3 && <div className="w-10 h-px bg-white/20 mr-4" />}
          </div>
        ))}
      </div>

      <div className="bg-boxdark rounded-lg shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Track Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-white text-sm font-bold mb-2"
            >
              Track Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={trackData.title}
              onChange={handleChange}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
              placeholder="Enter track title"
              required
            />
          </div>

          <div className="flex justify-between gap-3">
            <div className="w-full">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="album"
              >
                Select Album
              </label>

              <select
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
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

            <Link to="/add-album">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Album
              </button>
            </Link>
          </div>
          {/* Audio File Upload */}
          <div>
            <label
              htmlFor="audioFile"
              className="block text-white text-sm font-bold mb-2"
            >
              Upload Audio File <span className="text-red-500">*</span>
            </label>
            <div className="relative border rounded-md border-dashed border-indigo-700 bg-graydark py-6 px-4 flex flex-col items-center justify-center">
              <div className="text-center">
                <UploadCloud className="w-10 h-10 text-emerald-300 mx-auto" />
                <h3 className="mt-2 text-sm text-gray-400">
                  Drag and drop your MP3 or WAV file here
                </h3>
                <p className="mt-1 text-xs text-gray-500">or</p>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <label
                    htmlFor="audioFile"
                    className="py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-graydark cursor-pointer"
                  >
                    Browse files
                  </label>
                  <input
                    id="audioFile"
                    name="audioFile"
                    type="file"
                    accept="audio/mpeg, audio/wav"
                    className="sr-only"
                    onChange={handleAudioFileChange}
                    required
                  />
                </div>
                {trackData.audioFileName && (
                  <p className="mt-2 text-green-400 text-sm">
                    Selected: {trackData.audioFileName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="">
            <label
              className="block text-white text-sm font-bold mb-2"
              htmlFor="genre"
            >
              Select Genre
            </label>

            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
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
              className="block text-white text-sm font-bold mb-2"
            >
              Release Date (Optional)
            </label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              value={trackData.releaseDate}
              onChange={handleChange}
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
                <UploadCloud className="w-5 h-5 mr-2" /> Upload Track
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
