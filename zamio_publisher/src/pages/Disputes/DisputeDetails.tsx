import { useEffect, useState } from 'react';
import { baseUrl, baseUrlMedia, userToken } from '../../constants';
import { useLocation, useSearchParams } from 'react-router-dom';

const DisputeDetails = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const stateId = (location.state as any)?.dispute_id as number | undefined;
  const qId = params.get('dispute_id');
  const disputeId = stateId || (qId ? Number(qId) : undefined);

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolveNote, setResolveNote] = useState('');

  const fetchDetails = async () => {
    if (!disputeId) { setError('Missing dispute_id'); return; }
    setLoading(true); setError(null);
    try{
      const url = `${baseUrl}api/music-monitor/match-dispute-details/?dispute_id=${encodeURIComponent(String(disputeId))}`;
      const resp = await fetch(url, { headers: { Authorization: `Token ${userToken}` }});
      const json = await resp.json();
      if(!resp.ok){
        const msg = json?.errors ? (Object.values(json.errors).flat() as string[]).join('\n') : json?.message || 'Failed to load';
        throw new Error(msg);
      }
      setData(json?.data || null);
    } catch(e:any){ setError(e?.message || 'Failed to load'); }
    finally{ setLoading(false); }
  };

  const resolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeId) return;
    try{
      const form = new FormData();
      form.append('dispute_id', String(disputeId));
      form.append('comment', resolveNote || 'Resolved by publisher');
      const url = `${baseUrl}api/music-monitor/review-match-for-dispute/`;
      const resp = await fetch(url, { method: 'POST', headers: { Authorization: `Token ${userToken}` }, body: form });
      const json = await resp.json();
      if(!resp.ok){
        const msg = json?.errors ? (Object.values(json.errors).flat() as string[]).join('\n') : json?.message || 'Failed to resolve';
        throw new Error(msg);
      }
      setResolveNote('');
      await fetchDetails();
      alert('Dispute marked as Resolved.');
    }catch(e:any){
      alert(e?.message || 'Failed to resolve');
    }
  };

  useEffect(()=>{ fetchDetails(); /* eslint-disable-next-line */ }, [disputeId]);

  const cover = data?.cover_art ? (String(data.cover_art).startsWith('http') ? data.cover_art : `${baseUrlMedia}${data.cover_art}`) : null;
  const audio = data?.audio_file_mp3 ? (String(data.audio_file_mp3).startsWith('http') ? data.audio_file_mp3 : `${baseUrlMedia}${data.audio_file_mp3}`) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">Dispute Details</h1>
        {error && <div className="mb-3 bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-2 rounded">{error}</div>}
        {!data && loading && <div className="text-gray-300">Loading...</div>}
        {data && (
          <div className="bg-white/10 rounded-2xl border border-white/20 p-6">
            <div className="flex items-start gap-4 mb-4">
              {cover ? <img src={cover} className="w-24 h-24 rounded object-cover border border-white/20"/> : <div className="w-24 h-24 bg-white/10 rounded"/>}
              <div>
                <div className="text-white font-semibold text-xl">{data.track_title}</div>
                <div className="text-gray-300">{data.artist_name}</div>
                <div className="text-gray-300 text-sm mt-1">Duration: {data.duration || '—'}</div>
                <div className="text-gray-300 text-sm">Played: {data.start_time || '—'} – {data.stop_time || '—'}</div>
                <div className="text-gray-300 text-sm">Confidence: {data.avg_confidence_score}% • Royalty: ₵{(data.royalty_amount || 0).toFixed?.(2) || data.royalty_amount}</div>
                <div className="mt-2 text-sm"><span className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white">{data.dispute_status || 'Flagged'}</span></div>
              </div>
            </div>

            {audio && (
              <audio controls className="w-full mb-4">
                <source src={audio} type="audio/mpeg" />
              </audio>
            )}

            <div className="mb-4">
              <div className="text-white font-medium mb-1">Dispute Comment</div>
              <div className="bg-white/5 border border-white/10 text-gray-200 p-3 rounded">{data.dispute_comments || '—'}</div>
            </div>
            <div className="mb-6">
              <div className="text-white font-medium mb-1">Resolve Notes</div>
              <div className="bg-white/5 border border-white/10 text-gray-200 p-3 rounded">{data.resolve_comments || '—'}</div>
            </div>

            <form onSubmit={resolveDispute} className="bg-white/5 border border-white/10 p-4 rounded">
              <label className="block text-sm text-gray-200 mb-1">Add Resolve Comment</label>
              <textarea value={resolveNote} onChange={(e)=>setResolveNote(e.target.value)} className="w-full bg-white/10 text-white p-2 rounded border border-white/20" rows={3} placeholder="Provide resolution notes..." />
              <div className="mt-3">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Mark as Resolved</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeDetails;
