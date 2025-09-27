import { Star, MessageSquareQuote, ThumbsUp } from 'lucide-react';
import { PageBody, PageContainer, PageHeader, PageSection } from '../../components/ui';

const reviews = [
  {
    track: 'Sunset Drive',
    rating: 5,
    comment: 'Absolutely loved the vibe. Please release more like this!',
    source: 'Fan App',
    sentiment: 'positive',
    date: '2025-07-10',
  },
  {
    track: 'Lost in Ghana',
    rating: 3,
    comment: 'Good rhythm, but vocals felt off in the chorus.',
    source: 'Streaming App',
    sentiment: 'neutral',
    date: '2025-07-08',
  },
  {
    track: 'Echoes of Accra',
    rating: 4,
    comment: 'Catchy and original! Been on repeat.',
    source: 'Fan Form',
    sentiment: 'positive',
    date: '2025-07-06',
  },
];

export default function FeedbackReviewsPage() {
  return (
    <PageContainer bleed padding="none">
      <PageBody className="max-w-5xl">
        <PageHeader
          title="Feedback & Reviews"
          subtitle="See what fans are saying about your music."
          icon={<MessageSquareQuote className="h-6 w-6" />}
        />

        <PageSection padding="lg">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <article
                key={`${review.track}-${review.date}`}
                className="flex h-full flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-5 text-slate-900 shadow-[0_25px_55px_rgba(15,23,42,0.12)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_32px_70px_rgba(15,23,42,0.16)] dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-[0_25px_55px_rgba(6,10,32,0.45)] dark:hover:shadow-[0_30px_65px_rgba(6,10,32,0.55)] dark:backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{review.track}</h2>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/70">{review.source}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={`filled-${index}`} size={16} className="fill-current" />
                    ))}
                    {Array.from({ length: Math.max(0, 5 - review.rating) }).map((_, index) => (
                      <Star key={`empty-${index}`} size={16} className="text-slate-300 dark:text-white/30" />
                    ))}
                  </div>
                </div>
                <p className="text-sm italic text-slate-600 dark:text-white/70">“{review.comment}”</p>
                <div className="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-white/60">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500/15 via-fuchsia-500/15 to-pink-500/20 px-2 py-1 text-purple-700 dark:text-white">
                    <ThumbsUp className="h-3.5 w-3.5" /> {review.sentiment}
                  </span>
                  <span className="font-medium text-slate-600 dark:text-white/70">{review.date}</span>
                </div>
              </article>
            ))}
          </div>
        </PageSection>

        <PageSection padding="lg" subtle>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sentiment Overview</h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 dark:text-white/70 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.1)] dark:border-white/15 dark:bg-white/10 dark:shadow-[0_18px_45px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/60">Positive</p>
                <p className="text-2xl font-semibold text-emerald-500 dark:text-emerald-200">67%</p>
                <p className="text-xs text-slate-600 dark:text-white/70">Fans are loving your latest release.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.1)] dark:border-white/15 dark:bg-white/10 dark:shadow-[0_18px_45px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/60">Neutral</p>
                <p className="text-2xl font-semibold text-amber-500 dark:text-amber-200">25%</p>
                <p className="text-xs text-slate-600 dark:text-white/70">Keep an eye on vocals and mix quality.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.1)] dark:border-white/15 dark:bg-white/10 dark:shadow-[0_18px_45px_rgba(6,10,32,0.45)] dark:backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/60">Negative</p>
                <p className="text-2xl font-semibold text-rose-500 dark:text-rose-200">8%</p>
                <p className="text-xs text-slate-600 dark:text-white/70">Reach out to fans who raised issues.</p>
              </div>
            </div>
          </div>
        </PageSection>
      </PageBody>
    </PageContainer>
  );
}
