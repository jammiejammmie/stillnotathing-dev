import { ExternalLink, MessageSquare, TrendingUp } from "lucide-react";
import { useGetHnCurated, getGetHnCuratedQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import ShareButton from "@/components/ShareButton";

const TAG_COLORS: Record<string, string> = {
  "show hn": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "ask hn": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  tool: "text-primary bg-primary/10 border-primary/20",
  launch: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  discussion: "text-muted-foreground bg-muted border-border",
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function HnPage() {
  const { data: stories, isLoading } = useGetHnCurated(
    { limit: 30 },
    { query: { queryKey: getGetHnCuratedQueryKey({ limit: 30 }) } }
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <span className="font-mono text-xs text-primary uppercase tracking-widest">Curated Feed</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1" data-testid="text-page-title">
          Hacker News<span className="text-primary cursor-blink">_</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          The best of HN, filtered for indie hackers and builders. No fluff.
        </p>
      </div>

      {/* Stories */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4 bg-card">
              <div className="flex gap-3">
                <Skeleton className="w-6 h-6 rounded shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : stories && stories.length > 0 ? (
        <div className="space-y-2" data-testid="list-hn-stories">
          {stories.map((story, i) => (
            <div
              key={story.id}
              className="group flex items-start gap-4 border border-border rounded-lg p-4 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-150"
              data-testid={`card-hn-story-${story.id}`}
            >
              {/* Rank */}
              <span className="font-mono text-xs text-muted-foreground/40 tabular-nums mt-0.5 shrink-0 w-5 text-right">{i + 1}</span>

              {/* Content — clickable area */}
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0"
              >
                <div className="flex items-start gap-2 flex-wrap mb-1">
                  {story.tag && (
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border shrink-0 ${TAG_COLORS[story.tag.toLowerCase()] || TAG_COLORS.discussion}`}>
                      {story.tag}
                    </span>
                  )}
                  <h2 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2" data-testid={`text-hn-title-${story.id}`}>
                    {story.title}
                  </h2>
                </div>

                {story.curatorNote && (
                  <p className="text-xs text-primary/70 italic mb-1.5">{story.curatorNote}</p>
                )}

                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground flex-wrap">
                  {story.domain && (
                    <span className="text-primary/50">{story.domain}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {story.score} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {story.commentCount}
                  </span>
                  {story.author && <span>by {story.author}</span>}
                  <span>{timeAgo(story.postedAt)}</span>
                </div>
              </a>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <ShareButton title={story.title} url={story.url} size="xs" />
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground/30 hover:text-primary/50 transition-colors" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-border rounded-lg bg-card" data-testid="empty-hn">
          <div className="font-mono text-muted-foreground text-sm">No curated stories yet</div>
          <div className="font-mono text-muted-foreground/50 text-xs mt-2">Check back tomorrow</div>
        </div>
      )}
    </div>
  );
}
