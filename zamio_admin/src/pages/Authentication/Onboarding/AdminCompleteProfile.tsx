import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonLoader from '../../../common/button_loader';
import {
  completeAdminProfile,
  fetchAdminOnboardingStatus,
  type AdminOnboardingStatus,
  type ApiErrorPayload,
} from '../../../services/authService';

const AdminCompleteProfile: React.FC = () => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    fetchAdminOnboardingStatus()
      .then((res) => {
        if (!isMounted) return;
        const status: AdminOnboardingStatus | undefined = res.data?.data;
        if (!status) return;

        if (status.next_step === 'done') {
          navigate('/dashboard', { replace: true });
          return;
        }

        const profile = status.profile ?? {};
        setAddress(profile.address ?? '');
        setCity(profile.city ?? '');
        setPostalCode(profile.postal_code ?? '');
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err instanceof AxiosError) {
          const data = err.response?.data as ApiErrorPayload | undefined;
          const errorBag = data?.errors;
          if (errorBag && typeof errorBag === 'object') {
            const adminErrors = (errorBag as Record<string, string[] | string>)['admin'];
            if (adminErrors) {
              const message = Array.isArray(adminErrors) ? adminErrors[0] : adminErrors;
              setError(message ?? 'Unable to load admin profile.');
              return;
            }
          }
        }
        setError('Unable to load admin profile.');
      })
      .finally(() => {
        if (isMounted) {
          setInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await completeAdminProfile({
        address: address || undefined,
        city,
        postal_code: postalCode,
      });
      const next = res?.data?.data?.next_step;
      if (next === 'done') {
        setSuccess('Profile completed successfully.');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        const payload = err.response?.data as ApiErrorPayload | undefined;
        const bag = payload?.errors;
        if (bag && typeof bag === 'object') {
          const messages = Object.values(bag as Record<string, string[] | string>)
            .flatMap((value) => (Array.isArray(value) ? value : [value]))
            .filter(Boolean);
          if (messages.length) {
            setError(messages.join('\n'));
            return;
          }
        }
        if (payload?.message) {
          setError(payload.message);
          return;
        }
      }
      setError('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-4 text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-4">
      <div className="w-full max-w-xl bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Complete Admin Profile</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Address (optional)</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white mb-1">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-white mb-1">Postal Code</label>
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Postal Code"
              />
            </div>
          </div>
          <div>
            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded"
              >
                Save and Continue
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCompleteProfile;

