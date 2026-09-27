import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { runPriceResearch } from "../src/lib/priceResearchShared.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

app.post("/api/research-price", async (req, res) => {
  const { query } = req.body ?? {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: 'Missing "query" string in request body.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "Missing GEMINI_API_KEY on the server. Set it in .env.local (dev) or your host's environment variables (production).",
    });
  }

  try {
    const result = await runPriceResearch(apiKey, query);
    res.json(result);
  } catch (err) {
    console.error("[research-price]", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Price research failed.",
    });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// In production, serve the built frontend from the same server so there's
// only one process/port to deploy.
if (process.env.NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "..", "dist");
  app.use(express.static(distDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`PriceScout API listening on port ${PORT}`);
});
