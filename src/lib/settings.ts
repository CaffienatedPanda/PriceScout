import type { FeeModel, MarketplaceKey } from "./calculator";

export type SearchHorizonDays = 90 | 180 | 365;

export type BusinessSettings = {
  businessName: string;
  defaultHorizonDays: SearchHorizonDays;
  /** Per-marketplace corrections to the built-in fee estimates. */
  feeOverrides: Partial<Record<MarketplaceKey, Partial<FeeModel>>>;
};

const KEY = "pricescout.settings.v1";

const DEFAULTS: BusinessSettings = {
  businessName: "My Resell Business",
  defaultHorizonDays: 90,
  feeOverrides: {},
};

export function loadSettings(): BusinessSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed, feeOverrides: parsed.feeOverrides ?? {} };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: BusinessSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage full or unavailable — settings just won't persist this time.
  }
}
