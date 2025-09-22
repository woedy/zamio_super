import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {  baseUrl, publisherID } from '../../../constants';
import ButtonLoader from '../../../common/button_loader';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const PaymentInfo = () => {
  const [momo, setMomo] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


    const handleSubmit = async (e) => {
      e.preventDefault();
    
      // Clear any previous error
      setInputError('');
    
      // Frontend validations
      if (momo === '') {
        setInputError('Momo required.');
        return;
      }
    
      if (bankAccount === '') {
        setInputError('Bank Account required.');
        return;
      }
    

    
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('publisher_id', publisherID);
      formData.append('momo', momo);
      formData.append('bankAccount', bankAccount);
    
      const url = '/api/accounts/complete-publisher-payment/';
    
      try {
        setLoading(true);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
    
        const data = await response.json();
    
        if (!response.ok) {
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat();
            setInputError(errorMessages.join('\n'));
          } else {
            setInputError(data.message || 'Failed to update social.');
          }
          return;
        }
    
        // ✅ Successful submission
        console.log('Payment updated successfully');
    
        // Move to next onboarding step (backend returns this)
        const nextStep = data.data.next_step;
    
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
            navigate('/onboarding/track');
            break;
          case 'done':
            navigate('/dashboard');
            window.location.reload();
            break;
          default:
            navigate('/dashboard'); // fallback
            window.location.reload();

        }
    
      } catch (error) {
        console.error('Error updating profile:', error.message);
        setInputError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    const handleSkip = async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/accounts/skip-publisher-onboarding/', {
          method: 'POST',
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
          body: new URLSearchParams({ publisher_id: String(publisherID), step: 'done' }),
        });
      } catch {}
      navigate('/dashboard');
      window.location.reload();
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

            {/* Submit Button */}
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

          {/* Link to Register */}
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
