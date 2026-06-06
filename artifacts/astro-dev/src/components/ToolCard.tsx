import { Link } from "wouter";
import ScoreBar from "./ScoreBar";
import type { Tool } from "@workspace/api-client-react";

interface ToolCardProps {
  tool: Tool;
}

const PRICING_COLORS: Record<string, string> = {
  free: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  freemium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  paid: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.id}`} data-testid={`card-tool-${tool.id}`}>
      <div className="group border border-border rounded-lg p-4 bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-200 cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {tool.logoUrl ? (
              <img
                src={tool.logoUrl}
                alt={tool.name}
                className="w-8 h-8 rounded object-contain bg-muted shrink-0"
                data-testid={`img-tool-logo-${tool.id}`}
              />
            ) : (
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="font-mono font-bold text-primary text-xs">{tool.name[0]}</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-sm text-foreground truncate" data-testid={`text-tool-name-${tool.id}`}>{tool.name}</div>
              <div className="text-xs text-muted-foreground font-mono truncate">{tool.category}</div>
            </div>
          </div>
          <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border shrink-0 ${PRICING_COLORS[tool.pricingTier] || PRICING_COLORS.freemium}`}>
            {tool.pricingTier}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{tool.tagline}</p>

        <div className="space-y-2">
          <ScoreBar label="DX Score" value={tool.dxScore} />
          <ScoreBar label="Price Score" value={tool.priceScore} />
          <ScoreBar label="Happiness" value={tool.happinessScore} />
          <ScoreBar label="Rage Index" value={tool.rageIndex} inverse />
        </div>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>{tool.voteCount} votes</span>
          <span className="text-primary/70 group-hover:text-primary transition-colors">view →</span>
        </div>
      </div>
    </Link>
  );
}
