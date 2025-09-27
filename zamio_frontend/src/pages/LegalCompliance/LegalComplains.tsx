import { FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { PageBody, PageContainer, PageHeader, PageSection } from '../../components/ui';

const legalData = {
  termsAcceptedDate: '2025-05-12',
  agreements: [
    { name: "Split Sheet - 'Afro Fire'", url: '/docs/splits-afrofire.pdf' },
    { name: 'Platform Terms (v2.1)', url: '/docs/terms-v2.1.pdf' },
    { name: 'Radio Royalty Compliance Guide', url: '/docs/compliance.pdf' },
  ],
};

export default function LegalCompliancePage() {
  return (
    <PageContainer bleed padding="none">
      <PageBody className="max-w-5xl">
        <PageHeader
          title="Legal & Compliance"
          subtitle="Manage your agreements, policies, and dispute readiness."
          icon={<ShieldCheck className="h-6 w-6" />}
        />

        <PageSection padding="lg">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-300" /> Terms &amp; Policy Acceptance
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-white/70">
            Last accepted on{' '}
            <span className="font-medium text-slate-900 dark:text-white">{legalData.termsAcceptedDate}</span>
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            You’ll be prompted to accept new terms whenever we release major updates. We’ll notify you in-app and via email so you never miss important changes.
          </p>
        </PageSection>

        <PageSection padding="lg">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <FileText className="h-5 w-5 text-fuchsia-300" /> Download Agreements
          </h2>
          <ul className="mt-4 space-y-3">
            {legalData.agreements.map((doc) => (
              <li
                key={doc.name}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.12)] transition dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-[0_20px_45px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl"
              >
                <span className="font-medium text-slate-900 dark:text-white">{doc.name}</span>
                <a
                  href={doc.url}
                  download
                  className="text-sm font-semibold text-fuchsia-600 transition-colors hover:text-fuchsia-500 dark:text-fuchsia-200 dark:hover:text-fuchsia-100"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </PageSection>

        <PageSection padding="lg" className="border-amber-300/60 bg-amber-50 dark:border-amber-400/40 dark:bg-amber-500/15">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-700 dark:text-amber-200">
            <AlertCircle className="h-5 w-5" /> Dispute Claim Center (Coming Soon)
          </h2>
          <p className="mt-2 text-sm text-amber-900/80 dark:text-white/70">
            Soon you’ll be able to file claims for misattributed airplay, incorrect matches, or payment issues directly from this dashboard. We’re polishing the experience to make it quick, transparent, and trackable.
          </p>
        </PageSection>
      </PageBody>
    </PageContainer>
  );
}
