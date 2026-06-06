import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  useListTools,
  useGetToolCategories,
} from "@workspace/api-client-react";
import ToolCard from "@/components/ToolCard";
import CompareBar from "@/components/CompareBar";
import SeoHead from "@/components/SeoHead";
import { siteSchema } from "@/components/SeoHead";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const SORT_OPTIONS = [
  { value: "happiness", label: "Happiness" },
  { value: "dx", label: "DX Score" },
  { value: "price", label: "Price Score" },
  { value: "rage", label: "Rage Index" },
];

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState("happiness");
  const [search, setSearch] = useState("");

  const { data: tools, isLoading } = useListTools({ category: selectedCategory || undefined, sort: selectedSort });
  const { data: categories } = useGetToolCategories();

  const filtered = tools?.filter((t) =>
    search ? t.name.toLowerCase().includes(search.toLowerCase()) || t.tagline.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-6 animate-fade-in-up pb-24">
      <SeoHead
        title="Dev Tool Rankings"
        description="Tool scorecards with DX Score, Price Score, Rage Index, and Happiness — rated by indie hackers."
        path="/tools"
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Dev Tool Rankings",
          description: "Developer tools rated by indie hackers",
        }}
      />

      {/* Header */}
      <div className="border-b border-border pb-5">
        <span className="font-mono text-xs text-primary uppercase tracking-widest">Tool Scorecards</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1" data-testid="text-page-title">
          Dev Tool Rankings<span className="text-primary cursor-blink">_</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          DX Score, Price Score, Rage Index, and Happiness — rated by indie hackers.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3" data-testid="section-filters">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-mono text-sm bg-card border-border"
            data-testid="input-search-tools"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 border border-border rounded-md px-2 py-1.5 bg-card">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="text-xs font-mono bg-transparent text-foreground outline-none cursor-pointer"
              data-testid="select-sort"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2" data-testid="section-categories">
        <button
          onClick={() => setSelectedCategory("")}
          className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${
            !selectedCategory
              ? "border-primary text-primary bg-primary/10"
              : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
          }`}
          data-testid="button-category-all"
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setSelectedCategory(cat.category === selectedCategory ? "" : cat.category)}
            className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${
              selectedCategory === cat.category
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
            data-testid={`button-category-${cat.category}`}
          >
            {cat.category} <span className="opacity-50">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Tools grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4 bg-card space-y-3">
              <div className="flex gap-2"><Skeleton className="w-8 h-8 rounded" /><div className="space-y-1 flex-1"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div></div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="grid-tools">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-border rounded-lg bg-card" data-testid="empty-tools">
          <div className="font-mono text-muted-foreground text-sm">
            {search ? `No tools matching "${search}"` : "No tools yet in this category"}
          </div>
          <div className="font-mono text-muted-foreground/50 text-xs mt-2">Try a different filter</div>
        </div>
      )}

      {/* Compare bar — fixed at bottom */}
      <CompareBar />
    </div>
  );
}
