export type SavedItem = {
  id: string;
  query: string;
  lowPrice: number;
  medianPrice: number;
  highPrice: number;
  itemCost: number;
  netProfit: number;
  marginPercent: number;
  verdict: "worthwhile" | "marginal" | "skip";
  savedAt: string;
};

const KEY = "pricescout.savedItems.v1";

export function loadSavedItems(): SavedItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    return [];
  }
}

export function saveSavedItems(items: SavedItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable (private browsing, etc). Fail silently —
    // this is a convenience list, not the source of truth.
  }
}

export function addSavedItem(item: SavedItem): SavedItem[] {
  const items = [item, ...loadSavedItems()];
  saveSavedItems(items);
  return items;
}

export function removeSavedItem(id: string): SavedItem[] {
  const items = loadSavedItems().filter((i) => i.id !== id);
  saveSavedItems(items);
  return items;
}
