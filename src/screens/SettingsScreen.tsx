import { useState } from "react";
import { Save, Building2, RotateCcw } from "lucide-react";
import { ScreenHeader } from "../components/ScreenHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import { MARKETPLACES, getEffectiveFees, type MarketplaceKey } from "../lib/calculator";
import { loadSettings, saveSettings, type BusinessSettings, type SearchHorizonDays } from "../lib/settings";

const HORIZON_OPTIONS: { value: `${SearchHorizonDays}`; label: string }[] = [
  { value: "90", label: "90 Days" },
  { value: "180", label: "180 Days" },
  { value: "365", label: "365 Days" },
];

export function SettingsScreen() {
  const [settings, setSettings] = useState<BusinessSettings>(() => loadSettings());
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSave() {
    saveSettings(settings);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function handleFeeChange(key: MarketplaceKey, percent: string) {
    const value = parseFloat(percent);
    setSettings((s) => ({
      ...s,
      feeOverrides: {
        ...s.feeOverrides,
        [key]: { ...s.feeOverrides[key], platformFeePercent: isNaN(value) ? 0 : value },
      },
    }));
  }

  function handleReset() {
    setSettings((s) => ({ ...s, feeOverrides: {} }));
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Settings"
        right={
          <button
            type="button"
            onClick={handleSave}
            className="label !text-[10px] flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-bg"
          >
            <Save className="h-3 w-3" />
            {savedFlash ? "Saved" : "Save Changes"}
          </button>
        }
      />

      <div className="space-y-6 px-4">
        <section>
          <p className="label mb-1.5 flex items-center gap-1.5">
            <Building2 className="h-3 w-3" /> Business Identity
          </p>
          <div className="rounded-lg border border-border bg-surface p-4">
            <label className="label">Business Registry Name</label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings((s) => ({ ...s, businessName: e.target.value }))}
              className="mt-1.5 w-full bg-transparent font-mono text-lg font-semibold text-ink focus:outline-none"
            />
          </div>
        </section>

        <section>
          <p className="label mb-1.5">Default Search Horizon</p>
          <SegmentedControl
            options={HORIZON_OPTIONS}
            value={String(settings.defaultHorizonDays)}
            onChange={(v) =>
              setSettings((s) => ({ ...s, defaultHorizonDays: Number(v) as SearchHorizonDays }))
            }
          />
        </section>

        <section>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="label">Marketplace Fee Overrides</p>
            <button
              type="button"
              onClick={handleReset}
              className="label !text-[10px] flex items-center gap-1 text-faint"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to Defaults
            </button>
          </div>
          <div className="divide-y divide-border rounded-lg border border-border bg-surface">
            {MARKETPLACES.map((m) => {
              const effective = getEffectiveFees(m.key, settings.feeOverrides[m.key]);
              return (
                <div key={m.key} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink">{m.label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={effective.platformFeePercent}
                      onChange={(e) => handleFeeChange(m.key, e.target.value)}
                      className="w-16 rounded-md border border-border bg-surface-2 px-2 py-1 text-right font-mono text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <span className="text-xs text-faint">%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-faint">
            Defaults are public fee estimates — correct them here if your actual seller fees
            differ (e.g. a lower eBay Store rate, or Poshmark's tiered pricing).
          </p>
        </section>
      </div>
    </div>
  );
}
