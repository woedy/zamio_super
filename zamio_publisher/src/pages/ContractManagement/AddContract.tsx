import { useCallback, useEffect, useState } from 'react';
import { baseUrl, publisherID, userToken } from '../../constants';
import { FileText, Upload, User, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddContract = () => {
  const navigate = useNavigate();

  const [artists, setArtists] = useState<{ artist_id: string; stage_name: string }[]>([]);
  const [tracks, setTracks] = useState<{ id: number; title: string }[]>([]);

  const [artistId, setArtistId] = useState('');
  const [trackId, setTrackId] = useState('');
  const [writerShare, setWriterShare] = useState('');
  const [publisherShare, setPublisherShare] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = useCallback(async () => {
    try {
      const url = `${baseUrl}api/publishers/all-managed-artists/?publisher_id=${encodeURIComponent(String(publisherID || ''))}&page=1`;
      const resp = await fetch(url, { headers: { Authorization: `Token ${userToken}` } });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.message || 'Failed to load artists');
      setArtists(json?.data?.artists || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load artists');
    }
  }, []);

  const fetchTracks = useCallback(async (aid: string) => {
    if (!aid) { setTracks([]); return; }
    try {
      const url = `${baseUrl}api/publishers/artist-tracks/?artist_id=${encodeURIComponent(aid)}`;
      const resp = await fetch(url, { headers: { Authorization: `Token ${userToken}` } });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.message || 'Failed to load tracks');
      setTracks(json?.data?.tracks || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tracks');
    }
  }, []);

  useEffect(() => { fetchArtists(); }, [fetchArtists]);
  useEffect(() => { fetchTracks(artistId); }, [artistId, fetchTracks]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!artistId || !trackId) { setError('Artist and track are required'); return; }
    const w = parseFloat(writerShare), p = parseFloat(publisherShare);
    if (isNaN(w) || isNaN(p)) { setError('Shares must be numbers'); return; }
    if (w < 0 || p < 0 || w > 100 || p > 100) { setError('Shares must be between 0 and 100'); return; }
    if (Math.abs((w + p) - 100) > 1e-6) { setError('Writer + Publisher must equal 100%'); return; }

    const form = new FormData();
    form.append('publisher_id', String(publisherID || ''));
    form.append('artist_id', artistId);
    form.append('track_id', trackId);
    form.append('writer_share', String(w));
    form.append('publisher_share', String(p));
    if (file) form.append('contract_file', file);

    try {
      setLoading(true);
      const url = `${baseUrl}api/publishers/contracts/create/`;
      const resp = await fetch(url, { method: 'POST', headers: { Authorization: `Token ${userToken}` }, body: form });
      const json = await resp.json();
      if (!resp.ok) {
        const msg = json?.errors ? (Object.values(json.errors).flat() as string[]).join('\n') : json?.message || 'Failed to create contract';
        throw new Error(msg);
      }
      const id = json?.data?.id;
      if (id) navigate('/contract-details', { state: { contract_id: id } });
    } catch (e: any) {
      setError(e?.message || 'Failed to create contract');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">New Publishing Agreement</h1>
        </div>

        {error && <div className="mb-3 bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-2 rounded">{error}</div>}

        <form onSubmit={onSubmit} className="bg-white/10 border border-white/20 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Artist</label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <select value={artistId} onChange={(e)=>{ setArtistId(e.target.value); setTrackId(''); }} className="flex-1 bg-white/10 text-white px-3 py-2 rounded border border-white/20">
                <option value="">Select artist…</option>
                {artists.map(a => <option key={a.artist_id} value={a.artist_id}>{a.stage_name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Track</label>
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-gray-400" />
              <select value={trackId} onChange={(e)=>setTrackId(e.target.value)} className="flex-1 bg-white/10 text-white px-3 py-2 rounded border border-white/20" disabled={!artistId}>
                <option value="">{artistId ? 'Select track…' : 'Select artist first'}</option>
                {tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Writer Share (%)</label>
              <input type="number" min={0} max={100} step={0.01} value={writerShare} onChange={(e)=>setWriterShare(e.target.value)} className="w-full bg-white/10 text-white px-3 py-2 rounded border border-white/20" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Publisher Share (%)</label>
              <input type="number" min={0} max={100} step={0.01} value={publisherShare} onChange={(e)=>setPublisherShare(e.target.value)} className="w-full bg-white/10 text-white px-3 py-2 rounded border border-white/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Contract File (optional)</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-white/20 rounded p-6 cursor-pointer bg-white/5 hover:bg-white/10">
              <Upload className="w-5 h-5 text-gray-300" />
              <span className="text-gray-200">{file ? file.name : 'Click to upload PDF'}</span>
              <input type="file" accept="application/pdf" onChange={(e)=> setFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={()=>navigate(-1)} className="px-4 py-2 bg-white/10 text-white rounded border border-white/20">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">{loading ? 'Creating…' : 'Create Contract'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContract;