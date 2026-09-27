import { ExternalLink } from "lucide-react";
import type { PriceResearchResult } from "../lib/priceResearch";

type Props = {
  result: PriceResearchResult;
};

export function PriceResults({ result }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-slate-500">
        Price research for "{result.query}"
      </h2>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <PriceStat label="Low" value={result.lowPrice} />
        <PriceStat label="Median" value={result.medianPrice} highlight />
        <PriceStat label="High" value={result.highPrice} />
      </div>

      {result.notes && (
        <p className="mt-3 text-sm leading-snug text-slate-600">{result.notes}</p>
      )}

      {result.comps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Comparable listings
          </h3>
          <ul className="mt-2 divide-y divide-slate-100">
            {result.comps.map((comp, i) => (
              <li key={i} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-slate-800">{comp.title}</p>
                  <p className="text-xs text-slate-400">
                    {comp.source}
                    {comp.soldDate ? ` · ${comp.soldDate}` : ""}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-slate-900">
                  ${comp.price.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.sources.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sources
          </h3>
          <ul className="mt-1 space-y-1">
            {result.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-teal-700 hover:underline"
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
    <div
      className={`rounded-lg py-2 ${highlight ? "bg-teal-50" : "bg-slate-50"}`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`text-lg font-bold ${highlight ? "text-teal-700" : "text-slate-800"}`}
      >
        ${value.toFixed(0)}
      </p>
    </div>
  );
}
