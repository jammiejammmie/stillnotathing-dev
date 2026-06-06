interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  inverse?: boolean;
  color?: string;
}

export default function ScoreBar({ label, value, max = 10, inverse = false, color }: ScoreBarProps) {
  const pct = Math.round((value / max) * 100);
  const displayColor = color || (inverse
    ? pct <= 30 ? "#34d399" : pct <= 60 ? "#fbbf24" : "#f87171"
    : pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#f87171");

  return (
    <div className="space-y-1" data-testid={`score-bar-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">{label}</span>
        <span style={{ color: displayColor }} className="font-bold tabular-nums">
          {value.toFixed(1)}
          {inverse && <span className="text-muted-foreground text-[10px] ml-0.5">↓</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: displayColor }}
        />
      </div>
    </div>
  );
}
