import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Trend = "rising" | "falling" | "stable";

export function getTrend(happinessScore: number, rageIndex: number, voteCount: number): Trend {
  if (happinessScore >= 8.5 && rageIndex <= 2.5) return "rising";
  if (happinessScore >= 8.0 && voteCount >= 200) return "rising";
  if (rageIndex >= 4.5 || happinessScore < 7.0) return "falling";
  return "stable";
}

interface TrendBadgeProps {
  happinessScore: number;
  rageIndex: number;
  voteCount: number;
  showLabel?: boolean;
}

const CONFIG: Record<Trend, { icon: typeof TrendingUp; label: string; className: string }> = {
  rising: {
    icon: TrendingUp,
    label: "rising",
    className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  falling: {
    icon: TrendingDown,
    label: "falling",
    className: "text-red-400 bg-red-400/10 border-red-400/20",
  },
  stable: {
    icon: Minus,
    label: "stable",
    className: "text-muted-foreground bg-muted border-border",
  },
};

export default function TrendBadge({ happinessScore, rageIndex, voteCount, showLabel = false }: TrendBadgeProps) {
  const trend = getTrend(happinessScore, rageIndex, voteCount);
  const { icon: Icon, label, className } = CONFIG[trend];

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${className}`}
      data-testid={`badge-trend-${trend}`}
      title={`Trend: ${label}`}
    >
      <Icon className="w-3 h-3" />
      {showLabel && label}
    </span>
  );
}
