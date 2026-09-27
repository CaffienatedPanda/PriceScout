import { useMemo, useState } from "react";
import { calculate, PLATFORM_PRESETS, type CalculatorResult } from "../lib/calculator";
import { Bookmark } from "lucide-react";

type Props = {
  suggestedSalePrice?: number;
  onSave: (result: CalculatorResult & { itemCost: number; salePrice: number }) => void;
};

const VERDICT_STYLES: Record<CalculatorResult["verdict"], string> = {
  worthwhile: "bg-emerald-100 text-emerald-800 border-emerald-300",
  marginal: "bg-amber-100 text-amber-800 border-amber-300",
  skip: "bg-rose-100 text-rose-800 border-rose-300",
};

const VERDICT_LABEL: Record<CalculatorResult["verdict"], string> = {
  worthwhile: "Worth buying",
  marginal: "Marginal",
  skip: "Skip it",
};

export function ProfitCalculator({ suggestedSalePrice, onSave }: Props) {
  const [platform, setPlatform] = useState<keyof typeof PLATFORM_PRESETS>("ebay");
  const [itemCost, setItemCost] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>(
    suggestedSalePrice ? String(suggestedSalePrice) : "",
  );
  const [shippingCost, setShippingCost] = useState<string>("0");
  const [miscCost, setMiscCost] = useState<string>("0");

  const result = useMemo(() => {
    const cost = parseFloat(itemCost) || 0;
    const sale = parseFloat(salePrice) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const misc = parseFloat(miscCost) || 0;
    return calculate({
      itemCost: cost,
      salePrice: sale,
      shippingCost: shipping,
      miscCost: misc,
      fees: PLATFORM_PRESETS[platform],
    });
  }, [itemCost, salePrice, shippingCost, miscCost, platform]);

  const canSave = (parseFloat(itemCost) || 0) > 0 || (parseFloat(salePrice) || 0) > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-slate-500">Profit calculator</h2>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="What you'd pay" value={itemCost} onChange={setItemCost} />
        <Field label="Expected sale price" value={salePrice} onChange={setSalePrice} />
        <Field label="Shipping cost" value={shippingCost} onChange={setShippingCost} />
        <Field label="Misc / tax" value={miscCost} onChange={setMiscCost} />
      </div>

      <div className="mt-3">
        <label className="text-xs text-slate-500">Sell on</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as keyof typeof PLATFORM_PRESETS)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="ebay">eBay (~13.25% + payment fee)</option>
          <option value="poshmark">Poshmark (20% flat)</option>
          <option value="mercari">Mercari (~10% + payment fee)</option>
          <option value="facebook">Facebook Marketplace (~5%)</option>
          <option value="custom">Custom / no fees</option>
        </select>
      </div>

      <div
        className={`mt-4 rounded-lg border px-3 py-3 ${VERDICT_STYLES[result.verdict]}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{VERDICT_LABEL[result.verdict]}</span>
          <span className="text-lg font-bold">${result.netProfit.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex justify-between text-xs opacity-80">
          <span>Margin: {result.marginPercent.toFixed(1)}%</span>
          <span>ROI on buy: {result.roiPercent.toFixed(1)}%</span>
          <span>Fees: ${result.totalFees.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSave}
        onClick={() =>
          onSave({
            ...result,
            itemCost: parseFloat(itemCost) || 0,
            salePrice: parseFloat(salePrice) || 0,
          })
        }
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border
          border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700
          transition active:scale-95 disabled:opacity-50"
      >
        <Bookmark className="h-4 w-4" />
        Save this item
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="mt-1 flex items-center rounded-lg border border-slate-300 bg-white px-3">
        <span className="text-slate-400">$</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2 pl-1 text-sm focus:outline-none"
          placeholder="0.00"
        />
      </div>
    </label>
  );
}
