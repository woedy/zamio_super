import { useCallback, useEffect, useState } from 'react';
import { Music2, Upload, FileAudio, Save, ArrowLeft, Image } from 'lucide-react';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import ButtonLoader from '../../common/button_loader';
import { useLocation, useNavigate } from 'react-router-dom';
import ContributorSplitManager from '../../components/ContributorSplitManager';
import EditHistory from '../../components/EditHistory';

export default function EditTractDetails() {
  const [trackData, setTrackData] = useState({
    title: '',
    genre: '',
    album: '',
    release_date: '',
    lyrics: '',
    explicit: false,
  });
  const [inputError, setInputError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [coverArtFile, setCoverArtFile] = useState(null);
  const [coverArtPreview, setCoverArtPreview] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { track_id } = location.state || {};

  const fetchData = useCallback(async () => {
    setInitialLoading(true);
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
      
      const trackDetails = data.data.track_details;
      setTrackData({
        title: trackDetails.title || '',
        genre: trackDetails.genre || '',
        album: trackDetails.album || '',
        release_date: trackDetails.release_date?.split('T')[0] || '',
        lyrics: trackDetails.lyrics || '',
        explicit: trackDetails.explicit || false,
      });
      
      // Set cover art preview if exists
      if (trackDetails.cover_art) {
        setCoverArtPreview(trackDetails.cover_art);
      }
      
      console.log('Track data loaded:', data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setInputError('Failed to load track data. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  }, [track_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setTrackData({ ...trackData, [name]: newValue });
    setHasChanges(true);
    setInputError(null);
  };

  const handleCoverArtChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setCoverArtFile(null);
      setCoverArtPreview(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setInputError('Only JPEG, PNG, and WebP images are allowed for cover art.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setInputError('Cover art file size cannot exceed 10MB.');
      return;
    }

    setCoverArtFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverArtPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    setHasChanges(true);
    setInputError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInputError(null);

    const formData = new FormData();
    formData.append('track_id', track_id);
    formData.append('artist_id', getArtistId());
    formData.append('title', trackData.title);
    formData.append('album_id', trackData.album);
    formData.append('genre_id', trackData.genre);
    formData.append('release_date', trackData.release_date);
    formData.append('lyrics', trackData.lyrics);
    formData.append('explicit', trackData.explicit);

    // Add cover art if selected
    if (coverArtFile) {
      formData.append('cover_art', coverArtFile);
    }

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
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setInputError(errorMessages.join('\n'));
        } else {
          setInputError(data.message || 'Failed to update track');
        }
        return;
      }

      // Update successful
      console.log('Track updated successfully');
      setSuccessMessage(`${trackData.title} updated successfully!`);
      setHasChanges(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error) {
      setInputError('Network error occurred. Please try again.');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/track-details', { state: { track_id } });
      }
    } else {
      navigate('/track-details', { state: { track_id } });
    }
  };

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading track details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-emerald-300 flex items-center mb-4">
              <Music2 className="w-7 h-7 mr-3" /> Edit Track Details
            </h2>
            <p className="text-gray-500">Update your track information and settings</p>
          </div>
          <button
            onClick={handleCancel}
            className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Track
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline ml-2">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {inputError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{inputError}</span>
          <button
            onClick={() => setInputError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      <div className="bg-boxdark rounded-lg shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Track Title */}
          <div>
            <label htmlFor="title" className="block text-emerald-200 text-sm font-bold mb-2">
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

          {/* Album and Genre Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-emerald-200 text-sm font-bold mb-2" htmlFor="album">
                Select Album
              </label>
              <select
                id="album"
                name="album"
                value={trackData.album}
                onChange={handleChange}
                className="shadow-inner border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
              >
                <option value="">No Album</option>
                {albums.map((_album) => (
                  <option key={_album.id} value={_album.id}>
                    {_album.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-emerald-200 text-sm font-bold mb-2" htmlFor="genre">
                Select Genre <span className="text-red-500">*</span>
              </label>
              <select
                id="genre"
                name="genre"
                value={trackData.genre}
                onChange={handleChange}
                className="shadow-inner border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
                required
              >
                <option value="">Select Genre</option>
                {genres.map((gen) => (
                  <option key={gen.id} value={gen.id}>
                    {gen.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Release Date */}
          <div>
            <label htmlFor="release_date" className="block text-emerald-200 text-sm font-bold mb-2">
              Release Date
            </label>
            <input
              type="date"
              id="release_date"
              name="release_date"
              value={trackData.release_date}
              onChange={handleChange}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
            />
          </div>

          {/* Lyrics */}
          <div>
            <label htmlFor="lyrics" className="block text-emerald-200 text-sm font-bold mb-2">
              Lyrics (Optional)
            </label>
            <textarea
              id="lyrics"
              name="lyrics"
              value={trackData.lyrics}
              onChange={handleChange}
              rows={6}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
              placeholder="Enter track lyrics..."
            />
          </div>

          {/* Cover Art Upload */}
          <div>
            <label className="block text-emerald-200 text-sm font-bold mb-2">
              Cover Art
            </label>
            <div className="flex items-start space-x-4">
              {/* Current/Preview Image */}
              {coverArtPreview && (
                <div className="flex-shrink-0">
                  <img
                    src={coverArtPreview}
                    alt="Cover art preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                  />
                </div>
              )}
              
              {/* Upload Area */}
              <div className="flex-1">
                <div className="relative border rounded-md border-dashed border-indigo-700 bg-graydark py-4 px-4 flex flex-col items-center justify-center">
                  <Image className="w-8 h-8 text-emerald-300 mb-2" />
                  <p className="text-sm text-gray-400 text-center mb-2">
                    Upload new cover art (JPEG, PNG, WebP)
                  </p>
                  <label
                    htmlFor="coverArt"
                    className="py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 cursor-pointer"
                  >
                    Choose File
                  </label>
                  <input
                    id="coverArt"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleCoverArtChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Explicit Content */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="explicit"
              name="explicit"
              checked={trackData.explicit}
              onChange={handleChange}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="explicit" className="ml-2 block text-sm text-gray-300">
              This track contains explicit content
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            
            <div className="flex space-x-3">
              {loading ? (
                <ButtonLoader />
              ) : (
                <button
                  type="submit"
                  disabled={!hasChanges}
                  className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition-colors ${
                    hasChanges
                      ? 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {hasChanges ? 'Save Changes' : 'No Changes'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Contributor Split Management */}
      {track_id && (
        <div className="mt-8">
          <div className="bg-boxdark rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-semibold text-emerald-300 mb-4">Contributor Management</h3>
            <ContributorSplitManager 
              trackId={track_id} 
              onSplitsUpdated={(summary) => {
                console.log('Splits updated:', summary);
              }}
            />
          </div>
        </div>
      )}

      {/* Edit History */}
      {track_id && (
        <div className="mt-8">
          <EditHistory 
            resourceType="track"
            resourceId={track_id}
            title={trackData.title}
          />
        </div>
      )}
    </div>
  );
}
