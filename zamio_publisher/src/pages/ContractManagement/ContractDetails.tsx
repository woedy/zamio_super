import { useEffect, useState } from 'react';
import { FileText, Download, CheckCircle, XCircle } from 'lucide-react';
import { baseUrl, baseUrlMedia, userToken } from '../../constants';
import { useLocation, useSearchParams } from 'react-router-dom';

const ContractDetails = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const stateId = (location.state as any)?.contract_id as number | undefined;
  const qId = params.get('contract_id');
  const contractId = stateId || (qId ? Number(qId) : undefined);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!contractId) { setError('Missing contract_id'); return; }
      setLoading(true); setError(null);
      try {
        const url = `${baseUrl}api/publishers/contract-details/?contract_id=${encodeURIComponent(String(contractId))}`;
        const resp = await fetch(url, { headers: { 'Content-Type': 'application/json', Authorization: `Token ${userToken}` } });
        const json = await resp.json();
        if (!resp.ok) {
          const msg = json?.errors ? (Object.values(json.errors).flat() as string[]).join('\n') : json?.message || 'Failed to load';
          throw new Error(msg);
        }
        setData(json?.data || null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [contractId]);

  const fileUrl = data?.contract_file ? (String(data.contract_file).startsWith('http') ? data.contract_file : `${baseUrlMedia}${data.contract_file}`) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Contract Details</h1>
        </div>

        {error && <div className="mb-3 bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-2 rounded">{error}</div>}
        {loading && <div className="text-gray-300">Loading…</div>}
        {data && (
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-gray-300 text-sm">Artist</div>
                <div className="text-white font-semibold">{data.artist_name}</div>
              </div>
              <div>
                <div className="text-gray-300 text-sm">Track</div>
                <div className="text-white font-semibold">{data.track_title}</div>
              </div>
              <div>
                <div className="text-gray-300 text-sm">Writer Share</div>
                <div className="text-white">{data.writer_share}%</div>
              </div>
              <div>
                <div className="text-gray-300 text-sm">Publisher Share</div>
                <div className="text-white">{data.publisher_share}%</div>
              </div>
              <div>
                <div className="text-gray-300 text-sm">Agreement Date</div>
                <div className="text-white">{data.agreement_date}</div>
              </div>
              <div>
                <div className="text-gray-300 text-sm">Status</div>
                <div className="text-white">{data.status}</div>
              </div>
              <div className="flex items-center gap-2">
                {data.verified_by_admin ? (
                  <><CheckCircle className="w-5 h-5 text-green-400" /><span className="text-green-300">Verified by Admin</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-yellow-400" /><span className="text-yellow-300">Pending Verification</span></>
                )}
              </div>
            </div>

            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded border border-white/20 hover:bg-white/20">
                <Download className="w-4 h-4" /> Download Contract
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetails;