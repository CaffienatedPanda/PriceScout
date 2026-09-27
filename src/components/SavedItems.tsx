import { Trash2 } from "lucide-react";
import type { SavedItem } from "../lib/storage";

type Props = {
  items: SavedItem[];
  onRemove: (id: string) => void;
};

const VERDICT_DOT: Record<SavedItem["verdict"], string> = {
  worthwhile: "bg-emerald-500",
  marginal: "bg-amber-500",
  skip: "bg-rose-500",
};

export function SavedItems({ items, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400">
        Nothing saved yet. Research an item and tap "Save this item" to build your list.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-500">
        Saved items ({items.length})
      </h2>
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${VERDICT_DOT[item.verdict]}`}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{item.query}</p>
              <p className="text-xs text-slate-400">
                Buy ${item.itemCost.toFixed(0)} · Profit ${item.netProfit.toFixed(2)} (
                {item.marginPercent.toFixed(0)}%)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="shrink-0 rounded-lg p-2 text-slate-400 active:bg-slate-100"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
