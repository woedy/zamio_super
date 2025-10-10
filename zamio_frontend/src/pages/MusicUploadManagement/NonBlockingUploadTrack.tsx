import React, { useState, useEffect } from 'react';
import { Music2, CheckCircle, ArrowRight, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import NonBlockingUpload from '../../components/NonBlockingUpload';
import ContributorSplitManager from '../../components/ContributorSplitManager';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';

interface Genre {
  id: number;
  name: string;
}

interface Album {
  id: number;
  title: string;
}

interface UploadStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export default function NonBlockingUploadTrack() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [trackData, setTrackData] = useState({
    title: '',
    genre_id: '',
    album_id: '',
    release_date: '',
    explicit: false,
    lyrics: '',
  });
  
  const [genres, setGenres] = useState<Genre[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedTrackId, setUploadedTrackId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ''
  );

  const steps: UploadStep[] = [
    {
      id: 'metadata',
      title: 'Track Information',
      description: 'Enter basic track details',
      completed: false,
      active: currentStep === 0,
    },
    {
      id: 'audio',
      title: 'Audio Upload',
      description: 'Upload your audio file',
      completed: false,
      active: currentStep === 1,
    },
    {
      id: 'cover',
      title: 'Cover Art',
      description: 'Upload cover artwork',
      completed: false,
      active: currentStep === 2,
    },
    {
      id: 'contributors',
      title: 'Contributors',
      description: 'Manage contributor splits',
      completed: false,
      active: currentStep === 3,
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Final review and publish',
      completed: false,
      active: currentStep === 4,
    },
  ];

  useEffect(() => {
    fetchSupportData();
    
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchSupportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}api/artists/get-upload-track-support-data/?artist_id=${encodeURIComponent(getArtistId())}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${userToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch support data');
      }

      const data = await response.json();
      setGenres(data.data.genres || []);
      setAlbums(data.data.albums || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setTrackData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateMetadata = () => {
    if (!trackData.title.trim()) {
      setError('Track title is required');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 0 && !validateMetadata()) {
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAudioUploadComplete = (result: any) => {
    if (result.entity_details?.id) {
      setUploadedTrackId(result.entity_details.id);
      // Mark audio step as completed and move to cover art
      setCurrentStep(2);
    }
  };

  const handleCoverUploadComplete = (result: any) => {
    // Mark cover step as completed and move to contributors
    setCurrentStep(3);
  };

  const handleContributorsUpdated = () => {
    // Mark contributors step as completed and move to review
    setCurrentStep(4);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Track Information</h3>
            
            {/* Track Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Track Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={trackData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter track title"
                required
              />
            </div>

            {/* Genre and Album */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="genre_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  id="genre_id"
                  name="genre_id"
                  value={trackData.genre_id}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Genre</option>
                  {genres.map(genre => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="album_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Album
                </label>
                <select
                  id="album_id"
                  name="album_id"
                  value={trackData.album_id}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Album (Optional)</option>
                  {albums.map(album => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Release Date and Explicit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="release_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  id="release_date"
                  name="release_date"
                  value={trackData.release_date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="explicit"
                  name="explicit"
                  checked={trackData.explicit}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="explicit" className="ml-2 block text-sm text-gray-700">
                  Explicit Content
                </label>
              </div>
            </div>

            {/* Lyrics */}
            <div>
              <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 mb-2">
                Lyrics (Optional)
              </label>
              <textarea
                id="lyrics"
                name="lyrics"
                value={trackData.lyrics}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter track lyrics..."
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Upload Audio File</h3>
            <NonBlockingUpload
              uploadType="track_audio"
              metadata={trackData}
              onUploadComplete={handleAudioUploadComplete}
              onUploadError={(error) => setError(error)}
              acceptedFileTypes="audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/aac"
              maxFileSize={100 * 1024 * 1024} // 100MB
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Upload Cover Art</h3>
            {uploadedTrackId ? (
              <NonBlockingUpload
                uploadType="track_cover"
                metadata={{ track_id: uploadedTrackId }}
                onUploadComplete={handleCoverUploadComplete}
                onUploadError={(error) => setError(error)}
                acceptedFileTypes="image/jpeg,image/png,image/webp"
                maxFileSize={10 * 1024 * 1024} // 10MB
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Please complete audio upload first
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Manage Contributors</h3>
            {uploadedTrackId ? (
              <ContributorSplitManager
                trackId={uploadedTrackId}
                trackTitle={trackData.title}
                onSplitsUpdated={handleContributorsUpdated}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Please complete audio upload first
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Review & Publish</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium mb-4">Track Summary</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {trackData.title}</p>
                <p><strong>Genre:</strong> {genres.find(g => g.id.toString() === trackData.genre_id)?.name || 'Not selected'}</p>
                <p><strong>Album:</strong> {albums.find(a => a.id.toString() === trackData.album_id)?.title || 'Not selected'}</p>
                <p><strong>Release Date:</strong> {trackData.release_date || 'Not set'}</p>
                <p><strong>Explicit:</strong> {trackData.explicit ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Track upload completed successfully!</span>
              </div>
              <p className="text-green-700 text-sm mt-2">
                Your track has been uploaded and is being processed. You can now manage it from your dashboard.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold flex items-center mb-4">
          <Music2 className="w-7 h-7 mr-3" />
          Upload New Track
        </h2>
        <p className="text-gray-500">
          Upload your music with non-blocking processing and real-time status updates
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline ml-2">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.active
                    ? 'bg-emerald-600 text-white'
                    : step.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${step.active ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 mx-4 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 flex-1">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep === steps.length - 1 ? (
              <button
                onClick={() => navigate('/tracks')}
                className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                disabled={currentStep === 0 && !trackData.title.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}