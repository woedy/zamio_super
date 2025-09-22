export default function DiscoveryPage() {
    const demoData = {
        trendingTracks: [
          { title: "Ghetto Vibes", artist: "Kojo Flex", cover: "/covers/ghetto.jpg" },
          { title: "Anadwo Yede", artist: "Miz Dee", cover: "/covers/anadwo.jpg" },
        ],
        genres: ["Afrobeat", "Gospel", "Highlife", "Drill", "Hiplife", "Afropop"],
        topByRegion: {
          Accra: ["Night Cruise – JayMelo", "W’ani Aba – NanaBlaq"],
          Kumasi: ["Drill Empire – K’sound", "Obaa Yaa – Kofi Soul"],
        },
      };
      
    return (
      <div className="min-h-screen bg-whiten text-black dark:bg-slate-950 dark:text-white px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-12">
  
          {/* Header */}
          <header className="space-y-2">
            <h1 className="text-2xl font-bold">🔍 Discover Music</h1>
            <p className="text-white/60 text-sm">Explore the latest releases, top hits by region, and your next favorite genre.</p>
          </header>
  
          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="Search by artist, track, genre..."
              className="w-full bg-slate-800 text-white p-3 rounded-lg focus:outline-none placeholder-white/40"
            />
          </div>
  
          {/* Home Feed - Trending Picks */}
          <section>
            <h2 className="text-lg font-semibold mb-3">🔥 Trending Now</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {demoData.trendingTracks.map((track, idx) => (
                <div key={idx} className="bg-slate-800 rounded-lg overflow-hidden shadow hover:shadow-lg">
                  <img src={track.cover} alt={track.title} className="w-full h-36 object-cover" />
                  <div className="p-3">
                    <h3 className="text-sm font-bold">{track.title}</h3>
                    <p className="text-xs text-white/60">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
  
          {/* Genre Explorer */}
          <section>
            <h2 className="text-lg font-semibold mb-3">🎧 Explore by Genre</h2>
            <div className="flex flex-wrap gap-3">
              {demoData.genres.map((genre, idx) => (
                <span key={idx} className="bg-pink-400/10 border border-pink-400/30 text-pink-300 px-4 py-1 rounded-full text-sm hover:bg-pink-400/20 cursor-pointer">
                  {genre}
                </span>
              ))}
            </div>
          </section>
  
          {/* Top by Region */}
          <section>
            <h2 className="text-lg font-semibold mb-3">📍 Top Songs by Region</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(demoData.topByRegion).map(([region, songs], idx) => (
                <div key={idx} className="bg-slate-800 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">{region}</h3>
                  <ul className="text-sm text-white/80 space-y-1">
                    {songs.map((song, i) => (
                      <li key={i}>• {song}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
  
          {/* Smart Recommendations (Placeholder for Future) */}
          <section>
            <h2 className="text-lg font-semibold mb-3">🤖 Recommended for You</h2>
            <p className="text-white/50 text-sm italic">Based on your listening patterns — coming soon!</p>
          </section>
  
        </div>
      </div>
    );
  }
  
