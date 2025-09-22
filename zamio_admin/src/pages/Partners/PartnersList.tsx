import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

type Partner = {
  id: number;
  display_name: string | null;
  company_name: string | null;
  country_code: string | null;
  reporting_standard: string;
  default_admin_fee_percent: string;
  active: boolean;
};

export default function PartnersList() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/royalties/partners/');
        setPartners(res.data || []);
      } catch (e: any) {
        setError(e?.response?.data?.detail || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Loading partners…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">International Partners</h1>
        <Link className="rounded bg-indigo-600 text-white px-4 py-2" to="/partners/create">Create Partner</Link>
      </div>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-slate-50">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Country</th>
            <th className="p-2 border">Standard</th>
            <th className="p-2 border">Admin %</th>
            <th className="p-2 border">Active</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p.id}>
              <td className="p-2 border">{p.display_name || p.company_name || `Partner ${p.id}`}</td>
              <td className="p-2 border">{p.country_code || '-'}</td>
              <td className="p-2 border">{p.reporting_standard}</td>
              <td className="p-2 border">{p.default_admin_fee_percent}</td>
              <td className="p-2 border">{p.active ? 'Yes' : 'No'}</td>
              <td className="p-2 border">
                <Link className="text-indigo-600" to={`/partners/${p.id}`}>Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

