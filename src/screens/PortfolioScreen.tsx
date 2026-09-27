import { useMemo, useState } from "react";
import { Download, Trash2, ArrowUpRight } from "lucide-react";
import { ScreenHeader } from "../components/ScreenHeader";
import { StatTile } from "../components/StatTile";
import {
  loadSavedItems,
  removeSavedItem,
  updateSavedItem,
  exportItemsToCsv,
  type SavedItem,
} from "../lib/storage";

type ViewTab = "flips" | "watchlist";

export function PortfolioScreen() {
  const [items, setItems] = useState<SavedItem[]>(() => loadSavedItems());
  const [view, setView] = useState<ViewTab>("flips");

  const sourced = items.filter((i) => i.status === "sourced");
  const watching = items.filter((i) => i.status === "watching");
  const visible = view === "flips" ? sourced : watching;

  const stats = useMemo(() => {
    const totalNetProfit = sourced.reduce((sum, i) => sum + i.netProfit, 0);
    const avgMargin =
      sourced.length > 0
        ? sourced.reduce((sum, i) => sum + i.marginPercent, 0) / sourced.length
        : 0;
    const grossRevenue = sourced.reduce((sum, i) => sum + i.listedPrice, 0);
    return { totalNetProfit, avgMargin, totalVolume: sourced.length, grossRevenue };
  }, [sourced]);

  function handleRemove(id: string) {
    setItems(removeSavedItem(id));
  }

  function handleMarkSourced(id: string) {
    setItems(updateSavedItem(id, { status: "sourced" }));
  }

  function handleExportCsv() {
    const csv = exportItemsToCsv(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pricescout-portfolio.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Portfolio"
        right={
          <button
            type="button"
            onClick={handleExportCsv}
            className="label !text-[10px] flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-muted"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </button>
        }
      />

      <div className="px-4">
        <div className="flex gap-4 border-b border-border">
          <TabButton label="My Flips" active={view === "flips"} onClick={() => setView("flips")} />
          <TabButton
            label="Watchlist"
            active={view === "watchlist"}
            onClick={() => setView("watchlist")}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatTile label="Total Net Profit" value={`$${stats.totalNetProfit.toFixed(2)}`} />
          <StatTile label="Avg Margin" value={`${stats.avgMargin.toFixed(1)}%`} />
          <StatTile label="Total Volume" value={`#${stats.totalVolume}`} />
          <StatTile label="Gross Revenue" value={`$${stats.grossRevenue.toFixed(0)}`} />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="label">Transaction History</p>
          <p className="label">{visible.length} records</p>
        </div>

        {visible.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-border py-10 text-center">
            <p className="text-sm text-faint">
              {view === "flips"
                ? "Nothing sourced yet — mark an item as bought from the Profit tab."
                : "Nothing on your watchlist yet — save an item from the Profit tab."}
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {visible.map((item) => (
              <li key={item.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span
                      className={`label !text-[9px] inline-block rounded px-1.5 py-0.5 ${
                        item.status === "sourced"
                          ? "bg-accent-dim text-accent"
                          : "bg-surface-2 text-muted"
                      }`}
                    >
                      {item.status === "sourced" ? "Sourced" : "Watching"}
                    </span>
                    <p className="mt-1 truncate text-sm font-semibold text-ink">{item.query}</p>
                    <p className="text-xs text-faint">
                      {new Date(item.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-ink">
                    ${item.listedPrice.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-2 text-xs">
                  <MiniStat label="Market" value={item.marketplace} />
                  <MiniStat label="Cost" value={`$${item.itemCost.toFixed(0)}`} />
                  <MiniStat
                    label="Profit"
                    value={`$${item.netProfit.toFixed(0)}`}
                    accent={item.netProfit >= 0}
                  />
                </div>

                <div className="mt-2 flex justify-end gap-2">
                  {item.status === "watching" && (
                    <button
                      type="button"
                      onClick={() => handleMarkSourced(item.id)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-accent"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      Mark as sourced
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-faint"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`label !text-xs -mb-px border-b-2 px-1 py-3 ${
        active ? "border-accent text-ink" : "border-transparent text-faint"
      }`}
    >
      {label}
    </button>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="label !text-[9px]">{label}</p>
      <p className={`mt-0.5 font-mono ${accent ? "text-accent" : "text-ink"}`}>{value}</p>
    </div>
  );
}
