import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';

function Section({ title, children }: any) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="border rounded p-3">{children}</div>
    </div>
  );
}

export default function PartnerDetail() {
  const { id } = useParams();
  const partnerId = Number(id);
  const [partner, setPartner] = useState<any>(null);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [remittances, setRemittances] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [newAgreementFee, setNewAgreementFee] = useState('15.00');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const [p, a, c] = await Promise.all([
      api.get(`/api/royalties/partners/${partnerId}/`),
      api.get(`/api/royalties/partners/${partnerId}/agreements/`),
      api.get(`/api/royalties/cycles/`),
    ]);
    setPartner(p.data);
    setAgreements(a.data || []);
    setCycles(c.data || []);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, [partnerId]);

  const uploadCsv = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await api.post(`/api/royalties/partners/${partnerId}/repertoire/upload/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(`Imported: created=${res.data.created}, updated=${res.data.updated}`);
    } catch (e: any) {
      alert(e?.response?.data?.detail || e.message);
    } finally {
      setBusy(false);
    }
  };

  const createAgreement = async () => {
    setBusy(true);
    try {
      const res = await api.post(`/api/royalties/partners/${partnerId}/agreements/create/`, {
        territory: 'GH',
        status: 'Active',
        reporting_frequency: 'Quarterly',
        admin_fee_percent: newAgreementFee,
      });
      setAgreements([res.data, ...agreements]);
    } catch (e: any) {
      alert(e?.response?.data?.detail || e.message);
    } finally {
      setBusy(false);
    }
  };

  const openExports = async (cycleId: number) => {
    const res = await api.get(`/api/royalties/cycles/${cycleId}/exports/`);
    setExports(res.data || []);
  };

  const openRemittances = async (cycleId: number) => {
    const res = await api.get(`/api/royalties/cycles/${cycleId}/remittances/`);
    setRemittances(res.data || []);
  };

  if (!partner) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">{partner.display_name || partner.company_name}</h1>

      <Section title="Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div>Country: {partner.country_code || '-'}</div>
          <div>Reporting Standard: {partner.reporting_standard}</div>
          <div>Default Admin %: {partner.default_admin_fee_percent}</div>
        </div>
      </Section>

      <Section title="Agreements">
        <div className="mb-3">
          <input className="border rounded p-2 mr-2" value={newAgreementFee} onChange={(e) => setNewAgreementFee(e.target.value)} />
          <button disabled={busy} className="rounded bg-indigo-600 text-white px-3 py-2" onClick={createAgreement}>Add GH Agreement</button>
        </div>
        <table className="w-full text-left border text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-2 border">Territory</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Effective</th>
              <th className="p-2 border">Expiry</th>
              <th className="p-2 border">Admin %</th>
            </tr>
          </thead>
          <tbody>
            {agreements.map((a) => (
              <tr key={a.id}>
                <td className="p-2 border">{a.territory}</td>
                <td className="p-2 border">{a.status}</td>
                <td className="p-2 border">{a.effective_date}</td>
                <td className="p-2 border">{a.expiry_date || '-'}</td>
                <td className="p-2 border">{a.admin_fee_percent || partner.default_admin_fee_percent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Repertoire Import (CSV)">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="rounded bg-indigo-600 text-white px-3 py-2 ml-2" disabled={!file || busy} onClick={uploadCsv}>Upload</button>
        <p className="text-xs text-slate-500 mt-2">Headers required: isrc,title,work_title,duration_seconds</p>
      </Section>

      <Section title="Royalty Cycles">
        <table className="w-full text-left border text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Period</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cycles.map((c) => (
              <tr key={c.id}>
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.period_start} → {c.period_end}</td>
                <td className="p-2 border">{c.status}</td>
                <td className="p-2 border space-x-2">
                  <button className="underline" onClick={() => openExports(c.id)}>Exports</button>
                  <button className="underline" onClick={() => openRemittances(c.id)}>Remittances</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Cycle Exports">
        <ul className="text-sm list-disc pl-6">
          {exports.map((e) => (
            <li key={e.id}>{e.file} ({e.format})</li>
          ))}
        </ul>
      </Section>

      <Section title="Cycle Remittances">
        <table className="w-full text-left border text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-2 border">Currency</th>
              <th className="p-2 border">Gross</th>
              <th className="p-2 border">Admin Fee</th>
              <th className="p-2 border">Net</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {remittances.map((r) => (
              <tr key={r.id}>
                <td className="p-2 border">{r.currency}</td>
                <td className="p-2 border">{r.gross_amount}</td>
                <td className="p-2 border">{r.admin_fee_amount}</td>
                <td className="p-2 border">{r.net_payable}</td>
                <td className="p-2 border">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

