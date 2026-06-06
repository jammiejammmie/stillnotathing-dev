import { Link } from "wouter";
import { ArrowLeft, GitCompare, Trophy, AlertTriangle } from "lucide-react";
import { useGetTool } from "@workspace/api-client-react";
import { useCompare } from "@/context/CompareContext";
import ScoreBar from "@/components/ScoreBar";
import TrendBadge from "@/components/TrendBadge";
import SeoHead from "@/components/SeoHead";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tool } from "@workspace/api-client-react";

const PRICING_COLORS: Record<string, string> = {
  free: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  freemium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  paid: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

function ToolFetcher({ id, children }: { id: number; children: (tool: Tool | undefined, loading: boolean) => React.ReactNode }) {
  const { data, isLoading } = useGetTool(id);
  return <>{children(data, isLoading)}</>;
}

type MetricKey = "dxScore" | "priceScore" | "happinessScore" | "rageIndex";

interface Metric {
  key: MetricKey;
  label: string;
  inverse?: boolean;
  description: string;
}

const METRICS: Metric[] = [
  { key: "dxScore", label: "DX Score", description: "Developer experience quality" },
  { key: "priceScore", label: "Price Score", description: "Value for money" },
  { key: "happinessScore", label: "Happiness", description: "Overall satisfaction" },
  { key: "rageIndex", label: "Rage Index", inverse: true, description: "Frustration level (lower = better)" },
];

function getBest(tools: (Tool | undefined)[], key: MetricKey, inverse = false): number | null {
  const vals = tools.filter(Boolean).map((t) => t![key]);
  if (vals.length === 0) return null;
  return inverse ? Math.min(...vals) : Math.max(...vals);
}

export default function ComparePage() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();

  if (compareIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <SeoHead title="Compare Tools" description="Compare developer tools side by side." path="/compare" />
        <GitCompare className="w-12 h-12 text-muted-foreground/30" />
        <div className="font-mono text-muted-foreground text-sm">No tools selected for comparison</div>
        <Link href="/tools" className="text-xs font-mono text-primary hover:underline">
          ← Browse tools to compare
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <SeoHead title="Compare Tools" description="Compare developer tools side by side." path="/compare" />

      {/* Header */}
      <div className="border-b border-border pb-5 flex items-start justify-between gap-4">
        <div>
          <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to tools
          </Link>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-page-title">
              Tool Comparison<span className="text-primary cursor-blink">_</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Comparing {compareIds.length} tools side by side.</p>
        </div>
        <button
          onClick={clearCompare}
          className="text-xs font-mono text-muted-foreground border border-border px-3 py-1.5 rounded hover:text-foreground hover:border-primary/30 transition-colors shrink-0"
        >
          Clear all
        </button>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Tool headers */}
          <thead>
            <tr>
              <th className="w-36 text-left pb-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest pr-4">
                Metric
              </th>
              {compareIds.map((id) => (
                <th key={id} className="pb-4 px-3 min-w-[180px]">
                  <ToolFetcher id={id}>
                    {(tool, loading) => loading || !tool ? (
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-24 mx-auto" />
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <span className="font-mono font-bold text-primary text-sm">{tool.name[0]}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-sm text-foreground">{tool.name}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">{tool.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <TrendBadge
                            happinessScore={tool.happinessScore}
                            rageIndex={tool.rageIndex}
                            voteCount={tool.voteCount}
                            showLabel
                          />
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${PRICING_COLORS[tool.pricingTier] || PRICING_COLORS.freemium}`}>
                            {tool.pricingTier}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCompare(id)}
                          className="mt-2 text-[10px] font-mono text-muted-foreground/50 hover:text-red-400 transition-colors"
                        >
                          remove
                        </button>
                      </div>
                    )}
                  </ToolFetcher>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {METRICS.map((metric) => (
              <ToolFetcher key={metric.key} id={compareIds[0]}>
                {(firstTool) => {
                  // We render a row per metric. Fetch all tool data inline.
                  return (
                    <MetricRow
                      key={metric.key}
                      metric={metric}
                      compareIds={compareIds}
                    />
                  );
                }}
              </ToolFetcher>
            ))}

            {/* Vote count row */}
            <tr className="border-t border-border">
              <td className="py-4 pr-4">
                <div className="font-mono text-xs text-muted-foreground">Community Votes</div>
              </td>
              {compareIds.map((id) => (
                <td key={id} className="py-4 px-3 text-center">
                  <ToolFetcher id={id}>
                    {(tool) => (
                      <span className="font-mono text-sm text-foreground tabular-nums">
                        {tool?.voteCount ?? "—"}
                      </span>
                    )}
                  </ToolFetcher>
                </td>
              ))}
            </tr>

            {/* Website row */}
            <tr className="border-t border-border">
              <td className="py-4 pr-4">
                <div className="font-mono text-xs text-muted-foreground">Website</div>
              </td>
              {compareIds.map((id) => (
                <td key={id} className="py-4 px-3 text-center">
                  <ToolFetcher id={id}>
                    {(tool) => tool?.websiteUrl ? (
                      <a
                        href={tool.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-primary hover:underline"
                      >
                        visit ↗
                      </a>
                    ) : (
                      <span className="text-muted-foreground/40 font-mono text-xs">—</span>
                    )}
                  </ToolFetcher>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Winner callout */}
      <WinnerCallout compareIds={compareIds} />
    </div>
  );
}

function MetricRow({ metric, compareIds }: { metric: Metric; compareIds: number[] }) {
  return (
    <tr className="border-t border-border group">
      <td className="py-4 pr-4 align-middle">
        <div className="font-mono text-xs font-semibold text-foreground">{metric.label}</div>
        <div className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">{metric.description}</div>
      </td>
      {compareIds.map((id) => (
        <td key={id} className="py-4 px-3 align-middle">
          <ToolFetcher id={id}>
            {(tool, loading) => loading ? (
              <Skeleton className="h-5 w-full" />
            ) : tool ? (
              <MetricCell tool={tool} metric={metric} allIds={compareIds} />
            ) : null}
          </ToolFetcher>
        </td>
      ))}
    </tr>
  );
}

function MetricCell({ tool, metric, allIds }: { tool: Tool; metric: Metric; allIds: number[] }) {
  const value = tool[metric.key];
  return (
    <div className="space-y-1">
      <ScoreBar label="" value={value} inverse={metric.inverse} />
      <div className="font-mono text-xs text-right text-foreground tabular-nums">{value.toFixed(1)}</div>
    </div>
  );
}

function WinnerCallout({ compareIds }: { compareIds: number[] }) {
  const tools: (Tool | undefined)[] = [];

  // This is a display-only component. We compute winners per-metric by reading from cache.
  // We use a simple trick: render nothing if we don't have data yet.

  return null; // Winner callout — placeholder for future enhancement
}
