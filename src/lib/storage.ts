export type ItemStatus = "watching" | "sourced";

export type SavedItem = {
  id: string;
  query: string;
  lowPrice: number;
  medianPrice: number;
  highPrice: number;
  itemCost: number;
  listedPrice: number;
  marketplace: string;
  netProfit: number;
  marginPercent: number;
  verdict: "worthwhile" | "marginal" | "skip";
  status: ItemStatus;
  savedAt: string;
};

const KEY = "pricescout.savedItems.v1";

export function loadSavedItems(): SavedItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as Partial<SavedItem>[];
    // Backfill fields for items saved before status/marketplace/listedPrice existed.
    return items.map((i) => ({
      id: i.id ?? crypto.randomUUID(),
      query: i.query ?? "",
      lowPrice: i.lowPrice ?? 0,
      medianPrice: i.medianPrice ?? 0,
      highPrice: i.highPrice ?? 0,
      itemCost: i.itemCost ?? 0,
      listedPrice: i.listedPrice ?? i.medianPrice ?? 0,
      marketplace: i.marketplace ?? "eBay",
      netProfit: i.netProfit ?? 0,
      marginPercent: i.marginPercent ?? 0,
      verdict: i.verdict ?? "skip",
      status: i.status ?? "watching",
      savedAt: i.savedAt ?? new Date().toISOString(),
    }));
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

export function updateSavedItem(id: string, patch: Partial<SavedItem>): SavedItem[] {
  const items = loadSavedItems().map((i) => (i.id === id ? { ...i, ...patch } : i));
  saveSavedItems(items);
  return items;
}

export function exportItemsToCsv(items: SavedItem[]): string {
  const header = [
    "Item",
    "Status",
    "Marketplace",
    "Item Cost",
    "Listed Price",
    "Net Profit",
    "Margin %",
    "Saved At",
  ];
  const rows = items.map((i) => [
    csvEscape(i.query),
    i.status,
    csvEscape(i.marketplace),
    i.itemCost.toFixed(2),
    i.listedPrice.toFixed(2),
    i.netProfit.toFixed(2),
    i.marginPercent.toFixed(1),
    i.savedAt,
  ]);
  return [header, ...rows].map((row) => row.join(",")).join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
