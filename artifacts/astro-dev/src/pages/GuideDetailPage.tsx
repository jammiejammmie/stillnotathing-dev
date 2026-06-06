import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, BookOpen, Bug, GraduationCap, User, Calendar } from "lucide-react";
import { useGetGuide, getGetGuideQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import ShareButton from "@/components/ShareButton";

const TYPE_CONFIG = {
  guide: { label: "Guide", icon: BookOpen, color: "text-primary bg-primary/10 border-primary/20" },
  "error-fix": { label: "Error Fix", icon: Bug, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  tutorial: { label: "Tutorial", icon: GraduationCap, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
};

export default function GuideDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: guide, isLoading } = useGetGuide(id, { query: { enabled: !!id, queryKey: getGetGuideQueryKey(id) } });

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="text-center py-16">
        <div className="font-mono text-muted-foreground">Guide not found</div>
        <Link href="/guides" className="text-primary text-sm font-mono mt-2 inline-block hover:underline">← back to guides</Link>
      </div>
    );
  }

  const config = TYPE_CONFIG[guide.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.guide;
  const Icon = config.icon;
  const date = new Date(guide.publishedAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in-up">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link href="/guides" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors" data-testid="link-back">
          <ArrowLeft className="w-3.5 h-3.5" /> back to guides
        </Link>
        <ShareButton title={guide.title} size="sm" />
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2 py-1 rounded border ${config.color}`}>
            <Icon className="w-3.5 h-3.5" /> {config.label}
          </span>
          {guide.isFeatured && (
            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded">
              featured
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight" data-testid="text-guide-title">
          {guide.title}
        </h1>

        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{guide.readingTime} min read</span>
          {guide.author && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{guide.author}</span>}
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{date}</span>
        </div>

        {guide.tags && (
          <div className="flex flex-wrap gap-1.5" data-testid="section-tags">
            {guide.tags.split(",").map((tag) => (
              <span key={tag.trim()} className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Excerpt */}
      <div className="border-l-2 border-primary/40 pl-4" data-testid="section-excerpt">
        <p className="text-base text-muted-foreground italic">{guide.excerpt}</p>
      </div>

      {/* Content */}
      {guide.content ? (
        <div
          className="prose prose-sm prose-invert max-w-none text-foreground/80 leading-relaxed space-y-4"
          data-testid="section-content"
        >
          {guide.content.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm leading-7">{para}</p>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg p-6 bg-card text-center" data-testid="section-no-content">
          <div className="font-mono text-muted-foreground text-sm">Full content coming soon</div>
        </div>
      )}

      {/* Footer nav */}
      <div className="border-t border-border pt-6 flex items-center justify-between">
        <Link href="/guides" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> All guides
        </Link>
        <ShareButton title={guide.title} size="sm" />
      </div>
    </div>
  );
}
