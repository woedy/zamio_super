import { useState } from "react";

const demoData = {
  topSongs: [
    { rank: 1, title: "Jollof Anthem", artist: "King Kobi", plays: 9200, cover: "/covers/jollof.jpg" },
    { rank: 2, title: "Midnight Run", artist: "Ama Soul", plays: 8500, cover: "/covers/midnight.jpg" },
    { rank: 3, title: "Nima Dreams", artist: "Yaw Flex", plays: 8000, cover: "/covers/nima.jpg" },
  ],
  topArtists: [
    { rank: 1, name: "King Kobi", plays: 28000, avatar: "/artists/kobi.jpg" },
    { rank: 2, name: "Ama Soul", plays: 25300, avatar: "/artists/ama.jpg" },
    { rank: 3, name: "Yaw Flex", plays: 24000, avatar: "/artists/yaw.jpg" },
  ],
  regionalTop: [
    { region: "Accra", song: "Jollof Anthem", artist: "King Kobi" },
    { region: "Kumasi", song: "Midnight Run", artist: "Ama Soul" },
    { region: "Takoradi", song: "Vibe On", artist: "Flex B" },
  ],
};

export default function ChartsPage() {
  const [activeTab, setActiveTab] = useState("songs");

  return (
    <div className="max-w-6xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">🎶 Charts & Rankings</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("songs")}
          className={`px-4 py-2 rounded ${activeTab === "songs" ? "bg-green-600" : "bg-neutral-700"}`}
        >
          Top Songs
        </button>
        <button
          onClick={() => setActiveTab("artists")}
          className={`px-4 py-2 rounded ${activeTab === "artists" ? "bg-green-600" : "bg-neutral-700"}`}
        >
          Top Artists
        </button>
        <button
          onClick={() => setActiveTab("regions")}
          className={`px-4 py-2 rounded ${activeTab === "regions" ? "bg-green-600" : "bg-neutral-700"}`}
        >
          Regional Rankings
        </button>
      </div>

      {/* Section Views */}
      {activeTab === "songs" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoData.topSongs.map((song) => (
            <div key={song.rank} className="bg-neutral-800 p-4 rounded-lg shadow">
              <div className="flex gap-4 items-center">
                <span className="text-2xl font-bold text-green-400">{song.rank}</span>
                <img src={song.cover} alt={song.title} className="w-14 h-14 rounded" />
                <div>
                  <p className="font-semibold">{song.title}</p>
                  <p className="text-sm text-white/60">{song.artist}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/50">Total Plays: {song.plays.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "artists" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoData.topArtists.map((artist) => (
            <div key={artist.rank} className="bg-neutral-800 p-4 rounded-lg flex items-center gap-4">
              <span className="text-2xl font-bold text-yellow-400">{artist.rank}</span>
              <img src={artist.avatar} alt={artist.name} className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-semibold">{artist.name}</p>
                <p className="text-sm text-white/50">{artist.plays.toLocaleString()} plays</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "regions" && (
        <div className="space-y-4">
          {demoData.regionalTop.map((entry) => (
            <div key={entry.region} className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center">
              <p>
                <strong>{entry.region}:</strong> {entry.song} – <em>{entry.artist}</em>
              </p>
              <button className="text-green-400 text-sm">Play</button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-sm text-white/50">
        📅 Charts update every <strong>Sunday</strong>. Based on combined radio + streaming data.
      </div>
    </div>
  );
}
