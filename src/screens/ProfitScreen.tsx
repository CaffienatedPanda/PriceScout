import { useMemo, useState } from "react";
import { Bookmark } from "lucide-react";
import { ScreenHeader } from "../components/ScreenHeader";
import {
  calculate,
  getEffectiveFees,
  MARKETPLACES,
  type MarketplaceKey,
} from "../lib/calculator";
import { loadSettings } from "../lib/settings";
import { addSavedItem, type SavedItem } from "../lib/storage";

type Props = {
  initialQuery?: string;
  initialSalePrice?: number;
  initialItemCost?: number;
};

const VERDICT_LABEL: Record<"worthwhile" | "marginal" | "skip", string> = {
  worthwhile: "Worthwhile",
  marginal: "Marginal",
  skip: "Skip",
};

const VERDICT_TONE: Record<"worthwhile" | "marginal" | "skip", "positive" | "default" | "negative"> = {
  worthwhile: "positive",
  marginal: "default",
  skip: "negative",
};

export function ProfitScreen({ initialQuery, initialSalePrice, initialItemCost }: Props) {
  const [itemName, setItemName] = useState(initialQuery ?? "");
  const [salePrice, setSalePrice] = useState(
    initialSalePrice ? String(initialSalePrice) : "",
  );
  const [itemCost, setItemCost] = useState(initialItemCost ? String(initialItemCost) : "");
  const [shippingCost, setShippingCost] = useState("0");
  const [miscCost, setMiscCost] = useState("0");
  const [marketplace, setMarketplace] = useState<MarketplaceKey>("ebay");
  const [alreadyBought, setAlreadyBought] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const settings = useMemo(() => loadSettings(), []);

  const result = useMemo(() => {
    const cost = parseFloat(itemCost) || 0;
    const sale = parseFloat(salePrice) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const misc = parseFloat(miscCost) || 0;
    const fees = getEffectiveFees(marketplace, settings.feeOverrides[marketplace]);
    return calculate({ itemCost: cost, salePrice: sale, shippingCost: shipping, miscCost: misc, fees });
  }, [itemCost, salePrice, shippingCost, miscCost, marketplace, settings]);

  const canSave = (parseFloat(itemCost) || 0) > 0 || (parseFloat(salePrice) || 0) > 0;
  const marketplaceLabel = MARKETPLACES.find((m) => m.key === marketplace)?.label ?? marketplace;

  function handleSave() {
    const item: SavedItem = {
      id: crypto.randomUUID(),
      query: itemName.trim() || "Untitled item",
      lowPrice: 0,
      medianPrice: parseFloat(salePrice) || 0,
      highPrice: 0,
      itemCost: parseFloat(itemCost) || 0,
      listedPrice: parseFloat(salePrice) || 0,
      marketplace: marketplaceLabel,
      netProfit: result.netProfit,
      marginPercent: result.marginPercent,
      verdict: result.verdict,
      status: alreadyBought ? "sourced" : "watching",
      savedAt: new Date().toISOString(),
    };
    addSavedItem(item);
    setSavedMessage(alreadyBought ? "Added to My Flips" : "Added to Watchlist");
    setTimeout(() => setSavedMessage(null), 2000);
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Profit Engine"
        right={
          <span
            className={`label !text-[10px] rounded-full border px-2.5 py-1 ${
              result.verdict === "worthwhile"
                ? "border-accent/40 bg-accent-dim text-accent"
                : result.verdict === "marginal"
                  ? "border-warn/40 bg-warn/10 text-warn"
                  : "border-danger/40 bg-danger/10 text-danger"
            }`}
          >
            {VERDICT_LABEL[result.verdict]}
          </span>
        }
      />

      <div className="space-y-4 px-4">
        <div>
          <label className="label">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="What are you flipping?"
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="label">Target Sale Price</label>
          <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface px-4 py-3">
            <span className="mr-1 text-2xl text-faint">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent font-mono text-3xl font-semibold text-ink focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MoneyField label="Unit Cost" value={itemCost} onChange={setItemCost} />
          <MoneyField label="Shipping" value={shippingCost} onChange={setShippingCost} />
        </div>
        <MoneyField label="Misc / Tax" value={miscCost} onChange={setMiscCost} compact />

        <div>
          <label className="label flex items-center gap-2">Select Marketplace</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {MARKETPLACES.map((m) => {
              const active = m.key === marketplace;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMarketplace(m.key)}
                  className={`label !text-[11px] rounded-lg border px-3 py-2 transition ${
                    active ? "border-ink bg-ink text-bg" : "border-border bg-surface text-muted"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="label">Net Profit Yield</p>
          <p
            className={`mt-1 font-mono text-4xl font-bold ${
              result.netProfit >= 0 ? "text-accent" : "text-danger"
            }`}
          >
            {result.netProfit < 0 ? "-" : ""}${Math.abs(result.netProfit).toFixed(2)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div>
              <p className="label">Margin</p>
              <p className="font-mono text-lg text-ink">{result.marginPercent.toFixed(1)}%</p>
            </div>
            <div>
              <p className="label">ROI</p>
              <p className="font-mono text-lg text-ink">{result.roiPercent.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div>
          <p className="label">Transaction Breakdown</p>
          <div className="mt-1.5 space-y-2 rounded-lg border border-border bg-surface p-4">
            <BreakdownRow label="Platform Fee" value={result.platformFeeAmount} />
            <BreakdownRow label="Payment Fee" value={result.paymentFeeAmount} />
            <BreakdownRow label="Total Fees" value={result.totalFees} bold />
            <BreakdownRow label="Total Cost" value={result.totalCost} bold />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={alreadyBought}
            onChange={(e) => setAlreadyBought(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-surface accent-[#22e08a]"
          />
          I already bought this
        </label>

        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 py-3 text-sm font-medium text-ink transition active:scale-95 disabled:opacity-50"
        >
          <Bookmark className="h-4 w-4" />
          {alreadyBought ? "Add to My Flips" : "Add to Watchlist"}
        </button>
        {savedMessage && <p className="text-center text-sm text-accent">{savedMessage}</p>}
      </div>
    </div>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  compact,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div
        className={`mt-1.5 flex items-center rounded-lg border border-border bg-surface px-3 ${
          compact ? "py-2" : "py-2.5"
        }`}
      >
        <span className="text-faint">$</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className="w-full bg-transparent py-0 pl-1 font-mono text-sm text-ink focus:outline-none"
        />
      </div>
    </label>
  );
}

function BreakdownRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "text-ink" : "text-muted"}>{label}</span>
      <span className={`font-mono ${bold ? "font-semibold text-ink" : "text-muted"}`}>
        ${value.toFixed(2)}
      </span>
    </div>
  );
}
