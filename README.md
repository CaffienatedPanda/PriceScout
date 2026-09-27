<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# PriceScout

Quick reselling research and profit calculator for buyers in the field: search an item,
get an AI-researched price range (with sources), then run it through a profit calculator
before you buy.

## Stack

React 19 + TypeScript + Vite + Tailwind v4 on the frontend, a small Express server on the
backend that holds the Gemini (`@google/genai`) API key and does the price research with
Google Search grounding. Mobile-first UI meant to be used on a phone while out shopping.

## How it works

1. Type in an item (e.g. "Dyson V8 vacuum, used") — the browser calls `POST /api/research-price`,
   which the Express server (`server/index.ts`) handles by asking Gemini to research recent
   sold/asking prices and returning a low/median/high range, comps, and sources. The Gemini
   API key never reaches the browser.
2. Plug the numbers into the profit calculator (`src/lib/calculator.ts`) — pick a
   marketplace (eBay, Poshmark, Mercari, Facebook, or custom), enter what you'd pay and
   shipping/misc costs, and get a net profit, margin %, ROI, and a worthwhile/marginal/skip
   verdict.
3. Save items you're considering — stored locally in the browser (`src/lib/storage.ts`),
   no database yet.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to your Gemini API key
   (get one at https://aistudio.google.com/apikey)
3. Run the app: `npm run dev` — this starts the Vite dev server (port 3000) and the API
   server (port 8787) together; Vite proxies `/api` requests to the API server. Open
   http://localhost:3000.

## Deploying

This needs a host that can run a persistent Node process (not a static-only host), since
`server/index.ts` both serves the API and, in production, serves the built frontend:

1. `npm run build` (builds the frontend into `dist/`)
2. Set the `GEMINI_API_KEY` environment variable on your host
3. `npm start` (runs the Express server in production mode, serving both the API and
   `dist/`)

Render, Railway, or a small VPS all work well for this. A pure static host (Vercel/Netlify
in their default mode) would need the API route adapted into that platform's serverless
function format instead of a long-running Express process.

## Known limitations / next steps

- **No backend/database.** Saved items live in `localStorage` on one device/browser only.
- **Pricing data comes from Gemini's web research, not a structured marketplace API.**
  It's a reasonable field-triage estimate, not audit-grade sold-listing data. If accuracy
  becomes important, swap in eBay's official API (requires a developer account).
- **Not yet deployed anywhere.** Works locally via `npm run dev`; picking a host (Render/
  Railway/etc.) and deploying is the next step.
