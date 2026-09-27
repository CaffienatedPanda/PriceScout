import { useEffect, useState } from "react";
import { Search, Loader2, History, ChevronDown } from "lucide-react";
import { ScreenHeader } from "../components/ScreenHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import { PriceResults } from "../components/PriceResults";
import { researchPrice, type PriceResearchResult } from "../lib/priceResearch";
import { loadHistory, addHistoryEntry, type HistoryEntry } from "../lib/searchHistory";
import { loadSettings } from "../lib/settings";
import type { SearchHorizonDays } from "../lib/settings";

type Props = {
  onSendToProfit: (payload: { query: string; salePrice: number; itemCost: number }) => void;
};

const HORIZON_OPTIONS: { value: `${SearchHorizonDays}`; label: string }[] = [
  { value: "90", label: "90D" },
  { value: "180", label: "180D" },
  { value: "365", label: "365D" },
];

export function ResearchScreen({ onSendToProfit }: Props) {
  const [query, setQuery] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [horizon, setHorizon] = useState<`${SearchHorizonDays}`>("90");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PriceResearchResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHorizon(String(loadSettings().defaultHorizonDays) as `${SearchHorizonDays}`);
    setHistory(loadHistory());
  }, []);

  async function handleSearch() {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await researchPrice(query.trim(), Number(horizon));
      setResult(r);
      setHistory(addHistoryEntry(r));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Market Value"
        right={
          <SegmentedControl
            options={HORIZON_OPTIONS}
            value={horizon}
            onChange={(v) => setHorizon(v as `${SearchHorizonDays}`)}
          />
        }
      />

      <div className="space-y-4 px-4">
        <div>
          <label className="label">Search Item</label>
          <div className="mt-1.5 flex items-stretch gap-2">
            <input
              type="text"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Vintage Levi's 501..."
              autoComplete="off"
              className="flex-1 rounded-lg bg-ink px-4 py-3 text-sm font-medium text-bg placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="flex items-center justify-center rounded-lg bg-accent px-4 disabled:opacity-40"
              aria-label="Search"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-bg" />
              ) : (
                <Search className="h-4 w-4 text-bg" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Buy Price (optional)</label>
          <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-4 py-3">
            <span className="mr-1 text-faint">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent font-mono text-lg text-ink focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="label !text-xs w-full rounded-lg border border-border bg-surface-2 py-3 tracking-[0.2em] text-muted transition enabled:hover:border-accent enabled:hover:text-ink disabled:opacity-50"
        >
          {isLoading ? "Searching…" : "Execute Search"}
        </button>

        <details className="group rounded-lg border border-border bg-surface">
          <summary className="label !text-xs flex cursor-pointer list-none items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2">
              <History className="h-3.5 w-3.5" /> History
            </span>
            <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-border px-4">
            {history.length === 0 ? (
              <p className="py-3 text-sm text-faint">No searches yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {history.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(h.query);
                        setResult(h.result);
                        setError(null);
                      }}
                      className="flex w-full items-center justify-between py-2.5 text-left"
                    >
                      <span className="truncate text-sm text-ink">{h.query}</span>
                      <span className="font-mono text-sm text-accent">
                        ${h.medianPrice.toFixed(0)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>

        {error && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        {!result && !isLoading && !error && (
          <div className="py-14 text-center">
            <p className="display-heading select-none text-5xl text-surface-2">NULL</p>
            <p className="label mt-2">Run a search to see market value</p>
          </div>
        )}

        {result && (
          <PriceResults
            result={result}
            onSendToProfit={() =>
              onSendToProfit({
                query: result.query,
                salePrice: result.medianPrice,
                itemCost: parseFloat(buyPrice) || 0,
              })
            }
          />
        )}
      </div>
    </div>
  );
}
