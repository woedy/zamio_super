import { Star, MessageSquareQuote, ThumbsUp } from "lucide-react";

export default function FeedbackReviewsPage() {


    const reviews = [
        {
          track: "Sunset Drive",
          rating: 5,
          comment: "Absolutely loved the vibe. Please release more like this!",
          source: "Fan App",
          sentiment: "positive",
          date: "2025-07-10",
        },
        {
          track: "Lost in Ghana",
          rating: 3,
          comment: "Good rhythm, but vocals felt off in the chorus.",
          source: "Streaming App",
          sentiment: "neutral",
          date: "2025-07-08",
        },
        {
          track: "Echoes of Accra",
          rating: 4,
          comment: "Catchy and original! Been on repeat.",
          source: "Fan Form",
          sentiment: "positive",
          date: "2025-07-06",
        },
      ];

      
  return (
    <div className="min-h-screen bg-whiten text-black dark:bg-slate-950 dark:text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎧 Feedback & Reviews</h1>
          <p className="text-sm text-white/60">See what fans are saying about your music.</p>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-stroke dark:border-white/10">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{r.track}</h2>
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  {[...Array(5 - r.rating)].map((_, i) => <Star key={i} size={16} className="text-white/20" />)}
                </div>
              </div>
              <p className="text-white/80 text-sm italic mb-2">"{r.comment}"</p>
              <div className="flex justify-between text-xs text-white/50">
                <span className="flex items-center gap-1"><MessageSquareQuote size={12} /> {r.source}</span>
                <span>{r.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sentiment Summary (Placeholder) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg mt-10 border border-stroke dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4">💬 Sentiment Summary</h3>
          <div className="flex gap-6 text-sm text-white/80">
            <div>👍 Positive: <span className="text-white font-bold">67%</span></div>
            <div>😐 Neutral: <span className="text-white font-bold">25%</span></div>
            <div>👎 Negative: <span className="text-white font-bold">8%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
