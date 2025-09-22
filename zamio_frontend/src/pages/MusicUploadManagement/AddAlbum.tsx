import { useCallback, useEffect, useState } from 'react';
import { Music2Icon, UploadCloud, FileMusic, Plus } from 'lucide-react';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import ButtonLoader from '../../common/button_loader';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function AddAlbum() {
  const [albumData, setAlbumData] = useState({
    title: '',
    releaseDate: '', // Optional
  });
  const [inputError, setInputError] = useState(null); // "success", "error", null
  const [loading, setLoading] = useState(false);

  
  const navigate = useNavigate();
  
  



  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlbumData({ ...albumData, [name]: value });
  };


  const handleSubmit = async (e) => {
    setLoading(true);

    e.preventDefault();
 

    const formData = new FormData();
    formData.append('artist_id', getArtistId());
    formData.append('title', albumData.title);
    formData.append('release_date', albumData.releaseDate);



    try {
      const url = baseUrl + 'api/artists/add-album/';

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Token ${userToken}`,
          },
      },
    );

      const data = await response.json();
      if (!response.ok) {
        // Display the first error message from the errors object
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setInputError(errorMessages.join('\n'));
          setLoading(false);
        } else {
          setInputError(data.message || 'Failed to upload data');
          setLoading(false);
        }
        return; // Prevent further code execution
      }

        // Registration successful
        console.log('Album added successfully');
        navigate('/add-track', { state: { successMessage: `${albumData.title} added succesfully.` } });

        setLoading(false);


    } catch (error) {
      setInputError('error');
      setLoading(false);
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold flex items-center mb-4">
          <Music2Icon className="w-7 h-7 mr-3" /> Add New Album
        </h2>
        <p className="text-gray-500">Add All Your Albums here!</p>
      </div>

      {inputError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {inputError}</span>
        </div>
      )}

      <div className="bg-boxdark rounded-lg shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Album Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-white text-sm font-bold mb-2"
            >
              Album Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={albumData.title}
              onChange={handleChange}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
              placeholder="Enter album title"
              required
            />
          </div>

      
  
          {/* Release Date (Optional) */}
          <div>
            <label
              htmlFor="releaseDate"
              className="block text-white text-sm font-bold mb-2"
            >
              Release Date (Optional)
            </label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              value={albumData.releaseDate}
              onChange={handleChange}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
            />
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <UploadCloud className="w-5 h-5 mr-2" /> Add Album
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
