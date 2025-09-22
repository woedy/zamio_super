

export default function FanStreamingDashboard() {


  const userData = {
    username: 'kofiMusicLover',
    recentlyPlayed: [
      { track: 'Highlife Forever', artist: 'Ama Kwabena', date: '2025-07-12' },
      { track: 'Coastal Waves', artist: 'Elom Beats', date: '2025-07-12' },
    ],
    topGenres: ['Afrobeat', 'Highlife', 'Gospel'],
    favoriteArtists: ['Ama Kwabena', 'Elom Beats', 'Kojo Cue'],
    listeningTime: { weekly: 3.5, monthly: 12.7 }, // in hours
    badges: ['Supporter', 'Night Owl Listener', 'Radio Loyalist'],
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">🎧 My Streaming Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">
            Track your listening habits and support the artists you love.
          </p>
        </div>

        {/* Recently Played */}
        <div>
          <h2 className="text-lg font-semibold mb-2">📀 Recently Played</h2>
          <ul className="bg-slate-800 p-4 rounded-lg space-y-2 text-sm">
            {userData.recentlyPlayed.map((item, idx) => (
              <li key={idx} className="flex justify-between text-white/80">
                <span>
                  {item.track} —{' '}
                  <span className="text-white">{item.artist}</span>
                </span>
                <span className="text-white/40">{item.date}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Listening Stats + Top Genres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-5 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">📊 Listening Time</h3>
            <p className="text-white/80 text-sm">
              Weekly:{' '}
              <span className="font-bold text-white">
                {userData.listeningTime.weekly} hrs
              </span>
            </p>
            <p className="text-white/80 text-sm">
              Monthly:{' '}
              <span className="font-bold text-white">
                {userData.listeningTime.monthly} hrs
              </span>
            </p>
          </div>
          <div className="bg-slate-800 p-5 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">🎵 Top Genres</h3>
            <ul className="text-white/80 text-sm space-y-1">
              {userData.topGenres.map((genre, idx) => (
                <li key={idx}>• {genre}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Favorite Artists */}
        <div>
          <h2 className="text-lg font-semibold mb-2">❤️ Favorite Artists</h2>
          <div className="flex flex-wrap gap-3">
            {userData.favoriteArtists.map((artist, idx) => (
              <span
                key={idx}
                className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm"
              >
                {artist}
              </span>
            ))}
          </div>
        </div>

        {/* Badges / Achievements */}
        <div>
          <h2 className="text-lg font-semibold mb-2">🏆 Fan Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {userData.badges.map((badge, idx) => (
              <span
                key={idx}
                className="bg-sky-700/30 text-sky-300 px-3 py-1 rounded-full text-xs uppercase"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Stream Support Meter (Placeholder) */}
        <div className="bg-slate-800 p-6 rounded-lg mt-6">
          <h3 className="text-sm font-semibold mb-3">
            💸 Your Streaming Impact
          </h3>
          <p className="text-white/70 text-sm">
            You've contributed{' '}
            <span className="text-green-400 font-bold">₵5.80</span> to your
            favorite artists this month through your streaming activity!
          </p>
        </div>
      </div>
    </div>
  );
}
