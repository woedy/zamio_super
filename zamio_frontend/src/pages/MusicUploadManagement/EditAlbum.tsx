import { useCallback, useEffect, useState } from 'react';
import { Music2, Save, ArrowLeft, Image } from 'lucide-react';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import ButtonLoader from '../../common/button_loader';
import { useLocation, useNavigate } from 'react-router-dom';
import EditHistory from '../../components/EditHistory';

export default function EditAlbum() {
  const [albumData, setAlbumData] = useState({
    title: '',
    release_date: '',
    upc_code: '',
  });
  const [inputError, setInputError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [coverArtFile, setCoverArtFile] = useState(null);
  const [coverArtPreview, setCoverArtPreview] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { album_id } = location.state || {};

  const fetchData = useCallback(async () => {
    setInitialLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}api/artists/get-edit-album-support-data/?artist_id=${encodeURIComponent(
          getArtistId(),
        )}&album_id=${encodeURIComponent(album_id)}`,
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
      
      const albumDetails = data.data.album_details;
      setAlbumData({
        title: albumDetails.title || '',
        release_date: albumDetails.release_date?.split('T')[0] || '',
        upc_code: albumDetails.upc_code || '',
      });
      
      // Set cover art preview if exists
      if (albumDetails.cover_art) {
        setCoverArtPreview(albumDetails.cover_art);
      }
      
      console.log('Album data loaded:', data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setInputError('Failed to load album data. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  }, [album_id]);

  useEffect(() => {
    if (album_id) {
      fetchData();
    } else {
      setInputError('Album ID is required');
      setInitialLoading(false);
    }
  }, [fetchData, album_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlbumData({ ...albumData, [name]: value });
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
    formData.append('album_id', album_id);
    formData.append('artist_id', getArtistId());
    formData.append('title', albumData.title);
    formData.append('release_date', albumData.release_date);
    formData.append('upc_code', albumData.upc_code);

    // Add cover art if selected
    if (coverArtFile) {
      formData.append('cover_art', coverArtFile);
    }

    try {
      const url = baseUrl + 'api/artists/edit-album/';

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
          setInputError(data.message || 'Failed to update album');
        }
        return;
      }

      // Update successful
      console.log('Album updated successfully');
      setSuccessMessage(`${albumData.title} updated successfully!`);
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
        navigate(-1); // Go back to previous page
      }
    } else {
      navigate(-1);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading album details...</p>
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
              <Music2 className="w-7 h-7 mr-3" /> Edit Album Details
            </h2>
            <p className="text-gray-500">Update your album information and settings</p>
          </div>
          <button
            onClick={handleCancel}
            className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
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
          {/* Album Title */}
          <div>
            <label htmlFor="title" className="block text-emerald-200 text-sm font-bold mb-2">
              Album Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={albumData.title}
              onChange={handleChange}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
              placeholder="Enter album title"
              required
            />
          </div>

          {/* Release Date and UPC Code Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="release_date" className="block text-emerald-200 text-sm font-bold mb-2">
                Release Date
              </label>
              <input
                type="date"
                id="release_date"
                name="release_date"
                value={albumData.release_date}
                onChange={handleChange}
                className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
              />
            </div>

            <div>
              <label htmlFor="upc_code" className="block text-emerald-200 text-sm font-bold mb-2">
                UPC Code
              </label>
              <input
                type="text"
                id="upc_code"
                name="upc_code"
                value={albumData.upc_code}
                onChange={handleChange}
                className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
                placeholder="Enter UPC code (optional)"
              />
            </div>
          </div>

          {/* Cover Art Upload */}
          <div>
            <label className="block text-emerald-200 text-sm font-bold mb-2">
              Album Cover Art
            </label>
            <div className="flex items-start space-x-4">
              {/* Current/Preview Image */}
              {coverArtPreview && (
                <div className="flex-shrink-0">
                  <img
                    src={coverArtPreview}
                    alt="Album cover preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                  />
                </div>
              )}
              
              {/* Upload Area */}
              <div className="flex-1">
                <div className="relative border rounded-md border-dashed border-indigo-700 bg-graydark py-6 px-4 flex flex-col items-center justify-center">
                  <Image className="w-10 h-10 text-emerald-300 mb-3" />
                  <p className="text-sm text-gray-400 text-center mb-2">
                    Upload new album cover art
                  </p>
                  <p className="text-xs text-gray-500 text-center mb-3">
                    JPEG, PNG, WebP (Max 10MB)
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

      {/* Edit History */}
      {album_id && (
        <div className="mt-8">
          <EditHistory 
            resourceType="album"
            resourceId={album_id}
            title={albumData.title}
          />
        </div>
      )}
    </div>
  );
}