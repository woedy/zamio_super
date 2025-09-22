import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { baseUrl, publisherID } from '../../../constants';
import ButtonLoader from '../../../common/button_loader';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RevenueSplit = () => {

  const [writerSplit, setWriterSplit] = useState<string>('');
  const [publisherSplit, setPublisherSplit] = useState<string>('');
  const toNumber = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? NaN : n;
  };
  const total = (() => {
    const w = toNumber(writerSplit);
    const p = toNumber(publisherSplit);
    if (isNaN(w) || isNaN(p)) return NaN;
    return +(w + p).toFixed(2);
  })();


  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);



  const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      // Clear any previous error
      setInputError('');
    
      // Frontend validations
      const w = toNumber(writerSplit);
      const p = toNumber(publisherSplit);
      if (writerSplit === '' || isNaN(w)) {
        setInputError('Artist split required (number).');
        return;
      }
      if (publisherSplit === '' || isNaN(p)) {
        setInputError('Publisher split required (number).');
        return;
      }
      if (w < 0 || p < 0) {
        setInputError('Splits must be >= 0.');
        return;
      }
      if (w > 100 || p > 100) {
        setInputError('Splits must be <= 100.');
        return;
      }
      if (+(w + p).toFixed(2) !== 100) {
        setInputError('Artist + Publisher must equal 100%.');
        return;
      }
    

    
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('publisher_id', publisherID);
      formData.append('writer_split', String(w));
      formData.append('publisher_split', String(p));
    
      const url = '/api/accounts/complete-revenue-split/';
    
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
        console.log('Social updated successfully');
    
        // Move to next onboarding step (backend returns this)
        const nextStep = data.data.next_step;
    
        switch (nextStep) {
          case 'profile':
            navigate('/onboarding/profile');
            break;
          case 'revenue-split':
            navigate('/onboarding/revenue-split');
            break;
          case 'payment':
            navigate('/onboarding/payment');
            break;
          case 'link-artist':
            navigate('/onboarding/link-artist');
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
            🎧 Revenue Split
          </h2>
          <p className=" text-white text-center mb-8">
          Revenue split setup (e.g., 60% artist / 40% publisher)</p>


          <form onSubmit={handleSubmit} className="space-y-6">
         
            <div className="">
          
              <input
                type="number"
                name="writerSplit"
                placeholder="Artist Split"
                value={writerSplit}
                onChange={(e) => setWriterSplit(e.target.value)}
                className="w-full px-6 py-4 mb-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                name="report"
                placeholder="Publisher Split"
                value={publisherSplit}
                onChange={(e) => setPublisherSplit(e.target.value)}
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="text-white/80 text-sm mt-1">Total: {isNaN(total) ? '-' : `${total}%`}</div>
            </div>
     

            {/* Submit Button */}
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

          {/* Link to Register */}
          <p className=" text-white mt-6 text-center">
            <button
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await fetch('/api/accounts/skip-publisher-onboarding/', {
                    method: 'POST',
                    headers: { Authorization: `Token ${localStorage.getItem('token')}` },
                    body: new URLSearchParams({ publisher_id: String(publisherID), step: 'link-artist' }),
                  });
                } catch {}
                navigate('/onboarding/link-artist');
              }}
              className="underline text-white hover:text-blue-200"
            >
              Skip
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueSplit;
