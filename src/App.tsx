import { useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { BottomNav, type Tab } from "./components/BottomNav";
import { ResearchScreen } from "./screens/ResearchScreen";
import { ProfitScreen } from "./screens/ProfitScreen";
import { PortfolioScreen } from "./screens/PortfolioScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

type Handoff = { query: string; salePrice: number; itemCost: number };

export default function App() {
  const [tab, setTab] = useState<Tab>("research");
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [handoffKey, setHandoffKey] = useState(0);

  function sendToProfit(payload: Handoff) {
    setHandoff(payload);
    setHandoffKey((k) => k + 1);
    setTab("profit");
  }

  return (
    <div className="min-h-screen bg-bg md:flex md:justify-center md:bg-surface-2/60 md:px-6 md:py-10">
      <div className="flex min-h-screen w-full flex-col bg-bg text-ink md:min-h-[calc(100vh-5rem)] md:max-w-md md:overflow-hidden md:rounded-2xl md:border md:border-border md:shadow-2xl md:shadow-black/50">
        <AppHeader />

        <div className="flex-1">
          {tab === "research" && <ResearchScreen onSendToProfit={sendToProfit} />}
          {tab === "profit" && (
            <ProfitScreen
              key={handoffKey}
              initialQuery={handoff?.query}
              initialSalePrice={handoff?.salePrice}
              initialItemCost={handoff?.itemCost}
            />
          )}
          {tab === "portfolio" && <PortfolioScreen />}
          {tab === "settings" && <SettingsScreen />}
        </div>

        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
