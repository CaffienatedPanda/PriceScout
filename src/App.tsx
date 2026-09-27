import { useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { PriceResults } from "./components/PriceResults";
import { ProfitCalculator } from "./components/ProfitCalculator";
import { SavedItems } from "./components/SavedItems";
import { researchPrice, type PriceResearchResult } from "./lib/priceResearch";
import { addSavedItem, loadSavedItems, removeSavedItem, type SavedItem } from "./lib/storage";
import type { CalculatorResult } from "./lib/calculator";
import { Search } from "lucide-react";

export default function App() {
  const [result, setResult] = useState<PriceResearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => loadSavedItems());

  async function handleSearch(query: string) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await researchPrice(query);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSaveItem(
    calc: CalculatorResult & { itemCost: number; salePrice: number },
  ) {
    if (!result) return;
    const item: SavedItem = {
      id: crypto.randomUUID(),
      query: result.query,
      lowPrice: result.lowPrice,
      medianPrice: result.medianPrice,
      highPrice: result.highPrice,
      itemCost: calc.itemCost,
      netProfit: calc.netProfit,
      marginPercent: calc.marginPercent,
      verdict: calc.verdict,
      savedAt: new Date().toISOString(),
    };
    setSavedItems(addSavedItem(item));
  }

  function handleRemoveItem(id: string) {
    setSavedItems(removeSavedItem(id));
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      <header className="bg-teal-700 px-4 py-5 text-white shadow-sm">
        <h1 className="text-xl font-bold">PriceScout</h1>
        <p className="text-sm text-teal-100">
          Quick reselling research &amp; profit calculator
        </p>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!result && !isLoading && !error && (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-slate-400">
            <Search className="h-8 w-8" />
            <p className="text-sm">
              Search an item to see what it typically sells for, then run the numbers.
            </p>
          </div>
        )}

        {result && (
          <>
            <PriceResults result={result} />
            <ProfitCalculator
              suggestedSalePrice={result.medianPrice || undefined}
              onSave={handleSaveItem}
            />
          </>
        )}

        <SavedItems items={savedItems} onRemove={handleRemoveItem} />
      </main>
    </div>
  );
}
