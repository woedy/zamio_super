import React, { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublisherId } from '../../../constants';
import ButtonLoader from '../../../common/button_loader';
import api from '../../../lib/api';
import {
  extractApiErrorMessage,
  navigateToOnboardingStep,
  skipPublisherOnboarding,
} from '../../../utils/onboarding';

const RevenueSplit = () => {
  const [writerSplit, setWriterSplit] = useState<string>('');
  const [publisherSplit, setPublisherSplit] = useState<string>('');
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const publisherId = getPublisherId();

  const total = useMemo(() => {
    const w = parseFloat(writerSplit);
    const p = parseFloat(publisherSplit);
    if (Number.isNaN(w) || Number.isNaN(p)) return NaN;
    return +(w + p).toFixed(2);
  }, [writerSplit, publisherSplit]);

  const validateSplits = () => {
    const w = parseFloat(writerSplit);
    const p = parseFloat(publisherSplit);
    if (writerSplit.trim() === '' || Number.isNaN(w)) {
      setInputError('Writer split required (number).');
      return false;
    }
    if (publisherSplit.trim() === '' || Number.isNaN(p)) {
      setInputError('Publisher split required (number).');
      return false;
    }
    if (w < 0 || p < 0) {
      setInputError('Splits must be greater than or equal to 0.');
      return false;
    }
    if (w > 100 || p > 100) {
      setInputError('Splits must be less than or equal to 100.');
      return false;
    }
    if (+((w + p).toFixed(2)) !== 100) {
      setInputError('Writer + Publisher must equal 100%.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInputError('');

    if (!validateSplits()) {
      return;
    }

    if (!publisherId) {
      setInputError('Missing publisher session. Please sign in again.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('api/accounts/complete-revenue-split/', {
        publisher_id: publisherId,
        writer_split: parseFloat(writerSplit),
        publisher_split: parseFloat(publisherSplit),
      });

      const nextStep = response.data?.data?.next_step as string | undefined;
      navigateToOnboardingStep(navigate, nextStep);
    } catch (error) {
      console.error('Error updating revenue split:', error);
      setInputError(extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!publisherId) {
      navigate('/sign-in');
      return;
    }
    try {
      const { redirect_step } = await skipPublisherOnboarding(publisherId, 'link-artist');
      navigateToOnboardingStep(navigate, redirect_step, { reloadOnDone: false });
    } catch (error) {
      console.error('Failed to skip revenue split step:', error);
      setInputError(extractApiErrorMessage(error));
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center">
      <div className="w-full max-w-2xl px-6">
        <h2 className="text-5xl font-bold text-white text-center mb-8">ZamIO</h2>

        {inputError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {inputError}</span>
          </div>
        )}

        <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-md w-full border border-white/20 shadow-xl">
          <h2 className="text-4xl font-bold text-white text-center mb-4">🎧 Revenue Split</h2>
          <p className=" text-white text-center mb-8">
            Revenue split setup (e.g., 60% writer / 40% publisher)
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="number"
                name="writerSplit"
                placeholder="Writer Split"
                value={writerSplit}
                onChange={(e) => setWriterSplit(e.target.value)}
                className="w-full px-6 py-4 mb-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="publisherSplit"
                placeholder="Publisher Split"
                value={publisherSplit}
                onChange={(e) => setPublisherSplit(e.target.value)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="text-white/80 text-sm mt-1">Total: {Number.isNaN(total) ? '-' : `${total}%`}</div>
            </div>

            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-4 rounded-lg mt-6 "
              >
                Update split
              </button>
            )}
          </form>

          <p className=" text-white mt-6 text-center">
            <button onClick={handleSkip} className="underline text-white hover:text-blue-200">
              Skip
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueSplit;
