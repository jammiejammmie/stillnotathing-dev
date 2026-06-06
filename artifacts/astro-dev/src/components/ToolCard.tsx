import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import ScoreBar from "./ScoreBar";
import ShareButton from "./ShareButton";
import TrendBadge from "./TrendBadge";
import type { Tool } from "@workspace/api-client-react";
import { useVoteOnTool, useGetTool, getGetToolQueryKey, getListToolsQueryKey, getGetTopToolsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface ToolCardProps {
  tool: Tool;
}

const PRICING_COLORS: Record<string, string> = {
  free: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  freemium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  paid: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

export default function ToolCard({ tool: initialTool }: ToolCardProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [localVoteDelta, setLocalVoteDelta] = useState(0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const { mutate: vote } = useVoteOnTool({
    mutation: {
      onMutate: ({ params, data }) => {
        const dir = data.direction;
        if (voted === dir) return;
        setVoted(dir);
        setLocalVoteDelta((prev) => prev + (dir === "up" ? 1 : -1));
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTopToolsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetToolQueryKey(initialTool.id) });
      },
    },
  });

  const handleVote = (e: React.MouseEvent, direction: "up" | "down") => {
    e.preventDefault();
    e.stopPropagation();
    if (voted === direction) return;
    vote({ params: { id: initialTool.id }, data: { direction } });
  };

  const displayVotes = initialTool.voteCount + localVoteDelta;
  const toolUrl = `${window.location.origin}/tools/${initialTool.id}`;

  return (
    <div
      className="group border border-border rounded-lg p-4 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-200 h-full flex flex-col"
      data-testid={`card-tool-${initialTool.id}`}
    >
      {/* Header — clickable */}
      <div
        className="cursor-pointer flex-1"
        onClick={() => navigate(`/tools/${initialTool.id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {initialTool.logoUrl ? (
              <img
                src={initialTool.logoUrl}
                alt={initialTool.name}
                className="w-8 h-8 rounded object-contain bg-muted shrink-0"
                data-testid={`img-tool-logo-${initialTool.id}`}
              />
            ) : (
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="font-mono font-bold text-primary text-xs">{initialTool.name[0]}</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-sm text-foreground truncate" data-testid={`text-tool-name-${initialTool.id}`}>
                {initialTool.name}
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate">{initialTool.category}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <TrendBadge
              happinessScore={initialTool.happinessScore}
              rageIndex={initialTool.rageIndex}
              voteCount={initialTool.voteCount}
            />
            <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${PRICING_COLORS[initialTool.pricingTier] || PRICING_COLORS.freemium}`}>
              {initialTool.pricingTier}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{initialTool.tagline}</p>

        <div className="space-y-2">
          <ScoreBar label="DX Score" value={initialTool.dxScore} />
          <ScoreBar label="Price Score" value={initialTool.priceScore} />
          <ScoreBar label="Happiness" value={initialTool.happinessScore} />
          <ScoreBar label="Rage Index" value={initialTool.rageIndex} inverse />
        </div>
      </div>

      {/* Footer — voting + share, not part of the link */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => handleVote(e, "up")}
            data-testid={`button-vote-up-${initialTool.id}`}
            title="Upvote"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded border font-mono text-[10px] transition-all duration-150
              ${voted === "up"
                ? "text-primary border-primary/40 bg-primary/10"
                : "text-muted-foreground border-border hover:text-primary hover:border-primary/30 hover:bg-primary/5"
              }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span className="tabular-nums">{displayVotes}</span>
          </button>
          <button
            onClick={(e) => handleVote(e, "down")}
            data-testid={`button-vote-down-${initialTool.id}`}
            title="Downvote"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded border font-mono text-[10px] transition-all duration-150
              ${voted === "down"
                ? "text-red-400 border-red-400/40 bg-red-400/10"
                : "text-muted-foreground border-border hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5"
              }`}
          >
            <ThumbsDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <ShareButton title={initialTool.name} url={toolUrl} size="xs" />
          <span
            className="text-[10px] font-mono text-primary/70 group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => navigate(`/tools/${initialTool.id}`)}
          >
            view →
          </span>
        </div>
      </div>
    </div>
  );
}
