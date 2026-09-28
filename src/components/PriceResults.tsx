import { ExternalLink, ArrowRight } from "lucide-react";
import type { PriceResearchResult } from "../lib/priceResearch";

type Props = {
  result: PriceResearchResult;
  onSendToProfit?: () => void;
};

export function PriceResults({ result, onSendToProfit }: Props) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="label">"{result.query}"</p>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <PriceStat label="Low" value={result.lowPrice} />
        <PriceStat label="Median" value={result.medianPrice} highlight />
        <PriceStat label="High" value={result.highPrice} />
      </div>

      {result.notes && <p className="mt-3 text-sm leading-snug text-muted">{result.notes}</p>}

      <p className="mt-3 text-xs leading-snug text-faint">
        AI-generated estimate from public listings — not verified sold data. Use as a starting
        point, not gospel.
      </p>

      {onSendToProfit && (
        <button
          type="button"
          onClick={onSendToProfit}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-bg transition active:scale-95"
        >
          Send to Profit Calculator
          <ArrowRight className="h-4 w-4" />
        </button>
      )}

      {result.comps.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="label">Comparable Listings</p>
          <ul className="mt-2 divide-y divide-border">
            {result.comps.map((comp, i) => (
              <li key={i} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-ink">{comp.title}</p>
                  <p className="text-xs text-faint">
                    {comp.source}
                    {comp.soldDate ? ` · ${comp.soldDate}` : ""}
                  </p>
                </div>
                <span className="shrink-0 font-mono font-semibold text-ink">
                  ${comp.price.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.sources.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="label">Sources</p>
          <ul className="mt-1 space-y-1">
            {result.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{s.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PriceStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg py-2 ${highlight ? "bg-accent-dim" : "bg-surface-2"}`}>
      <p className="label">{label}</p>
      <p className={`font-mono text-lg font-bold ${highlight ? "text-accent" : "text-ink"}`}>
        ${value.toFixed(0)}
      </p>
    </div>
  );
}
