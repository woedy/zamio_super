import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const MOCK_TRACKS = [
  { id: 1, title: "Sunrise Drive", audioUrl: "/audio/track1.mp3" },
  { id: 2, title: "Neon Nights", audioUrl: "/audio/track2.mp3" },
];

const StreamPlayer = ({ funId }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [audio, setAudio] = useState(null);

  const timerRef = useRef(null);

  const track = MOCK_TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(track.audioUrl);
    setAudio(newAudio);
    setStartTime(null);
    setIsPlaying(false);
  }, [currentTrackIndex]);

  const handlePlay = () => {
    if (!audio) return;
    audio.play();
    setIsPlaying(true);
    setStartTime(new Date());
  };

  const handlePause = async () => {
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);

    if (startTime) {
      const stopTime = new Date();
      const durationSeconds = Math.floor((stopTime - startTime) / 1000);

      // Only log if stream > 30s
      if (durationSeconds >= 30) {
        await axios.post("/api/streamlogs/", {
          track_id: track.id,
          fun_id: funId,
          start_time: startTime.toISOString(),
          stop_time: stopTime.toISOString(),
          duration: durationSeconds,
        });
        console.log(`✅ Stream logged: ${durationSeconds}s`);
      } else {
        console.log(`⏸️ Not logging — duration too short (${durationSeconds}s)`);
      }
    }
  };

  const handleNext = () => {
    handlePause(); // Ensure log before switching
    setCurrentTrackIndex((prev) => (prev + 1) % MOCK_TRACKS.length);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">{track.title}</h2>

      <div className="flex items-center justify-between mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={isPlaying ? handlePause : handlePlay}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StreamPlayer;
