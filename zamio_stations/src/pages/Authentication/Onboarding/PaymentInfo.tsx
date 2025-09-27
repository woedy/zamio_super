import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStationId } from '../../../lib/auth';
import api from '../../../lib/api';
import ButtonLoader from '../../../common/button_loader';
import useStationOnboarding from '../../../hooks/useStationOnboarding';
import { getOnboardingRoute } from '../../../utils/onboarding';

const PaymentInfo = () => {
  const [momo, setMomo] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { details, refresh } = useStationOnboarding();

  useEffect(() => {
    if (details) {
      setMomo(details.momo_account ?? '');
      setBankAccount(details.bank_account ?? '');
    }
  }, [details]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setInputError('');

    if (!momo.trim() && !bankAccount.trim()) {
      setInputError('Provide at least one payout method.');
      return;
    }

    const formData = new FormData();
    formData.append('station_id', getStationId());
    formData.append('momo', momo);
    formData.append('bankAccount', bankAccount);

    const url = 'api/accounts/complete-station-payment/';

    try {
      setLoading(true);
      const resp = await api.post(url, formData);
      let nextStep = resp.data?.data?.next_step as string | undefined;
      if (!nextStep || nextStep === 'payment') {
        nextStep = 'done';
      }
      await refresh();

      switch (nextStep) {
        case 'profile':
          navigate(getOnboardingRoute('profile'));
          break;
        case 'staff':
          navigate(getOnboardingRoute('staff'));
          break;
        case 'report':
        case 'payment':
          navigate(getOnboardingRoute('payment'));
          break;
        case 'done':
          navigate(getOnboardingRoute('done'));
          break;
        default:
          navigate(getOnboardingRoute(nextStep as any));
      }
    } catch (error) {
      console.error('Error updating profile:', (error as any)?.message);
      setInputError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async (e) => {
    e.preventDefault();
    try {
      await api.post('api/accounts/complete-station-onboarding/', {
        station_id: getStationId(),
      });
      await refresh();
    } catch {}
    navigate(getOnboardingRoute('done'));
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
            🎧 Payment Info
          </h2>
          <p className=" text-white text-center mb-8">
            Update your payment information here
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="">
              <input
                type="text"
                name="momo"
                placeholder="Momo No."
                value={momo}
                onChange={(e) => setMomo(e.target.value)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="">
              <input
                type="text"
                name="bankAccount"
                placeholder="Bank Account No."
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
