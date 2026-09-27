import { Search, Calculator, BarChart3, Settings as SettingsIcon } from "lucide-react";
import type { ComponentType } from "react";

export type Tab = "research" | "profit" | "portfolio" | "settings";

const ITEMS: { key: Tab; label: string; icon: ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { key: "research", label: "Research", icon: Search },
  { key: "profit", label: "Profit", icon: Calculator },
  { key: "portfolio", label: "Portfolio", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 ${
                isActive ? "text-ink" : "text-faint"
              }`}
            >
              <span className={`h-0.5 w-8 rounded-full ${isActive ? "bg-accent" : "bg-transparent"}`} />
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="label !text-[10px]">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
