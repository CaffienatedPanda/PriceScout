import type { PriceResearchResult } from "./priceResearch";

export type HistoryEntry = {
  id: string;
  query: string;
  medianPrice: number;
  searchedAt: string;
  result: PriceResearchResult;
};

const KEY = "pricescout.history.v1";
const MAX_ENTRIES = 20;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(result: PriceResearchResult): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    query: result.query,
    medianPrice: result.medianPrice,
    searchedAt: new Date().toISOString(),
    result,
  };
  const entries = [entry, ...loadHistory()].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Fine — history is a convenience, not critical state.
  }
  return entries;
}
