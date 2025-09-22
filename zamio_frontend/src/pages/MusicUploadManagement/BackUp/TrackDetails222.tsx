import {
  Music,
  User,
  Calendar,
  Tag,
  CreditCard,
  Download,
  MapPin,
  UserPlus,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { baseUrl, baseUrlMedia, userToken } from '../../../constants';
import ChartOne from '../ChartOne';
import ChartThree from '../ChartThree';
import ChartTwo from '../ChartTwo';

import map from '../../images/map.png';
import hitzfm from '../../images/hitzfm.png';
import raggae from '../../images/raggae.jpg';

export default function TractDetails() {
  const [loading, setLoading] = useState(false);
  const [trackDetails, setTrackDetails] = useState([]);

  const location = useLocation();
  const { track_id } = location.state || {};

  // Audio Player
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', updateTime);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRangeChange = (e) => {
    const time = e.target.value;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Sample data for recent airplays
  const recentAirplays = [
    {
      station: 'Hitz FM',
      location: 'Accra',
      date: '(Apr. 20) 02:25 pm',
      song: 'Raggae Flow',
      duration: '2 min',
    },
    {
      station: 'Hitz FM',
      location: 'Accra',
      date: '(Apr. 20) 02:25 pm',
      song: 'Raggae Flow',
      duration: '2 min',
    },
    {
      station: 'Hitz FM',
      location: 'Accra',
      date: '(Apr. 20) 02:25 pm',
      song: 'Raggae Flow',
      duration: '2 min',
    },
    {
      station: 'Hitz FM',
      location: 'Accra',
      date: '(Apr. 20) 02:25 pm',
      song: 'Raggae Flow',
      duration: '2 min',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          baseUrl + `api/artists/get-track-details/?track_id=${track_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${userToken}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setTrackDetails(data.data);

        // OPTION 1: If the file is public
        const fullAudioUrl = `${baseUrlMedia}${data.data.audio_file}`;
        setAudioUrl(fullAudioUrl);

        // OR — OPTION 2: If the file is protected and needs a token
        /*
        const audioResponse = await fetch(fullAudioUrl, {
          headers: {
            Authorization: `Token ${userToken}`,
          },
        });
  
        const audioBlob = await audioResponse.blob();
        const blobUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(blobUrl);
        */
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex mb-5 gap-3">
        <div className="h-40 w-40 rounded overflow-hidden shadow-1">
          <img
            src={`${baseUrlMedia}${trackDetails?.cover_art}`}
            alt="Cover Art"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mb-6 w-100">
          <h2 className="text-2xl font-semibold flex items-center mb-2">
            <User className="w-6 h-6 mr-2" /> {trackDetails.title}
          </h2>
          <p className="text-gray-500 flex items-center">
            <Music className="w-4 h-4 mr-1" /> {trackDetails.track_id}
          </p>
          <p className="text-gray-500 flex items-center">
            <Music className="w-4 h-4 mr-1" /> {trackDetails.genre}
          </p>
          <p className="text-gray-500 flex items-center">
            <Calendar className="w-4 h-4 mr-1" /> Released on{' '}
            {trackDetails.release_date}
          </p>
          {trackDetails.artist_name && (
            <p className="text-gray-500 flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              {trackDetails.artist_name}
            </p>
          )}
          {/* Add more static artist details here */}
        </div>

        <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-lg p-6 flex flex-col items-center space-y-4">
          {audioUrl ? (
            <>
              <audio ref={audioRef} src={audioUrl} preload="metadata" />

              {/* Song Title (Optional) */}
              <h3 className="text-lg font-semibold text-center">Now Playing</h3>

              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center text-white text-xl transition"
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Time and Slider */}
              <div className="w-full flex flex-col space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleRangeChange}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-sm text-gray-300 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-400">Loading audio...</p>
          )}
        </div>
      </div>

      <div className="flex mb-3 gap-3">
        <Link to="/more-track-details">
          <button className="flex items-center px-4 py-2 bg-indigo-900 rounded-full hover:bg-indigo-800 transition">
            <UserPlus className="w-4 h-4 mr-2" /> More Info
          </button>
        </Link>
        <Link to="/edit-track-details" state={{ track_id: track_id }}>
          <button className="flex items-center px-4 py-2 bg-indigo-900 rounded-full hover:bg-indigo-800 transition">
            <UserPlus className="w-4 h-4 mr-2" /> Edit Track Info
          </button>
        </Link>

        <Link to="/track-contributors" state={{ track_id: track_id }}>
          <button className="flex items-center px-4 py-2 bg-indigo-900 rounded-full hover:bg-indigo-800 transition">
            <UserPlus className="w-4 h-4 mr-2" /> View Contributors
          </button>
        </Link>
        <Link to="/track-fingerprint-details">
          <button className="flex items-center px-4 py-2 bg-indigo-900 rounded-full hover:bg-indigo-800 transition">
            <UserPlus className="w-4 h-4 mr-2" /> Fingerprint Details
          </button>
        </Link>
        <Link to="/add-track-cover" state={{ track_id: track_id }}>
          <button className="flex items-center px-4 py-2 bg-indigo-900 rounded-full hover:bg-indigo-800 transition">
            <UserPlus className="w-4 h-4 mr-2" /> Change Cover
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <ChartOne />
        </div>
        <div>
          <ChartThree />
        </div>
        <div>
          <ChartTwo />
        </div>

        <div>
          {/* Map Section */}
          <div className="w-full lg:mt-0 bg-indigo-900/30 rounded-lg overflow-hidden">
            <div className="bg-indigo-800 py-3 px-4">
              <h3 className="font-semibold flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Airplays Locations
              </h3>
            </div>
            <div className="h-100">
              <img src={map} alt="Map" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h3 className="text-lg sm:text-xl font-semibold">Recent Airplays</h3>
          <button className="px-3 py-1 sm:px-4 sm:py-2 bg-gray dark:bg-graydark text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base">
            View All
          </button>
        </div>
        <div className="bg-gray dark:bg-indigo-900/20 shadow-1 rounded-lg overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-graydark">
                <th className="text-left py-3 px-2 sm:px-4">Station</th>
                <th className="text-left py-3 px-2 sm:px-4">Location</th>
                <th className="text-left py-3 px-2 sm:px-4">Date/time</th>
                <th className="text-left py-3 px-2 sm:px-4">Song Title</th>
                <th className="text-left py-3 px-2 sm:px-4">Duration</th>
              </tr>
            </thead>
            <tbody>
              {recentAirplays.map((play, index) => (
                <tr
                  key={index}
                  className="border-b border-indigo-800 hover:bg-indigo-100/50"
                >
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded mr-2">
                        <img
                          src={hitzfm}
                          alt="Station logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs sm:text-base">
                        {play.station}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-base">
                    {play.location}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-base">
                    {play.date}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded mr-2">
                        <img
                          src={raggae}
                          alt="Album art"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs sm:text-base">{play.song}</span>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-base">
                    {play.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
