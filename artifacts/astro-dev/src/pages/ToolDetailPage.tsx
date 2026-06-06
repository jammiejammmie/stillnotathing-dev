import { useParams, Link } from "wouter";
import { useState } from "react";
import { ExternalLink, ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle, XCircle } from "lucide-react";
import {
  useGetTool,
  getGetToolQueryKey,
  useVoteOnTool,
  getGetTopToolsQueryKey,
  getListToolsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import ScoreBar from "@/components/ScoreBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PRICING_COLORS: Record<string, string> = {
  free: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  freemium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  paid: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

export default function ToolDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const { data: tool, isLoading } = useGetTool(id, { query: { enabled: !!id, queryKey: getGetToolQueryKey(id) } });
  const vote = useVoteOnTool();

  const handleVote = (type: "up" | "down") => {
    if (voted) return;
    vote.mutate(
      { toolId: id, data: { type } },
      {
        onSuccess: () => {
          setVoted(type);
          queryClient.invalidateQueries({ queryKey: getGetToolQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetTopToolsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
          toast({ title: type === "up" ? "Upvoted!" : "Downvoted", description: `Your vote on ${tool?.name} was recorded.` });
        },
        onError: () => toast({ title: "Vote failed", description: "Try again later.", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="text-center py-16">
        <div className="font-mono text-muted-foreground">Tool not found</div>
        <Link href="/tools" className="text-primary text-sm font-mono mt-2 inline-block hover:underline">← back to tools</Link>
      </div>
    );
  }

  const scoreItems = [
    { label: "DX Score", value: tool.dxScore, inverse: false },
    { label: "Price Score", value: tool.priceScore, inverse: false },
    { label: "Happiness", value: tool.happinessScore, inverse: false },
    { label: "Rage Index", value: tool.rageIndex, inverse: true },
  ];

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in-up">
      {/* Back */}
      <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors" data-testid="link-back">
        <ArrowLeft className="w-3.5 h-3.5" /> back to tools
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        {tool.logoUrl ? (
          <img src={tool.logoUrl} alt={tool.name} className="w-16 h-16 rounded-lg object-contain bg-muted border border-border p-1 shrink-0" data-testid="img-tool-logo" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="font-mono font-bold text-primary text-xl">{tool.name[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-tool-name">{tool.name}</h1>
            <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${PRICING_COLORS[tool.pricingTier] || PRICING_COLORS.freemium}`}>
              {tool.pricingTier}
            </span>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{tool.category}</span>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-tool-tagline">{tool.tagline}</p>
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline mt-1"
            data-testid="link-tool-website"
          >
            {tool.website.replace(/^https?:\/\//, "")} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Scores */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4" data-testid="section-scores">
        <div className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">Scorecard</div>
        {scoreItems.map((item) => (
          <ScoreBar key={item.label} label={item.label} value={item.value} inverse={item.inverse} />
        ))}
      </div>

      {/* Description */}
      {tool.description && (
        <div className="space-y-2" data-testid="section-description">
          <div className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">About</div>
          <p className="text-sm text-foreground/80 leading-relaxed">{tool.description}</p>
        </div>
      )}

      {/* Pros & Cons */}
      {(tool.pros || tool.cons) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="section-pros-cons">
          {tool.pros && (
            <div className="border border-emerald-500/20 rounded-lg p-4 bg-emerald-500/5">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider">Pros</span>
              </div>
              <ul className="space-y-1">
                {tool.pros.split("\n").filter(Boolean).map((pro, i) => (
                  <li key={i} className="text-xs text-foreground/70 flex gap-1.5"><span className="text-emerald-500/50">+</span>{pro}</li>
                ))}
              </ul>
            </div>
          )}
          {tool.cons && (
            <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
              <div className="flex items-center gap-1.5 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="font-mono text-xs font-semibold text-red-400 uppercase tracking-wider">Cons</span>
              </div>
              <ul className="space-y-1">
                {tool.cons.split("\n").filter(Boolean).map((con, i) => (
                  <li key={i} className="text-xs text-foreground/70 flex gap-1.5"><span className="text-red-500/50">-</span>{con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Vote */}
      <div className="border border-border rounded-lg p-5 bg-card flex items-center justify-between" data-testid="section-vote">
        <div>
          <div className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Community Vote</div>
          <div className="text-2xl font-bold font-mono text-primary tabular-nums" data-testid="text-vote-count">{tool.voteCount}</div>
          <div className="text-xs text-muted-foreground font-mono">total votes</div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={voted === "up" ? "default" : "outline"}
            onClick={() => handleVote("up")}
            disabled={!!voted || vote.isPending}
            className="font-mono"
            data-testid="button-vote-up"
          >
            <ThumbsUp className="w-4 h-4 mr-1" /> Up
          </Button>
          <Button
            size="sm"
            variant={voted === "down" ? "destructive" : "outline"}
            onClick={() => handleVote("down")}
            disabled={!!voted || vote.isPending}
            className="font-mono"
            data-testid="button-vote-down"
          >
            <ThumbsDown className="w-4 h-4 mr-1" /> Down
          </Button>
        </div>
      </div>
    </div>
  );
}
