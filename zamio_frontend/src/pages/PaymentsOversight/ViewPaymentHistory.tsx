import { Wallet, ArrowDownToLine, Info, BarChart3, CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getArtistId } from '../../lib/auth';
import api from '../../lib/api';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

type WalletSources = {
  radio?: number;
  distro?: number;
};

type RoyaltyRates = {
  radio?: string;
};

type WalletHistoryItem = {
  date: string;
  amount: number;
  method: string;
  status: string;
};

type RoyaltyPoint = {
  month: string;
  revenue: number;
  plays: number;
  stations: number;
};

type WalletType = {
  total?: number;
  sources?: WalletSources;
  royaltyRates?: RoyaltyRates;
  history?: WalletHistoryItem[];
  royaltyBreakdown?: RoyaltyPoint[];
};

export default function RoyaltyDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);

  const [royaltyData, setRoyaltyData] = useState<RoyaltyPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('api/bank/artist/payments/', {
          params: { artist_id: getArtistId() },
        });
        const wallet = data?.data?.wallet ?? null;
        setWallet(wallet);
        setRoyaltyData(wallet?.royaltyBreakdown ?? []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load payment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {loading && (
          <div className="bg-slate-800 text-white/80 px-4 py-2 rounded">Loading data…</div>
        )}
        {error && (
          <div className="bg-red-600/20 text-red-300 px-4 py-2 rounded">{error}</div>
        )}
        {/* Wallet Overview */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 p-6 rounded-lg shadow-md text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wallet size={20} /> Wallet Balance
          </h2>
          <p className="text-4xl font-semibold mt-2">
            GHS {wallet?.total?.toFixed(2)}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              📻 Radio:{' '}
              <span className="font-medium">
                GHS {(wallet?.sources?.radio ?? 0).toFixed(2)}
              </span>
            </div>
            <div>
              🏷️ Distro:{' '}
              <span className="font-medium">
                GHS {(wallet?.sources?.distro ?? 0).toFixed(2)}
              </span>
            </div>
   
          </div>
        </div>

        {/* Royalty Breakdown */}
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 size={18} /> Royalty Breakdown
            </h2>
            <button className="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">
              Switch to Table
            </button>
          </div>
          <div className="bg-slate-700 h-40 flex items-center justify-center text-white/60 rounded">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={royaltyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorArtists" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="plays"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorArtists)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CalendarCheck size={18} /> Payment History
          </h2>
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Method</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {wallet?.history?.map((tx, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="py-2">{tx?.date}</td>
                  <td>GHS {tx.amount.toFixed(2)}</td>
                  <td>{tx.method}</td>
                  <td className="text-green-400">{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MoMo Withdrawal */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowDownToLine size={18} /> Request Withdrawal
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">
                Mobile Money Number
              </label>
              <input
                type="text"
                className="w-full p-2 bg-slate-700 rounded"
                placeholder="e.g. 024XXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">
                Amount to Withdraw
              </label>
              <input
                type="number"
                className="w-full p-2 bg-slate-700 rounded"
                placeholder="e.g. 100"
              />
              <p className="text-xs text-white/60 mt-1">
                Min withdrawal: GHS 50
              </p>
            </div>
            <button className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 text-sm font-semibold">
              Request Payout
            </button>
          </form>
        </div>

        {/* Royalty Rates Info */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Info size={18} /> Royalty Rate Information
          </h2>
          <ul className="space-y-2 text-sm text-white/90">
            <li>
              📻 Radio Play:{' '}
              <span className="font-medium">{wallet?.royaltyRates?.radio}</span>
            </li>
            {/* Streaming rates removed: scope is radio royalties only */}
            <li className="text-white/60 text-xs">
              * Rates may vary by platform and region. Data based on verified
              sources.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
