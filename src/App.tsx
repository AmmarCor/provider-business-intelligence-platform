import React from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { FiltersProvider } from "@/hooks/useFilters";
import { ExecutiveOverviewPage } from "@/pages/ExecutiveOverviewPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { VisibilityPage } from "@/pages/VisibilityPage";
import { DemandPage } from "@/pages/DemandPage";
import { PricingPage } from "@/pages/PricingPage";
import { ReferralsPage } from "@/pages/ReferralsPage";
import { OperationalIntelligencePage } from "@/pages/OperationalIntelligencePage";
import { BundleIntelligencePage } from "@/pages/BundleIntelligencePage";
import { PerformanceInsightsPage } from "@/pages/PerformanceInsightsPage";

export default function App() {
  return (
    <FiltersProvider>
      <Routes>
        <Route path="/" element={<ExecutiveOverviewPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/insights" element={<PerformanceInsightsPage />} />
          <Route path="/visibility" element={<VisibilityPage />} />
          <Route path="/demand" element={<DemandPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/referrals" element={<ReferralsPage />} />
          <Route path="/operations" element={<OperationalIntelligencePage />} />
          <Route path="/bundles" element={<BundleIntelligencePage />} />
        </Route>
      </Routes>
    </FiltersProvider>
  );
}
