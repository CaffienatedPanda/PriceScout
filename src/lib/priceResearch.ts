import type { PriceResearchResult } from "./priceResearchShared";

/**
 * Client-side price research: calls our own server, which holds the Gemini
 * API key. Nothing in this file ever touches process.env.GEMINI_API_KEY —
 * see server/index.ts for the actual Gemini call.
 */
export async function researchPrice(itemQuery: string): Promise<PriceResearchResult> {
  const res = await fetch("/api/research-price", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: itemQuery }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Price research failed (${res.status}).`);
  }

  return res.json();
}

export type { PriceResearchResult } from "./priceResearchShared";
