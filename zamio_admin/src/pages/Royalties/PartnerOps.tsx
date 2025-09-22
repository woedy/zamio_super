import { useEffect, useState } from 'react';
import api from '../../lib/api';

function Input({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (v: any) => void; type?: string }) {
  return (
    <label className="mb-3 block">
      <span className="block text-sm text-slate-500 mb-1">{label}</span>
      <input className="w-full rounded border p-2" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export default function PartnerOps() {
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [partnerName, setPartnerName] = useState('ASCAP');
  const [adminFee, setAdminFee] = useState('15.00');
  const [csvPath, setCsvPath] = useState('zamio_backend/sample_partner_import.csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [agreementStatus, setAgreementStatus] = useState('Active');
  const [cycleName, setCycleName] = useState('2025-Q1 Ghana');
  const [periodStart, setPeriodStart] = useState('2025-01-01');
  const [periodEnd, setPeriodEnd] = useState('2025-03-31');
  const [cycleId, setCycleId] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState<boolean>(false);

  // Load existing partners so we can link to a real PartnerPRO
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/royalties/partners/');
        setPartners(res.data || []);
      } catch {}
    })();
  }, []);

  const push = (m: string) => setLog((prev) => [m, ...prev]);

  const createPartner = async () => {
    setBusy(true);
    try {
      const payload = {
      display_name: partnerName,
      company_name: partnerName,
      country_code: 'US',
      contact_email: 'partnerships@example.com',
      reporting_standard: 'CSV-Custom',
      default_admin_fee_percent: adminFee,
      active: true,
      metadata: {},
    };
      const res = await api.post('/api/royalties/partners/create/', payload);
      setPartnerId(res.data.id);
      push(`Partner created: id=${res.data.id}`);
    } catch (e: any) {
      push(`Create Partner failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const createAgreement = async () => {
    if (!partnerId) return push('No partner selected');
    setBusy(true);
    try {
      const res = await api.post(`/api/royalties/partners/${partnerId}/agreements/create/`, {
        territory: 'GH',
        status: agreementStatus,
        admin_fee_percent: adminFee,
        reporting_frequency: 'Quarterly',
      });
      push(`Agreement created: id=${res.data.id}`);
    } catch (e: any) {
      push(`Create Agreement failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const importCsv = async () => {
    if (!partnerId) return push('No partner selected');
    setBusy(true);
    try {
      const res = await api.post(`/api/royalties/partners/${partnerId}/ingest-repertoire/`, {
        csv_path: csvPath,
        dry_run: false,
      });
      push(`CSV import -> created=${res.data.created}, updated=${res.data.updated}`);
    } catch (e: any) {
      push(`Import CSV failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const uploadCsv = async () => {
    if (!partnerId) return push('No partner selected');
    if (!csvFile) return push('Select a CSV file');
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', csvFile);
      const res = await api.post(`/api/royalties/partners/${partnerId}/repertoire/upload/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      push(`Upload CSV -> created=${res.data.created}, updated=${res.data.updated}`);
    } catch (e: any) {
      push(`Upload CSV failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const createCycle = async () => {
    setBusy(true);
    try {
      const res = await api.post('/api/royalties/cycles/create/', {
        name: cycleName,
        territory: 'GH',
        period_start: periodStart,
        period_end: periodEnd,
        admin_fee_percent_default: adminFee,
      });
      setCycleId(res.data.id);
      push(`Cycle created: id=${res.data.id}`);
    } catch (e: any) {
      push(`Create Cycle failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const closeCycle = async () => {
    if (!cycleId) return push('No cycle selected');
    setBusy(true);
    try {
      const res = await api.post(`/api/royalties/cycles/${cycleId}/close/`);
      push(`Cycle closed: created line items=${res.data.line_items_created}`);
    } catch (e: any) {
      push(`Close Cycle failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    if (!cycleId || !partnerId) return push('Need partner and cycle');
    setBusy(true);
    try {
      const res = await api.post(`/api/royalties/cycles/${cycleId}/partners/${partnerId}/export/`);
      push(`Export created: ${res.data.file}`);
    } catch (e: any) {
      push(`Export failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const remit = async () => {
    if (!cycleId || !partnerId) return push('Need partner and cycle');
    setBusy(true);
    try {
      const res = await api.post(`/api/royalties/cycles/${cycleId}/partners/${partnerId}/remit/`);
      push(`Remittance created: id=${res.data.id} net=${res.data.net_payable}`);
    } catch (e: any) {
      push(`Remittance failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">International Partners — Ops</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2">Partner & Agreement</h2>
          <label className="mb-3 block">
            <span className="block text-sm text-slate-500 mb-1">Select Existing Partner</span>
            <select className="w-full rounded border p-2" value={partnerId ?? ''} onChange={(e) => setPartnerId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">-- Choose Partner --</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.display_name || p.company_name || `Partner ${p.id}`}</option>
              ))}
            </select>
          </label>
          <Input label="Partner Name" value={partnerName} onChange={setPartnerName} />
          <Input label="Admin Fee %" value={adminFee} onChange={setAdminFee} />
          <div className="flex gap-2">
            <button className="btn" onClick={createPartner} disabled={busy}>Create Partner</button>
            <button className="btn" onClick={createAgreement} disabled={!partnerId || busy}>Create Agreement</button>
          </div>
        </div>
        <div>
          <h2 className="font-medium mb-2">Repertoire Import</h2>
          <Input label="CSV Path" value={csvPath} onChange={setCsvPath} />
          <button className="btn" onClick={importCsv} disabled={!partnerId || busy}>Import CSV</button>
          <div className="mt-3">
            <span className="block text-sm text-slate-500 mb-1">Or upload CSV</span>
            <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
            <button className="btn ml-2" onClick={uploadCsv} disabled={!partnerId || !csvFile || busy}>Upload</button>
          </div>
        </div>
        <div>
          <h2 className="font-medium mb-2">Royalty Cycle</h2>
          <Input label="Cycle Name" value={cycleName} onChange={setCycleName} />
          <Input label="Period Start (YYYY-MM-DD)" value={periodStart} onChange={setPeriodStart} />
          <Input label="Period End (YYYY-MM-DD)" value={periodEnd} onChange={setPeriodEnd} />
          <div className="flex gap-2">
            <button className="btn" onClick={createCycle} disabled={busy}>Create Cycle</button>
            <button className="btn" onClick={closeCycle} disabled={!cycleId || busy}>Close Cycle</button>
          </div>
        </div>
        <div>
          <h2 className="font-medium mb-2">Export & Remittance</h2>
          <div className="flex gap-2">
            <button className="btn" onClick={exportCsv} disabled={!cycleId || !partnerId || busy}>Export CSV</button>
            <button className="btn" onClick={remit} disabled={!cycleId || !partnerId || busy}>Create Remittance</button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Log</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          {log.map((l, i) => (
            <li key={i}>• {l}</li>
          ))}
        </ul>
      </div>

      <style>{`
        .btn { @apply rounded bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 disabled:opacity-50 } 
      `}</style>
    </div>
  );
}
