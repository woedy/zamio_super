import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { getArtistId } from '../../../lib/auth';
import ButtonLoader from '../../../common/button_loader';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Publisher = () => {
  const [publisherId, setPublisherId] = useState('');
  const [publishers, setPublishers] = useState<{ publisher_id: string; company_name: string }[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available publishers for selection
    const load = async () => {
      try {
        const res = await api.get('api/accounts/list-publishers/');
        const list = res?.data?.data?.publishers || [];
        setPublishers(list);
      } catch (e) {
        // Non-blocking; keep manual input fallback if needed
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous error
    setInputError('');

    // Frontend validations
    if (isChecked === false) {
      if (publisherId === '') {
        setInputError('Publisher required.');
        return;
      }
    }

    // Prepare FormData for file upload
    const formData = new FormData();
    formData.append('artist_id', getArtistId());
    formData.append('publisher_id', publisherId);
    formData.append('self_publish', isChecked);

    const url = 'api/accounts/complete-artist-publisher/';

    try {
      setLoading(true);
      const response = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Move to next onboarding step (backend returns this)
      const nextStep = response.data?.data?.next_step;

      switch (nextStep) {
        case 'profile':
          navigate('/onboarding/profile');
          break;
        case 'social-media':
          navigate('/onboarding/social-media');
          break;
        case 'payment':
          navigate('/onboarding/payment');
          break;
        case 'publisher':
          navigate('/onboarding/publisher');
          break;
        case 'track':
          navigate('/dashboard', { replace: true });
          window.location.reload();
          break;
        case 'done':
          navigate('/dashboard', { replace: true });
          window.location.reload();
          break;
        default:
          navigate('/dashboard', { replace: true }); // fallback
          window.location.reload();
      }
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.errors) {
        const msgs = Object.values(data.errors).flat() as string[];
        setInputError(msgs.join('\n'));
      } else {
        console.error('Error updating profile:', error?.message);
        setInputError(data?.message || 'Failed to update publisher.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async (e) => {
    e.preventDefault();
    try {
      await api.post('api/accounts/skip-artist-onboarding/', {
        artist_id: getArtistId(),
        // Keep resume point on this step so user returns here next time
        step: 'publisher',
      });
    } catch (err) {
      // non-blocking
    } finally {
      navigate('/dashboard', { replace: true });
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

        <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-md w-full border border-white/10 shadow-xl">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            🎧 Add Publisher
          </h2>
          <p className=" text-white text-center mb-8">
            Add your publishing affiliation here
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white mb-2">Select Publisher</label>
              <select
                name="publisher_id"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                disabled={isChecked}
                className="w-full px-6 py-3 bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="" className="bg-[#1a2a6c]">-- Choose a publisher --</option>
                {publishers.map((p) => (
                  <option key={p.publisher_id} value={p.publisher_id} className="bg-[#1a2a6c]">
                    {p.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleChange}
                className=" px-2 py-2 bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <p className="text-white ml-3">Self-Published</p>
            </div>

            {/* Submit Button */}
            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-4 rounded-lg mt-6 "
              >
                Add Publisher
              </button>
            )}
          </form>

          {/* Link to Register */}
          <div className="flex gap-3 items-center justify-center mt-8">
            <button className="px-5 bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 rounded-lg mt-6 ">
              Add Tracks
            </button>
            <button
              className=" underline text-white hover:text-blue-200 mt-6 text-center"
              onClick={handleSkip}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publisher;
