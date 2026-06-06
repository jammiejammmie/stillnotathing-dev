import { Link } from "wouter";
import { ExternalLink, TrendingUp, BookOpen, Newspaper, ArrowRight, Zap } from "lucide-react";
import {
  useGetTopTools,
  useGetDailyGuide,
  useGetHnCurated,
  useGetStatsSummary,
} from "@workspace/api-client-react";
import ScoreBar from "@/components/ScoreBar";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card" data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="font-mono text-2xl font-bold text-primary tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5 font-mono">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function HomePage() {
  const { data: topTools, isLoading: toolsLoading } = useGetTopTools();
  const { data: dailyGuide, isLoading: guideLoading } = useGetDailyGuide();
  const { data: hnStories, isLoading: hnLoading } = useGetHnCurated({ limit: 8 });
  const { data: stats } = useGetStatsSummary();

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-primary uppercase tracking-widest">Morning Briefing</span>
          <span className="font-mono text-xs text-muted-foreground">//</span>
          <span className="font-mono text-xs text-muted-foreground">{today}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight" data-testid="text-page-title">
          What's shipping today<span className="text-primary cursor-blink">_</span>
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-lg">
          Tools, guides, and curated HN stories for indie hackers and solo builders.
        </p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="section-stats">
          <StatCard label="tools indexed" value={stats.totalTools} />
          <StatCard label="guides published" value={stats.totalGuides} />
          <StatCard label="hn stories" value={stats.totalHnStories} />
          <StatCard label="avg happiness" value={stats.avgHappinessScore.toFixed(1)} sub={`top: ${stats.topCategory}`} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daily guide */}
          <section data-testid="section-daily-guide">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">Today's Guide</span>
              </div>
              <Link href="/guides" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
                all guides <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {guideLoading ? (
              <div className="border border-border rounded-lg p-6 bg-card space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : dailyGuide ? (
              <Link href={`/guides/${dailyGuide.id}`}>
                <div className="group border border-border rounded-lg p-6 bg-card hover:border-primary/30 transition-all duration-200 cursor-pointer" data-testid="card-daily-guide">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className={`text-[10px] font-mono font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        dailyGuide.type === "error-fix"
                          ? "text-red-400 bg-red-400/10"
                          : dailyGuide.type === "tutorial"
                          ? "text-blue-400 bg-blue-400/10"
                          : "text-primary bg-primary/10"
                      }`}>
                        {dailyGuide.type}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{dailyGuide.readingTime}m read</span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors" data-testid="text-daily-guide-title">
                    {dailyGuide.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3">{dailyGuide.excerpt}</p>
                  {dailyGuide.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {dailyGuide.tags.split(",").map((tag) => (
                        <span key={tag.trim()} className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="border border-border rounded-lg p-6 bg-card text-center text-sm text-muted-foreground">
                No guide today yet. Check back soon.
              </div>
            )}
          </section>

          {/* HN Feed */}
          <section data-testid="section-hn-feed">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">Curated HN</span>
              </div>
              <Link href="/hn" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
                all stories <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-1">
              {hnLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border border-border rounded p-3 bg-card">
                      <Skeleton className="h-4 w-4/5 mb-1" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  ))
                : hnStories?.slice(0, 6).map((story, i) => (
                    <a
                      key={story.id}
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 border border-border rounded p-3 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-150 group"
                      data-testid={`card-hn-story-${story.id}`}
                    >
                      <span className="font-mono text-xs text-muted-foreground/50 tabular-nums mt-0.5 shrink-0 w-4 text-right">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 font-medium" data-testid={`text-hn-title-${story.id}`}>
                          {story.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {story.domain && <span className="text-[10px] font-mono text-muted-foreground">{story.domain}</span>}
                          <span className="text-[10px] font-mono text-muted-foreground">{story.score}pts</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{story.commentCount} comments</span>
                        </div>
                        {story.curatorNote && (
                          <p className="text-xs text-primary/70 mt-1 italic">{story.curatorNote}</p>
                        )}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5 group-hover:text-primary/50 transition-colors" />
                    </a>
                  ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Top Tools */}
        <div className="space-y-4" data-testid="section-top-tools">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">Top Tools</span>
            </div>
            <Link href="/tools" className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
              all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {toolsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 bg-card space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-4/5" />
                  </div>
                ))
              : topTools?.slice(0, 5).map((tool) => (
                  <Link key={tool.id} href={`/tools/${tool.id}`}>
                    <div
                      className="group border border-border rounded-lg p-4 bg-card hover:border-primary/30 transition-all duration-200 cursor-pointer"
                      data-testid={`card-top-tool-${tool.id}`}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        {tool.logoUrl ? (
                          <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 rounded object-contain bg-muted shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="font-mono text-primary text-[10px] font-bold">{tool.name[0]}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate" data-testid={`text-top-tool-name-${tool.id}`}>
                            {tool.name}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground">{tool.category}</div>
                        </div>
                      </div>
                      <ScoreBar label="Happiness" value={tool.happinessScore} />
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
