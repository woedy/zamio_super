import { useState, useRef, useEffect } from "react";

export default function PlayerBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const track = {
    title: "Dream High",
    artist: "Kwame Soul",
    cover: "/covers/dreamhigh.jpg",
    url: "/music/dreamhigh.mp3",
  };

  useEffect(() => {
    const audio = audioRef.current;
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const value = e.target.value;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-neutral-900 text-white border-t border-neutral-800 z-50 shadow-xl">
      <audio ref={audioRef} src={track.url} preload="metadata" />

      <div className="max-w-6xl mx-auto flex items-center justify-between p-3 gap-6">
        {/* Track Info */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <img
            src={track.cover}
            alt="cover"
            className="w-12 h-12 rounded object-cover"
          />
          <div className="truncate">
            <p className="text-sm font-semibold truncate">{track.title}</p>
            <p className="text-xs text-white/60 truncate">{track.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center gap-6 text-xl">
            <button>⏮️</button>
            <button
              onClick={togglePlay}
              className="text-3xl focus:outline-none"
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button>⏭️</button>
          </div>
          <div className="flex items-center gap-2 w-full mt-2">
            <span className="text-xs text-white/50 w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-green-500"
            />
            <span className="text-xs text-white/50 w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Side: Like, Volume, Queue */}
        <div className="flex items-center gap-4 min-w-[150px] justify-end">
          <button onClick={() => setLiked(!liked)} className="text-lg">
            {liked ? "💚" : "🤍"}
          </button>
          <button title="Volume">🔊</button>
          <button title="Queue">🧾</button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}
