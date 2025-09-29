import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublisherId } from '../../../constants';
import ButtonLoader from '../../../common/button_loader';
import api from '../../../lib/api';
import {
  extractApiErrorMessage,
  navigateToOnboardingStep,
  skipPublisherOnboarding,
} from '../../../utils/onboarding';

const PaymentInfo = () => {
  const [momo, setMomo] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const publisherId = getPublisherId();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInputError('');

    if (!momo.trim()) {
      setInputError('Mobile money account required.');
      return;
    }
    if (!bankAccount.trim()) {
      setInputError('Bank account required.');
      return;
    }
    if (!publisherId) {
      setInputError('Missing publisher session. Please sign in again.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('api/accounts/complete-publisher-payment/', {
        publisher_id: publisherId,
        momo,
        bankAccount,
      });

      const nextStep = response.data?.data?.next_step as string | undefined;
      navigateToOnboardingStep(navigate, nextStep);
    } catch (error) {
      console.error('Error updating payment info:', error);
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
      const { redirect_step } = await skipPublisherOnboarding(publisherId, 'done');
      navigateToOnboardingStep(navigate, redirect_step, { reloadOnDone: false });
    } catch (error) {
      console.error('Failed to skip payment step:', error);
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
          <h2 className="text-4xl font-bold text-white text-center mb-4">🎧 Payment Info</h2>
          <p className=" text-white text-center mb-8">Update your payment information here</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="momo"
                placeholder="Mobile Money Account"
                value={momo}
                onChange={(e) => setMomo(e.target.value)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <input
                type="text"
                name="bankAccount"
                placeholder="Bank Account Number"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-4 rounded-lg mt-6 "
              >
                Update info
              </button>
            )}
          </form>

          <p className=" text-white mt-6 text-center">
            <button
              className=" underline text-white hover:text-blue-200 mt-6 text-center"
              onClick={handleSkip}
            >
              Skip
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;
