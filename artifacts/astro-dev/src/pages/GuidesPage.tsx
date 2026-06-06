import { useState } from "react";
import { Link } from "wouter";
import { Clock, BookOpen, Bug, GraduationCap } from "lucide-react";
import { useListGuides } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_CONFIG = {
  guide: { label: "Guide", icon: BookOpen, color: "text-primary bg-primary/10 border-primary/20" },
  "error-fix": { label: "Error Fix", icon: Bug, color: "text-red-400 bg-red-400/10 border-red-400/20" },
  tutorial: { label: "Tutorial", icon: GraduationCap, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "guide", label: "Guides" },
  { value: "error-fix", label: "Error Fixes" },
  { value: "tutorial", label: "Tutorials" },
];

export default function GuidesPage() {
  const [selectedType, setSelectedType] = useState<string>("");
  const { data: guides, isLoading } = useListGuides({ type: selectedType || undefined });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <span className="font-mono text-xs text-primary uppercase tracking-widest">Knowledge Base</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1" data-testid="text-page-title">
          Guides & Error Fixes<span className="text-primary cursor-blink">_</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          How-tos, debugging walkthroughs, and step-by-step tutorials for solo builders.
        </p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap" data-testid="section-type-filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setSelectedType(f.value)}
            className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${
              selectedType === f.value
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
            data-testid={`button-type-${f.value || "all"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Guides list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-5 bg-card space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : guides && guides.length > 0 ? (
        <div className="space-y-3" data-testid="list-guides">
          {guides.map((guide) => {
            const config = TYPE_CONFIG[guide.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.guide;
            const Icon = config.icon;
            const date = new Date(guide.publishedAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            });

            return (
              <Link key={guide.id} href={`/guides/${guide.id}`}>
                <div
                  className="group border border-border rounded-lg p-5 bg-card hover:border-primary/30 transition-all duration-200 cursor-pointer"
                  data-testid={`card-guide-${guide.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h2
                          className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2"
                          data-testid={`text-guide-title-${guide.id}`}
                        >
                          {guide.title}
                        </h2>
                        {guide.isFeatured && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded shrink-0">
                            featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{guide.excerpt}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
                        <span className={`px-1.5 py-0.5 rounded border ${config.color}`}>{config.label}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{guide.readingTime}m</span>
                        {guide.author && <span>{guide.author}</span>}
                        <span>{date}</span>
                      </div>
                      {guide.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {guide.tags.split(",").slice(0, 4).map((tag) => (
                            <span key={tag.trim()} className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-border rounded-lg bg-card" data-testid="empty-guides">
          <div className="font-mono text-muted-foreground text-sm">No guides yet</div>
          <div className="font-mono text-muted-foreground/50 text-xs mt-2">Check back soon</div>
        </div>
      )}
    </div>
  );
}
