import { FileText, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LegalCompliancePage() {
  const legalData = {
    termsAcceptedDate: '2025-05-12',
    agreements: [
      { name: "Split Sheet - 'Afro Fire'", url: '/docs/splits-afrofire.pdf' },
      { name: 'Platform Terms (v2.1)', url: '/docs/terms-v2.1.pdf' },
      { name: 'Radio Royalty Compliance Guide', url: '/docs/compliance.pdf' },
    ],
  };

  return (
    <div className="min-h-screen bg-whiten text-black dark:bg-slate-950 dark:text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Terms Acceptance */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck size={18} /> Terms & Policy Acceptance
          </h2>
          <p className="text-sm text-slate-700 dark:text-white/80 mt-2">
            Last accepted on:{' '}
            <span className="font-medium text-slate-900 dark:text-white">
              {legalData.termsAcceptedDate}
            </span>
          </p>
          <p className="text-slate-600 dark:text-white/60 text-sm mt-2">
            You are required to accept new terms on major updates. We’ll notify
            you in-app and via email.
          </p>
        </section>

        {/* Agreements & Downloads */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText size={18} /> Download Agreements
          </h2>
          <ul className="mt-4 space-y-3">
            {legalData.agreements.map((doc, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between bg-gray-100 dark:bg-slate-700 px-4 py-3 rounded text-sm border border-stroke dark:border-white/10"
              >
                <span className="text-slate-800 dark:text-white">{doc.name}</span>
                <a
                  href={doc.url}
                  download
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Dispute Center - Future */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-yellow-400/30">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <AlertCircle size={18} /> Dispute Claim Center (Coming Soon)
          </h2>
          <p className="text-sm text-slate-600 dark:text-white/70 mt-2">
            You’ll soon be able to file claims for misattributed airplay,
            incorrect matches, or payment issues. Stay tuned for this feature in
            upcoming updates.
          </p>
        </section>
      </div>
    </div>
  );
}
