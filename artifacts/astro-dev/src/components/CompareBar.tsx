import { useLocation } from "wouter";
import { GitCompare, X, Trash2 } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useGetTool } from "@workspace/api-client-react";

function CompareChip({ id, onRemove }: { id: number; onRemove: () => void }) {
  const { data: tool } = useGetTool(id);
  return (
    <div className="flex items-center gap-1.5 bg-muted border border-border rounded px-2 py-1">
      <div className="w-4 h-4 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <span className="font-mono text-primary text-[8px] font-bold">{tool?.name?.[0] ?? "…"}</span>
      </div>
      <span className="font-mono text-xs text-foreground truncate max-w-[80px]">{tool?.name ?? "…"}</span>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
        aria-label={`Remove ${tool?.name ?? "tool"}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function CompareBar() {
  const { compareIds, removeFromCompare, clearCompare, canAddMore } = useCompare();
  const [, navigate] = useLocation();

  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm shadow-2xl animate-slide-up">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 shrink-0">
          <GitCompare className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">Compare</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {compareIds.map((id) => (
            <CompareChip key={id} id={id} onRemove={() => removeFromCompare(id)} />
          ))}
          {canAddMore && (
            <span className="text-[10px] font-mono text-muted-foreground/60 italic">
              +{3 - compareIds.length} more
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={clearCompare}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-mono text-muted-foreground border border-border rounded hover:text-foreground hover:border-primary/30 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> clear
          </button>
          <button
            onClick={() => navigate("/compare")}
            disabled={compareIds.length < 2}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-primary text-background rounded border border-primary font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="button-go-compare"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare ({compareIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}
