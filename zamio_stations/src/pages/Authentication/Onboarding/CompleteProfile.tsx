import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStationId } from '../../../lib/auth';
import api from '../../../lib/api';
import ButtonLoader from '../../../common/button_loader';
import LocationSearch from '../../../components/LocationSearch';
import useStationOnboarding from '../../../hooks/useStationOnboarding';
import { getOnboardingRoute } from '../../../utils/onboarding';
import toast from 'react-hot-toast';

const CompleteProfile = () => {
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamUrlError, setStreamUrlError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { details, refresh } = useStationOnboarding();

  useEffect(() => {
    if (details) {
      setBio(details.bio ?? '');
      setCountry(details.country ?? '');
      setRegion(details.region ?? '');
      setLocationName(details.location_name ?? '');
      setLat(details.lat ?? null);
      setLng(details.lng ?? null);
      setStreamUrl(details.stream_url ?? '');
      if (typeof details.photo === 'string' && details.photo) {
        setImagePreview(details.photo);
      } else {
        setImagePreview(null);
      }
    }
  }, [details]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file); // <-- store actual file here
    } else {
      setImagePreview(null);
      setSelectedFile(null);
    }
  };

  const validateStreamUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
    
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setStreamUrlError('Stream URL must use HTTP or HTTPS protocol');
        return false;
      }
      setStreamUrlError('');
      return true;
    } catch {
      setStreamUrlError('Please enter a valid URL (e.g., https://stream.example.com/live)');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Clear any previous error
    setInputError('');
    setStreamUrlError('');
  
    // Frontend validations
    if (bio === '') {
      setInputError('Bio required.');
      return;
    }
  
    if (country === '') {
      setInputError('Country required.');
      return;
    }
  
    if (region === '') {
      setInputError('Region required.');
      return;
    }
  
    if (!selectedFile && !details?.photo) {
      setInputError('Profile photo required.');
      return;
    }

    // Validate stream URL if provided
    if (!validateStreamUrl(streamUrl)) {
      return;
    }

    // Prepare FormData for file upload
    const formData = new FormData();
    formData.append('station_id', getStationId());
    formData.append('bio', bio);
    formData.append('country', country);
    formData.append('region', region);
    if (locationName) {
      formData.append('location_name', locationName);
    }
    if (lat !== null) {
      formData.append('lat', lat.toString());
    }
    if (lng !== null) {
      formData.append('lng', lng.toString());
    }
    if (streamUrl) {
      formData.append('stream_url', streamUrl);
    }
    if (selectedFile) {
      formData.append('photo', selectedFile);
    }

    const url = 'api/accounts/complete-station-profile/';

    try {
      setLoading(true);
      const resp = await api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      let nextStep = resp.data?.data?.next_step as string | undefined;
      const photoUrl = resp.data?.data?.photo;
      const streamTestResult = resp.data?.data?.stream_test_result;
      
      // Update local state and storage with the new photo URL if available
      if (photoUrl) {
        setImagePreview(photoUrl);
        // Save to local storage for persistence
        localStorage.setItem('photo', photoUrl);
      }
      
      // Handle stream URL test results
      if (streamTestResult && streamUrl) {
        if (streamTestResult.accessible) {
          toast.success(`Stream URL validated successfully: ${streamTestResult.message}`);
        } else {
          toast.warning(`Stream URL validation warning: ${streamTestResult.message}`);
        }
      }
      
      if (!nextStep || nextStep === 'profile') {
        nextStep = 'staff';
      }
      await refresh({ silent: true });

      switch (nextStep) {
        case 'profile':
          navigate(getOnboardingRoute('profile'));
          break;
        case 'staff':
          navigate(getOnboardingRoute('staff'));
          break;
        case 'payment':
          navigate(getOnboardingRoute('payment'));
          break;
        case 'done':
          navigate(getOnboardingRoute('done'));
          window.location.reload();
          break;
        default:
          navigate(getOnboardingRoute(nextStep as any));
          window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setInputError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center">
      <div className="w-full max-w-2xl px-6">
        <h2 className="text-5xl font-bold text-white text-center mb-8">
          ZamIO
        </h2>

        {inputError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {inputError}</span>
          </div>
        )}

        <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-md w-full border border-white/20 shadow-xl">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            🎧 Complete Profile
          </h2>
          <p className=" text-white text-center mb-8">
            Update your personal information here
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="">
              <textarea
                name="bio"
                placeholder="Enter Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="">
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="">
              <input
                type="text"
                name="region"
                placeholder="Region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="">
              <LocationSearch
                value={locationName}
                onChange={(value, latitude, longitude) => {
                  setLocationName(value);
                  if (latitude !== undefined) setLat(latitude);
                  if (longitude !== undefined) setLng(longitude);
                }}
                placeholder="Search for your specific location (optional)"
                className="w-full"
              />
              <p className="text-white/70 text-sm mt-2">
                This helps us provide location-relevant features and analytics
              </p>
            </div>

            <div className="">
              <input
                type="url"
                name="stream_url"
                placeholder="Live Stream URL (optional) - e.g., https://stream.example.com/live"
                value={streamUrl}
                onChange={(e) => {
                  setStreamUrl(e.target.value);
                  if (streamUrlError) {
                    validateStreamUrl(e.target.value);
                  }
                }}
                onBlur={() => validateStreamUrl(streamUrl)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {streamUrlError && (
                <p className="text-red-300 text-sm mt-2">{streamUrlError}</p>
              )}
              <p className="text-white/70 text-sm mt-2">
                Provide your live stream URL so we can monitor your broadcasts for royalty tracking
              </p>
            </div>

            <div>
              <label
                htmlFor="cover-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              >
                <span className="text-white">
                  Click to add profile photo here
                </span>
                
           
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
             
              </label>

              {imagePreview && (
                <div className="relative w-48 h-48 mt-5 mx-auto rounded-lg overflow-hidden shadow">
                  <img
                    src={imagePreview}
                    alt="Cover Preview"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center text-white text-sm">
                    Preview
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-4 rounded-lg mt-6 "
              >
                Update Profile
              </button>
            )}
          </form>

          {/* Link to Register */}
          <p className=" text-white mt-6 text-center">
            <button
              className="underline text-white hover:text-blue-200"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await api.post('api/accounts/skip-station-onboarding/', {
                    station_id: getStationId(),
                    step: 'staff',
                  });
                  await refresh({ silent: true });
                } catch {}
                navigate(getOnboardingRoute('staff'));
              }}
            >
              Skip
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
