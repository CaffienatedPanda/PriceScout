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
    <div className="min-h-screen bg-bg pb-20 text-ink">
      <AppHeader />

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

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
