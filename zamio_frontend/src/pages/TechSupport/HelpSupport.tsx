import React, { FormEvent, useState } from 'react';
import { HelpCircle, Mail, Info, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { PageBody, PageContainer, PageHeader, PageSection } from '../../components/ui';

const faqs = [
  {
    q: 'How does airplay detection work?',
    a: 'We use automated fingerprinting to scan your station’s stream and match it to our music database in real time.',
  },
  {
    q: 'How do I add or update stream links?',
    a: 'Go to your Station Profile > Stream Links and submit a valid streaming URL (e.g. Icecast, SHOUTcast).',
  },
  {
    q: 'What counts as a play?',
    a: 'A play is counted when a song is continuously detected for more than 30 seconds.',
  },
];

const issueOptions = [
  { value: 'account', label: 'Account / Login' },
  { value: 'playlog', label: 'Playlog Issue' },
  { value: 'report', label: 'Report Export' },
  { value: 'other', label: 'Other' },
];

const EducationSupport = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [issueCategory, setIssueCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fieldClass =
    'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-[0_12px_40px_rgba(15,23,42,0.1)] transition focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/40 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/60 dark:shadow-[0_12px_40px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    window.setTimeout(() => {
      setStatusMessage('Thanks! Our support team will reply within 1 business day.');
      setIsSubmitting(false);
      setEmail('');
      setIssueCategory('');
      setMessage('');
    }, 600);
  };

  return (
    <PageContainer bleed padding="none">
      <PageBody className="max-w-5xl">
        <PageHeader
          title="Education & Support"
          subtitle="Browse quick answers or open a ticket—our team is on standby."
          icon={<HelpCircle className="h-6 w-6" />}
        />

        <PageSection padding="lg">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">📚 FAQ & Help Articles</h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-white/15">
            {faqs.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.q} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left text-base font-medium text-slate-900 transition-colors dark:text-white"
                  >
                    {item.q}
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-500 dark:text-white/60" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500 dark:text-white/60" />
                    )}
                  </button>
                  {isOpen && <p className="mt-2 text-sm text-slate-600 dark:text-white/70">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </PageSection>

        <PageSection padding="lg">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-fuchsia-300" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">📨 Contact Support</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/70">
            Describe your issue and we’ll route it to the right team. Include links or timestamps if available.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="support-email" className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-white/60" />
                <input
                  id="support-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  required
                  className={`${fieldClass} pl-12`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="support-category" className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Issue Category
              </label>
              <div className="relative">
                <select
                  id="support-category"
                  value={issueCategory}
                  onChange={(event) => setIssueCategory(event.target.value)}
                  required
                  className={`${fieldClass} appearance-none pr-12`}
                >
                  <option value="" disabled>
                    Select an issue category
                  </option>
                  {issueOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-white/60" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="support-message" className="text-sm font-semibold text-slate-700 dark:text-white/80">
                How can we help?
              </label>
              <textarea
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                required
                placeholder="Share as much context as possible so we can respond quickly."
                className={`${fieldClass} min-h-[140px] resize-none leading-relaxed`}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {statusMessage && (
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">{statusMessage}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 self-end rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(168,85,247,0.35)] transition hover:shadow-[0_22px_55px_rgba(168,85,247,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Sending…' : 'Send Ticket'}
              </button>
            </div>
          </form>
        </PageSection>

        <PageSection padding="lg" className="border-sky-300/60 bg-sky-50 dark:border-info/40 dark:bg-info/10">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-sky-500 dark:text-info" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">🎧 Music Usage Policy</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
                Learn your responsibilities as a broadcaster or content owner under the RoyaltyGH system.
              </p>
              <button
                type="button"
                className="mt-3 text-sm font-semibold text-sky-600 underline-offset-4 transition-colors hover:text-sky-500 dark:text-info dark:hover:text-info/80"
              >
                View Policy Guide →
              </button>
            </div>
          </div>
        </PageSection>

        <PageSection padding="lg">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
            <BarChart3 className="h-5 w-5 text-success" /> Genre Balance Insights
          </h2>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-[0_18px_45px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl">
            <p className="font-medium text-slate-900 dark:text-white">Last Month Mix</p>
            <ul className="mt-3 space-y-1 text-slate-600 dark:text-white/70">
              <li>• Afrobeats: 40%</li>
              <li>• Gospel: 25%</li>
              <li>• Hiplife: 20%</li>
              <li>• Other: 15%</li>
            </ul>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <div className="float-left h-full w-[40%] bg-emerald-400/90 dark:bg-emerald-400/80" />
              <div className="float-left h-full w-[25%] bg-fuchsia-400/90 dark:bg-fuchsia-400/80" />
              <div className="float-left h-full w-[20%] bg-amber-400/90 dark:bg-amber-400/80" />
              <div className="float-left h-full w-[15%] bg-slate-400/60 dark:bg-white/40" />
            </div>
          </div>
        </PageSection>
      </PageBody>
    </PageContainer>
  );
};

export default EducationSupport;
