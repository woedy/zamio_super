import { useState } from "react";

const demoArtist = {
  name: "Ama Soul",
  verified: true,
  bio: "Neo-soul & highlife fusion artist from Accra. Celebrating Ghanaian rhythm through voice and soul.",
  profileImage: "/artists/amasoul.jpg",
  followers: 3200,
  topTracks: [
    { id: 1, title: "Midnight Run", streams: 8700, cover: "/covers/midnight.jpg" },
    { id: 2, title: "Palmwine Dreams", streams: 7400, cover: "/covers/palmwine.jpg" },
    { id: 3, title: "Ashaiman Light", streams: 6100, cover: "/covers/ashaiman.jpg" },
  ],
  allSongs: [
    { title: "Highlife Morning", date: "2024-03-12", streams: 5100 },
    { title: "Cocoa Heart", date: "2024-01-22", streams: 4300 },
  ]
};

export default function FunArtistProfilePage() {
  const [following, setFollowing] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text-white">
      {/* Header */}
      <div className="flex items-center gap-6 mb-6">
        <img src={demoArtist.profileImage} alt="Artist" className="w-32 h-32 object-cover rounded-full border-4 border-green-500" />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {demoArtist.name}
            {demoArtist.verified && (
              <span className="text-green-400 text-sm bg-green-900 px-2 py-1 rounded-full">✔ Verified</span>
            )}
          </h1>
          <p className="text-white/70 max-w-xl mt-2">{demoArtist.bio}</p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setFollowing(!following)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              {following ? "Following ✓" : "Follow Artist"}
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded">
              💰 Tip Artist
            </button>
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">🔥 Top Tracks</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {demoArtist.topTracks.map(track => (
            <div key={track.id} className="bg-neutral-800 rounded-lg p-4 flex items-center gap-4">
              <img src={track.cover} alt={track.title} className="w-14 h-14 rounded" />
              <div>
                <p className="font-semibold">{track.title}</p>
                <p className="text-sm text-white/50">{track.streams.toLocaleString()} streams</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Songs Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">📀 All Releases</h2>
        <div className="bg-neutral-900 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-700 text-white/80">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Release Date</th>
                <th className="p-3">Streams</th>
              </tr>
            </thead>
            <tbody>
              {demoArtist.allSongs.map((song, i) => (
                <tr key={i} className="border-t border-neutral-700">
                  <td className="p-3">{song.title}</td>
                  <td className="p-3">{song.date}</td>
                  <td className="p-3">{song.streams.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Updates / Future */}
      <div className="mt-10 text-sm text-white/50">
        📣 Future: Fan wall, artist updates, tour dates, and merch drops.
      </div>
    </div>
  );
}
