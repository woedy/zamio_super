import React, { useState } from 'react';
import ButtonLoader from '../../common/button_loader';
import { UploadCloud } from 'lucide-react';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import { useLocation, useNavigate } from 'react-router-dom';

const CoverUploader = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [inputError, setInputError] = useState(null); // "success", "error", null
  
  const navigate = useNavigate();

  const location = useLocation();
  const { track_id } = location.state || {};


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file); // <-- store actual file here
    } else {
      setImagePreview(null);
      setSelectedFile(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
    formData.append('track_id', track_id);
    formData.append('artist_id', getArtistId());
    formData.append('photo', selectedFile); // <-- correct usage
  
    try {
      const url = baseUrl + 'api/artists/upload-track-coverart/';
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Token ${userToken}`,
          // DO NOT set Content-Type manually with FormData!
        },
      });
  
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setInputError(errorMessages.join('\n'));
        } else {
          setInputError(data.message || 'Failed to upload data');
        }
        setLoading(false);
        return;
      }
  
      // Success
      console.log('Cover added successfully');
      navigate('/add-track-contributor', {
        state: {
          successMessage: `Cover added succesfully. Now add contributors.`,
          track_id: `${track_id}`,
        },
      });
      setLoading(false);
    } catch (error) {
      setInputError('Upload failed. Please try again.');
      setLoading(false);
      console.error('Upload error:', error);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">


      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stepper */}
        <div className="mb-4 flex items-center space-x-4 text-sm">
          {[
            { label: 'Upload' },
            { label: 'Cover Art', active: true },
            { label: 'Contributors' },
            { label: 'Review' },
          ].map((s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${
                  s.active ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-700'
                }`}
              >
                {i + 1}
              </div>
              <span className={`mr-4 ${s.active ? 'text-gray-900' : 'text-gray-600'}`}>{s.label}</span>
              {i < 3 && <div className="w-10 h-px bg-gray-300 mr-4" />}
            </div>
          ))}
        </div>
      {inputError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {inputError}</span>
        </div>
      )}

        <div className="bg-boxgray w-full max-w-md rounded-xl shadow-lg p-6 text-center space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Upload Cover Art
          </h2>

          <label
            htmlFor="cover-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
          >
            <span className="text-gray-500">Click or drag image here</span>
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              required
            />
          </label>

          {imagePreview && (
            <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden shadow">
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

          {/* Upload Button */}
          <div className="flex justify-center">
            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <UploadCloud className="w-5 h-5 mr-2" /> Update Track
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CoverUploader;
