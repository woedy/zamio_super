import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

function Input({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (v: any) => void; type?: string }) {
  return (
    <label className="mb-3 block">
      <span className="block text-sm text-slate-500 mb-1">{label}</span>
      <input className="w-full rounded border p-2" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export default function PartnerOpsWizard() {
  const navigate = useNavigate();
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
  const [step, setStep] = useState<number>(1);
  const [hasAgreement, setHasAgreement] = useState<boolean>(false);
  const [importDone, setImportDone] = useState<boolean>(false);
  const [exported, setExported] = useState<boolean>(false);
  const [remittanceId, setRemittanceId] = useState<number | null>(null);
  const [partnerMode, setPartnerMode] = useState<'select' | 'create'>('select');
  const [agreements, setAgreements] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [exportsList, setExportsList] = useState<any[]>([]);
  const [remitList, setRemitList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/royalties/partners/');
        setPartners(res.data || []);
      } catch {}
    })();
  }, []);

  // When entering Step 2 (Agreement) with a selected partner, fetch agreements
  useEffect(() => {
    (async () => {
      if (step !== 2 || !partnerId) return;
      try {
        const res = await api.get(`/api/royalties/partners/${partnerId}/agreements/`);
        const list = res.data || [];
        setAgreements(list);
        const activeGh = list.find((a: any) => (a.territory || '').toUpperCase() === 'GH' && a.status === 'Active');
        setHasAgreement(!!activeGh);
        // If an agreement exists, prefer its admin fee as current default for consistency
        if (activeGh && activeGh.admin_fee_percent) {
          setAdminFee(String(activeGh.admin_fee_percent));
        }
      } catch (e) {
        // ignore; manual creation still possible
      }
    })();
  }, [step, partnerId]);

  // When entering Step 4 (Cycle), load cycles and try to match existing by name/dates
  useEffect(() => {
    (async () => {
      if (step !== 4) return;
      try {
        const res = await api.get('/api/royalties/cycles/');
        const list = res.data || [];
        setCycles(list);
        const found = list.find((c: any) => (c.name || '') === cycleName || ((c.period_start === periodStart) && (c.period_end === periodEnd)));
        if (found) {
          setCycleId(found.id);
        }
      } catch {}
    })();
  }, [step]);

  // When entering Step 5 (Export & Remit), load exports/remittances and set flags
  useEffect(() => {
    (async () => {
      if (step !== 5 || !cycleId) return;
      try {
        const ex = await api.get(`/api/royalties/cycles/${cycleId}/exports/`);
        setExportsList(ex.data || []);
        setExported((ex.data || []).length > 0);
      } catch {}
      try {
        const rl = await api.get(`/api/royalties/cycles/${cycleId}/remittances/`);
        setRemitList(rl.data || []);
        if ((rl.data || []).length > 0) {
          setRemittanceId(rl.data[0].id);
        }
      } catch {}
    })();
  }, [step, cycleId]);

  const push = (m: string) => setLog((prev) => [m, ...prev]);

  const createPartner = async () => {
    setError(null);
    if (partnerId) {
      push('Partner already selected; skipping creation');
      setStep(2);
      return;
    }
    // Validate name and fee
    if (!partnerName || partnerName.trim().length < 2) {
      setError('Enter a valid partner name');
      return;
    }
    const fee = parseFloat(adminFee);
    if (isNaN(fee) || fee < 0 || fee > 100) {
      setError('Admin fee must be between 0 and 100');
      return;
    }
    setBusy(true);
    try {
      // Avoid duplicates by name: if found, use it instead of creating
      const existing = partners.find((p) => (p.display_name || p.company_name || '').trim().toLowerCase() === partnerName.trim().toLowerCase());
      if (existing) {
        setPartnerId(existing.id);
        push(`Using existing partner: id=${existing.id}`);
        setStep(2);
        return;
      }
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
      setStep(2);
    } catch (e: any) {
      push(`Create Partner failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const createAgreement = async () => {
    if (!partnerId) return push('No partner selected');
    if (hasAgreement) {
      push('Active GH agreement already exists; skipping creation');
      setStep(3);
      return;
    }
    // validate fee
    setError(null);
    const fee = parseFloat(adminFee);
    if (isNaN(fee) || fee < 0 || fee > 100) {
      setError('Admin fee must be between 0 and 100');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post(`/api/royalties/partners/${partnerId}/agreements/create/`, {
        territory: 'GH',
        status: agreementStatus,
        admin_fee_percent: adminFee,
        reporting_frequency: 'Quarterly',
      });
      push(`Agreement created: id=${res.data.id}`);
      setHasAgreement(true);
      setStep(3);
    } catch (e: any) {
      push(`Create Agreement failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const importCsv = async () => {
    if (!partnerId) return push('No partner selected');
    setError(null);
    if (!csvPath || !csvPath.trim()) {
      setError('Provide a valid server CSV path or use Upload CSV');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post(`/api/royalties/partners/${partnerId}/ingest-repertoire/`, {
        csv_path: csvPath,
        dry_run: false,
      });
      push(`CSV import -> created=${res.data.created}, updated=${res.data.updated}`);
      setImportDone(true);
      setStep(4);
    } catch (e: any) {
      push(`Import CSV failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const uploadCsv = async () => {
    if (!partnerId) return push('No partner selected');
    if (!csvFile) return push('Select a CSV file');
    setError(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', csvFile);
      const res = await api.post(`/api/royalties/partners/${partnerId}/repertoire/upload/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      push(`Upload CSV -> created=${res.data.created}, updated=${res.data.updated}`);
      setImportDone(true);
      setStep(4);
    } catch (e: any) {
      push(`Upload CSV failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const createCycle = async () => {
    setError(null);
    // basic date validation
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(periodStart) || !re.test(periodEnd)) {
      setError('Dates must be in YYYY-MM-DD format');
      return;
    }
    if (new Date(periodStart) > new Date(periodEnd)) {
      setError('Start date must be before end date');
      return;
    }
    setBusy(true);
    try {
      // Check if cycle exists by name or dates to avoid duplicate creation
      const existing = cycles.find((c: any) => (c.name || '') === cycleName || ((c.period_start === periodStart) && (c.period_end === periodEnd)));
      if (existing) {
        setCycleId(existing.id);
        push(`Using existing cycle: id=${existing.id}`);
        return;
      }
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
    setError(null);
    setBusy(true);
    try {
      // avoid duplicate export: check existing list
      if (exportsList && exportsList.length > 0) {
        push('Export already exists for this cycle');
        setExported(true);
      } else {
        const res = await api.post(`/api/royalties/cycles/${cycleId}/partners/${partnerId}/export/`);
        push(`Export created: ${res.data.file}`);
        setExported(true);
      }
    } catch (e: any) {
      push(`Export failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const remit = async () => {
    if (!cycleId || !partnerId) return push('Need partner and cycle');
    setError(null);
    setBusy(true);
    try {
      if (remitList && remitList.length > 0) {
        const existing = remitList[0];
        setRemittanceId(existing.id);
        push(`Remittance already exists: id=${existing.id}`);
      } else {
        const res = await api.post(`/api/royalties/cycles/${cycleId}/partners/${partnerId}/remit/`);
        push(`Remittance created: id=${res.data.id} net=${res.data.net_payable}`);
        setRemittanceId(res.data.id);
      }
    } catch (e: any) {
      push(`Remittance failed: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const steps = [
    { id: 1, label: 'Partner' },
    { id: 2, label: 'Agreement' },
    { id: 3, label: 'Repertoire' },
    { id: 4, label: 'Cycle' },
    { id: 5, label: 'Export & Remit' },
  ];

  const canNext = () => {
    switch (step) {
      case 1:
        return !!partnerId;
      case 2:
        return hasAgreement;
      case 3:
        return importDone;
      case 4:
        return !!cycleId;
      case 5:
        return exported && !!remittanceId;
      default:
        return false;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">International Partners — Wizard</h1>

      {/* Stepper */}
      <div className="mb-6 flex items-center space-x-4 text-sm">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${step >= s.id ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-500 border'}`}>
              {s.id}
            </div>
            <span className={`mr-4 ${step >= s.id ? 'text-slate-900' : 'text-gray-500'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="w-10 h-px bg-gray-300 mr-4" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-3 rounded border border-red-300 bg-red-50 text-red-700 p-2 text-sm">{error}</div>
        )}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-medium mb-2">Select Existing Partner</h2>
              <div className="mb-3 flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="radio" checked={partnerMode==='select'} onChange={() => setPartnerMode('select')} /> Select</label>
                <label className="flex items-center gap-2"><input type="radio" checked={partnerMode==='create'} onChange={() => setPartnerMode('create')} /> Create New</label>
              </div>
              {partnerMode === 'select' && (
                <label className="mb-3 block">
                  <select className="w-full rounded border p-2" value={partnerId ?? ''} onChange={(e) => { setPartnerId(e.target.value ? Number(e.target.value) : null); setHasAgreement(false); setImportDone(false); }}>
                    <option value="">-- Choose Partner --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.display_name || p.company_name || `Partner ${p.id}`}</option>
                    ))}
                  </select>
                </label>
              )}
              <p className="text-xs text-slate-500">Or create a new Partner below</p>
            </div>
            {partnerMode === 'create' && (
              <div>
              <h2 className="font-medium mb-2">Create Partner</h2>
              <Input label="Partner Name" value={partnerName} onChange={setPartnerName} />
              <Input label="Default Admin Fee %" value={adminFee} onChange={setAdminFee} />
              <button className="btn" onClick={createPartner} disabled={busy}>Create Partner</button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-medium mb-2">Create GH Agreement</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Admin Fee %" value={adminFee} onChange={setAdminFee} />
              <label className="mb-3 block">
                <span className="block text-sm text-slate-500 mb-1">Status</span>
                <select className="w-full rounded border p-2" value={agreementStatus} onChange={(e) => setAgreementStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </label>
            </div>
            <button className="btn" onClick={createAgreement} disabled={!partnerId || busy}>Create Agreement</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-medium mb-2">Repertoire Import</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input label="Server CSV Path" value={csvPath} onChange={setCsvPath} />
                <button className="btn" onClick={importCsv} disabled={!partnerId || busy}>Import from Path</button>
              </div>
              <div>
                <span className="block text-sm text-slate-500 mb-1">Upload CSV</span>
                <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
                <button className="btn ml-2" onClick={uploadCsv} disabled={!partnerId || !csvFile || busy}>Upload</button>
                <p className="text-xs text-slate-500 mt-2">Headers: isrc,title,work_title,duration_seconds</p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-medium mb-2">Create & Close Cycle</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Cycle Name" value={cycleName} onChange={setCycleName} />
              <Input label="Period Start (YYYY-MM-DD)" value={periodStart} onChange={setPeriodStart} />
              <Input label="Period End (YYYY-MM-DD)" value={periodEnd} onChange={setPeriodEnd} />
            </div>
            <div className="flex gap-2 mt-2">
              <button className="btn" onClick={createCycle} disabled={busy}>Create Cycle</button>
              <button className="btn" onClick={closeCycle} disabled={!cycleId || busy}>Close Cycle</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="font-medium mb-2">Export & Remit</h2>
            <div className="flex gap-2">
              <button className="btn" onClick={exportCsv} disabled={!cycleId || !partnerId || busy}>Export CSV</button>
              <button className="btn" onClick={remit} disabled={!cycleId || !partnerId || busy}>Create Remittance</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button className="btn" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Back</button>
        <button
          className="btn"
          onClick={() => {
            if (step === 5 && canNext()) {
              // Final redirect to Partner detail
              if (partnerId) navigate(`/partners/${partnerId}`);
            } else {
              setStep(Math.min(5, step + 1));
            }
          }}
          disabled={!canNext()}
        >
          {step === 5 ? 'Finish' : 'Next'}
        </button>
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
