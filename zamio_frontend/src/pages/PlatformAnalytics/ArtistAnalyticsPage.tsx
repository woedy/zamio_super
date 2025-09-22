import React, { useEffect, useState } from "react";
import {
  MapPin, BarChartBig, PieChart as PieChartIcon, Music2, Smartphone
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
} from "recharts";
import { baseUrl, userToken } from "../../constants";
import { getArtistId } from "../../lib/auth";
import RadioMap from "../../RadioMap";






const dummyPlays22 = [
  { date: "Jul 1", count: 20 },
  { date: "Jul 2", count: 32 },
  { date: "Jul 3", count: 15 },
  { date: "Jul 4", count: 50 },
  { date: "Jul 5", count: 41 },
];

const topStations222 = [
  { name: "YFM Accra", percent: 35 },
  { name: "Hitz FM", percent: 25 },
  { name: "Joy FM", percent: 20 },
  { name: "Others", percent: 20 },
];

const topSongs22 = [
  { title: "Blessings ft. XYZ", plays: 91 },
  { title: "Midnight Drive", plays: 74 },
  { title: "Rain On Me", plays: 63 },
  { title: "Freedom", plays: 41 },
];


const DEFAULT_TOP_STATIONS = [
  {
    name: "South Joannaberg FM",
    percent: 33,
  },
  {
    name: "Joshuafort FM",
    percent: 33,
  },
  {
    name: "Christineborough FM",
    percent: 33,
  },
  {
    name: "Others",
    percent: 1,
  },
];

const ArtistAnalyticsPage = () => {
    const [loading, setLoading] = useState(false);

    const [dummyPlays, setDummyPlays] = useState([]);
    const [topStations, setTopStations] = useState(DEFAULT_TOP_STATIONS);
    const [topSongs, setTopSongs] = useState([]);

    const radioStations = [
      { name: "Joy FM", latitude: 5.5600, longitude: -0.2100 },
      { name: "Peace FM", latitude: 5.5900, longitude: -0.2400 },
      { name: "YFM Accra", latitude: 5.5800, longitude: -0.2200 },
      { name: "Luv FM", latitude: 6.6885, longitude: -1.6244 },
      { name: "Skyy Power FM", latitude: 4.9437, longitude: -1.7587 },
      { name: "Cape FM", latitude: 5.1053, longitude: -1.2466 },
      { name: "Radio Central", latitude: 5.1066, longitude: -1.2474 },
      { name: "Radio Savannah", latitude: 9.4075, longitude: -0.8419 },
    ];
    
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            baseUrl + `api/artists/analytics/?artist_id=${getArtistId()}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${userToken}`,
              },
            }
          );
    
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
    
          const data = await response.json();
          setDummyPlays(data.data.playsOverTime);
          // Prefer backend-provided stations; fallback to provided payload key; else default
          if (data?.data?.topStations?.length) {
            setTopStations(data.data.topStations);
          } else if (data?.data?.setTopStations?.length) {
            setTopStations(data.data.setTopStations);
          }
          setTopSongs(data.data.topSongs);
    
      
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
    }, []);
    

  
  return (
    <div className="min-h-screen bg-whiten text-black dark:bg-slate-950 dark:text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChartBig className="text-indigo-400" /> Airplay & Streaming Analytics
        </h1>

        <div className="grid grid-cols-2 gap-4">

        {/* Airplay Map */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <MapPin className="text-green-400" /> Airplay Map – Ghana
          </h2>
          <div className="text-sm text-white/70 h-40 flex items-center justify-center bg-slate-700 rounded">
              <RadioMap radioStations={radioStations}/>
            </div>
        </section>


        {/* Plays Over Time */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <BarChartBig className="text-cyan-400" /> Plays Over Time
          </h2>
          <div className="bg-slate-800 p-4 rounded-lg text-gray-300">
            {dummyPlays?.map((day) => (
              <div key={day.date} className="flex justify-between py-1 text-sm">
                <span>{day.date}</span>
                <div className="bg-indigo-600 h-2 rounded w-[60%]">
                  <div
                    className="bg-green-400 h-2 rounded"
                    style={{ width: `${day.count * 2}%` }}
                  />
                </div>
                <span>{day.count}</span>
              </div>
            ))}
          </div>
        </section>

        </div>




        {/* Station Breakdown */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <PieChartIcon className="text-pink-400" /> Station Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-slate-800 h-48 rounded-lg flex items-center justify-center text-gray-400">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={topStations}
                    dataKey="percent"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {topStations.map((_, index) => {
                      const COLORS = [
                        "#F472B6", // pink-400
                        "#60A5FA", // blue-400
                        "#34D399", // emerald-400
                        "#FBBF24", // amber-400
                        "#A78BFA", // violet-400
                        "#38BDF8", // sky-400
                      ];
                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <ReTooltip formatter={(value: number) => `${value}%`} />
                </RPieChart>
              </ResponsiveContainer>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              {topStations?.map((station, i) => (
                <li key={i}>
                  {station.name}: <span className="text-white font-semibold">{station.percent}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Top Songs Played */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stroke dark:border-white/10">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Music2 className="text-yellow-400" /> Top Songs Played
          </h2>
          <ul className="divide-y divide-white/10">
            {topSongs?.map((song, i) => (
              <li key={i} className="py-3 flex justify-between text-sm text-gray-200">
                <span>{i + 1}. {song.title}</span>
                <span className="text-indigo-300">{song.plays} plays</span>
              </li>
            ))}
          </ul>
        </section>



      </div>
    </div>
  );
};

export default ArtistAnalyticsPage;
