import { GoogleGenAI } from "@google/genai";

/**
 * Shared logic between the client's price-research fetch and the server's
 * /api/research-price handler: the prompt we send Gemini, the JSON-block it
 * returns, and the shape we normalize that into.
 *
 * The actual Gemini client (and the API key) only ever run on the server
 * side of this file's callers — see server/index.ts.
 */

export type Comp = {
  title: string;
  price: number;
  source: string;
  url?: string;
  soldDate?: string;
};

export type PriceResearchResult = {
  query: string;
  lowPrice: number;
  medianPrice: number;
  highPrice: number;
  comps: Comp[];
  notes: string;
  sources: { title: string; url: string }[];
};

export const SYSTEM_PROMPT = `You are a resale/flipping research assistant. Given an item description,
research what it typically sells for used/secondhand on marketplaces like eBay, Mercari,
Poshmark, and Facebook Marketplace, focusing on RECENTLY SOLD or completed listings, not
active asking prices, when you can find them.

Respond in plain prose first with your findings and reasoning (a few sentences).

Then, on a new line, output ONLY a fenced code block labeled json containing this exact shape,
with no additional commentary inside or after it:

\`\`\`json
{
  "lowPrice": number,
  "medianPrice": number,
  "highPrice": number,
  "comps": [ { "title": string, "price": number, "source": string, "url": string, "soldDate": string } ],
  "notes": string
}
\`\`\`

Use realistic numeric estimates in USD. Include up to 5 comps if you found specific ones.
If you truly cannot find pricing information, still return your best-effort range based on
general market knowledge and say so in "notes".`;

export function extractJsonBlock(text: string): {
  lowPrice: number;
  medianPrice: number;
  highPrice: number;
  comps: Comp[];
  notes: string;
} | null {
  const match = text.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/**
 * Runs the actual Gemini call. Server-only: throws if called without an API
 * key, which should never happen in the browser since this module is only
 * imported by server/index.ts.
 */
export async function runPriceResearch(
  apiKey: string,
  itemQuery: string,
  horizonDays?: number,
): Promise<PriceResearchResult> {
  const ai = new GoogleGenAI({ apiKey });

  const horizonNote = horizonDays
    ? ` Focus specifically on listings sold within the last ${horizonDays} days — older sales are less relevant to current market value.`
    : "";

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${SYSTEM_PROMPT}${horizonNote}\n\nItem: ${itemQuery}` }],
      },
    ],
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text ?? "";
  const parsed = extractJsonBlock(text);

  const groundingChunks =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources = groundingChunks
    .map((chunk) => chunk.web)
    .filter((web): web is { uri: string; title: string } => !!web?.uri)
    .map((web) => ({ title: web.title || web.uri, url: web.uri }));

  return {
    query: itemQuery,
    lowPrice: parsed?.lowPrice ?? 0,
    medianPrice: parsed?.medianPrice ?? 0,
    highPrice: parsed?.highPrice ?? 0,
    comps: parsed?.comps ?? [],
    notes: parsed?.notes ?? text.trim(),
    sources,
  };
}
