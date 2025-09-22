import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Edit, MapPin, Shield, Wallet } from 'lucide-react';
import { baseUrl, publisherID, userToken } from '../../constants';

type Profile = {
  publisher_id: string;
  companyName: string | null;
  verified: boolean;
  region: string | null;
  city: string | null;
  country: string | null;
  locationName: string | null;
  writerSplit: number;
  publisherSplit: number;
  bankAccount: string | null;
  momoAccount: string | null;
  taxId: string | null;
  onboarding: { profile_completed: boolean; revenue_split_completed: boolean; link_artist_completed: boolean; payment_info_added: boolean; step: string | null };
  user: { name: string | null; email: string | null; photo: string | null };
};

type Dashboard = {
  totalEarnings: number;
  worksCount: number;
  writersCount: number;
  agreementsCount: number;
  splits: { publisher: number; writers: number };
};

const PublisherProfile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Dashboard | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ companyName: '', region: '', city: '', country: '', taxId: '', bankAccount: '', momoAccount: '', writerSplit: 0, publisherSplit: 0 });

  const canSave = useMemo(() => form.writerSplit + form.publisherSplit === 100, [form]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const p = await fetch(`${baseUrl}api/publishers/publisher-profile/?publisher_id=${publisherID}`, { headers: { Authorization: `Token ${userToken}` } });
        const pj = await p.json();
        if (!cancelled && p.ok) {
          const pd: Profile = pj.data.publisherData;
          setProfile(pd);
          setForm({
            companyName: pd.companyName || '',
            region: pd.region || '',
            city: pd.city || '',
            country: pd.country || '',
            taxId: pd.taxId || '',
            bankAccount: pd.bankAccount || '',
            momoAccount: pd.momoAccount || '',
            writerSplit: pd.writerSplit || 0,
            publisherSplit: pd.publisherSplit || 0,
          });
        }
        const d = await fetch(`${baseUrl}api/publishers/dashboard/?publisher_id=${publisherID}&period=all-time`, { headers: { Authorization: `Token ${userToken}` } });
        const dj = await d.json();
        if (!cancelled && d.ok) {
          setStats({
            totalEarnings: dj.data.totalEarnings,
            worksCount: dj.data.worksCount,
            writersCount: dj.data.writersCount,
            agreementsCount: dj.data.agreementsCount,
            splits: dj.data.splits,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('publisher_id', String(publisherID || ''));
      Object.entries({
        company_name: form.companyName,
        region: form.region,
        city: form.city,
        country: form.country,
        tax_id: form.taxId,
        bank_account: form.bankAccount,
        momo_account: form.momoAccount,
        writer_split: String(form.writerSplit),
        publisher_split: String(form.publisherSplit),
      }).forEach(([k, v]) => formData.append(k, String(v ?? '')));

      const r = await fetch(`${baseUrl}api/publishers/publisher-profile/edit/`, {
        method: 'POST',
        headers: { Authorization: `Token ${userToken}` },
        body: formData,
      });
      if (r.ok) setEditOpen(false);
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-8 border border-white/20">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {profile?.user.photo ? (
              <img src={profile.user.photo} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-500" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{profile?.companyName || profile?.user.name || 'Publisher'}</h1>
                {profile?.verified && <Shield className="w-4 h-4 text-blue-300" />}
              </div>
              <div className="text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{[profile?.city, profile?.region, profile?.country].filter(Boolean).join(', ') || '—'}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setEditOpen(true)} className="bg-white/10 text-white px-4 py-2 rounded-lg flex items-center hover:bg-white/20 transition">
            <Edit className="w-5 h-5 mr-2" /> Edit Profile
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-gray-300">Total Earnings</div>
            <div className="text-xl font-semibold">GHS {stats?.totalEarnings?.toFixed(2) || '0.00'}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-gray-300">Works</div>
            <div className="text-xl font-semibold">{stats?.worksCount ?? 0}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-gray-300">Writers</div>
            <div className="text-xl font-semibold">{stats?.writersCount ?? 0}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-gray-300">Agreements</div>
            <div className="text-xl font-semibold">{stats?.agreementsCount ?? 0}</div>
          </div>
        </div>

        {/* Splits */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/20 text-white">
          <div className="flex items-center gap-2 mb-3"><Wallet className="w-5 h-5" /><div className="font-semibold">Royalty Splits</div></div>
          <div className="text-gray-300 mb-2">Publisher: {profile?.publisherSplit ?? stats?.splits.publisher ?? 0}%</div>
          <div className="text-gray-300 mb-4">Writers: {profile?.writerSplit ?? stats?.splits.writers ?? 0}%</div>
          <div className="w-full h-3 bg-white/10 rounded">
            <div className="h-3 bg-blue-500 rounded-l" style={{ width: `${profile?.publisherSplit ?? stats?.splits.publisher ?? 0}%` }} />
          </div>
        </div>

        {/* Company & Payout */}
        <div className="grid md:grid-cols-2 gap-6 text-white">
          <div className="bg-white/5 p-6 rounded-xl border border-white/20">
            <div className="font-semibold mb-4">Company Information</div>
            <div className="text-gray-300">Company: {profile?.companyName || '—'}</div>
            <div className="text-gray-300">Tax ID: {profile?.taxId || '—'}</div>
            <div className="text-gray-300">Location: {profile?.locationName || [profile?.city, profile?.region, profile?.country].filter(Boolean).join(', ') || '—'}</div>
            <div className="text-gray-300">Contact Email: {profile?.user.email || '—'}</div>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/20">
            <div className="font-semibold mb-4">Payout Details</div>
            <div className="text-gray-300">Bank: {profile?.bankAccount || '—'}</div>
            <div className="text-gray-300">MoMo: {profile?.momoAccount || '—'}</div>
            <div className="flex items-center gap-2 mt-2 text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400" /> Payment info {profile?.onboarding.payment_info_added ? 'added' : 'not added'}
            </div>
          </div>
        </div>

        {/* Onboarding */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/20 text-white">
          <div className="font-semibold mb-3">Onboarding Progress</div>
          <div className="grid md:grid-cols-4 gap-2 text-gray-300">
            <div>Profile: {profile?.onboarding.profile_completed ? '✓' : '—'}</div>
            <div>Revenue Split: {profile?.onboarding.revenue_split_completed ? '✓' : '—'}</div>
            <div>Link Artist: {profile?.onboarding.link_artist_completed ? '✓' : '—'}</div>
            <div>Payment Info: {profile?.onboarding.payment_info_added ? '✓' : '—'}</div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-2xl max-w-xl w-full border border-white/20 text-white">
            <div className="text-lg font-semibold mb-4">Edit Publisher Profile</div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm">Company Name<input className="w-full bg-white/10 border border-white/20 rounded px-3 py-2" value={form.companyName} onChange={e=>setForm({...form, companyName:e.target.value})} /></label>
              <label className="text-sm">Tax ID<input className="w-full bg-white/10 border border-white/20 rounded px-3 py-2" value={form.taxId} onChange={e=>setForm({...form, taxId:e.target.value})} /></label>
              <label className="text-sm">Region<input className="w-full bg-white/10 border border-white/20 rounded px-3 py-2" value={form.region} onChange={e=>setForm({...form, region:e.target.value})} /></label>
              <label className="text-sm">City<input className="w-full bg-white/10 border border-white/20 rounded px-3 py-2" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} /></label>
              <label className="text-sm">Country<input className="w-full bg-white/10 border border-white/20 rounded px-3 py-2" value={form.country} onChange={e=>setForm({...form, country:e.target.value})} /></label>
              <label className="text-sm">Bank Account<input className="w-full bg-white/10 border border-white/20 rounded px-3 py-2" value={form.bankAccount} onChange={e=>setForm({...form, bankAccount:e.target.value})} /></label>
              <label className="text-sm">MoMo Account<input className="w-full bg-white/10 border border-white/20 rounded px-3 py-2" value={form.momoAccount} onChange={e=>setForm({...form, momoAccount:e.target.value})} /></label>
              <label className="text-sm">Writer Split (%)<input type="number" className="w-full bg-white/10 border border-white/20 rounded px-3 py-2" value={form.writerSplit} onChange={e=>setForm({...form, writerSplit: Number(e.target.value)})} /></label>
              <label className="text-sm">Publisher Split (%)<input type="number" className="w-full bg-white/10 border border-white/20 rounded px-3 py-2" value={form.publisherSplit} onChange={e=>setForm({...form, publisherSplit: Number(e.target.value)})} /></label>
            </div>
            <div className="flex items-center justify-between mt-4 text-gray-300 text-sm">
              <div>Splits must total 100%. Current total: {form.writerSplit + form.publisherSplit}%</div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-700 rounded" onClick={()=>setEditOpen(false)}>Cancel</button>
                <button disabled={!canSave || saving} className="px-4 py-2 bg-purple-600 rounded disabled:opacity-50" onClick={saveProfile}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublisherProfile;

