import React, { useMemo } from "react";
import { Activity, ArrowRight, DollarSign, Eye, GitBranch, Package, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiTile } from "@/components/ui/KpiTile";
import { KpiSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { AreaTrendChart } from "@/components/charts/AreaTrendChart";
import { InsightCard } from "@/components/ui/InsightCard";
import { useFilters } from "@/hooks/useFilters";
import { useDelayedCompute } from "@/hooks/useDelayedCompute";
import {
  computeBundlePerformance,
  computeBundleUsageRows,
  computeMarketplaceVsManual,
  computePricingInsights,
  computeReferralAging,
  computeReferralGrowth,
  computeReferralSourceDistribution,
  computeReferralsByState,
  computeStaleReferrals,
  computeViewsByBundle,
  computeViewsByState,
  computeViewsTrend,
  filterBundles,
  filterReferrals,
  filterTransactionLines,
  filterViews,
  generateBundleInsights,
  generateDemandInsights,
  generateOperationalInsights,
  generatePerformanceInsights,
  generatePricingModuleInsights,
  generateReferralModuleInsights,
  generateVisibilityInsights,
} from "@/utils/analytics";
import { formatNumber, formatPercent } from "@/utils/format";

export function OverviewPage() {
  const { filters } = useFilters();

  const { data, loading } = useDelayedCompute(
    () => {
      const bundles = filterBundles(filters);
      const viewRecords = filterViews(bundles, filters);
      const referralRecords = filterReferrals(bundles, filters);
      const lines = filterTransactionLines(referralRecords);
      const performance = computeBundlePerformance(bundles, viewRecords, referralRecords);
      const trend = computeViewsTrend(viewRecords);
      const viewsByBundle = computeViewsByBundle(bundles, viewRecords);
      const viewsByState = computeViewsByState(viewRecords);
      const pricing = computePricingInsights(bundles);
      const growth = computeReferralGrowth(referralRecords);
      const stale = computeStaleReferrals(referralRecords);
      const referralsByState = computeReferralsByState(referralRecords);
      const sourceDistribution = computeReferralSourceDistribution(referralRecords);
      const aging = computeReferralAging(referralRecords);
      const rows = computeBundleUsageRows(bundles, lines);
      const marketplaceVsManual = computeMarketplaceVsManual(lines);

      const totalViews = viewRecords.reduce((sum, v) => sum + v.views, 0);
      const totalReferrals = referralRecords.length;
      const conversionRate = totalViews > 0 ? totalReferrals / totalViews : 0;
      const completed = referralRecords.filter((r) => r.status === "completed").length;
      const successRate = totalReferrals > 0 ? completed / totalReferrals : 0;
      const abovePricing = pricing.filter((p) => p.position === "above" || p.position === "significantly_above").length;

      const allInsights = generatePerformanceInsights({
        visibility: generateVisibilityInsights(viewsByBundle, viewsByState, trend),
        demand: generateDemandInsights(performance),
        pricing: generatePricingModuleInsights(pricing),
        referral: generateReferralModuleInsights(referralRecords, stale, [], referralsByState),
        operational: generateOperationalInsights(referralRecords, sourceDistribution, aging),
        bundle: generateBundleInsights(rows, rows.length > 0 ? rows.filter((r) => r.bundleId !== null).length / Math.max(bundles.length, 1) : 0, marketplaceVsManual),
        performance,
        allReferrals: referralRecords,
      });

      return {
        bundles,
        totalViews,
        totalReferrals,
        conversionRate,
        successRate,
        abovePricing,
        growth,
        trend,
        topInsights: allInsights.slice(0, 3),
        totalInsights: allInsights.length,
      };
    },
    [filters]
  );

  const kpis = useMemo(
    () => [
      {
        label: "Total bundle views",
        value: formatNumber(data.totalViews, { compact: true }),
        icon: <Eye className="h-4 w-4" />,
        metricId: "totalBundleViews" as const,
      },
      {
        label: "Referral requests",
        value: formatNumber(data.totalReferrals),
        delta: data.growth.growthPct,
        deltaLabel: "vs prior period",
        icon: <TrendingUp className="h-4 w-4" />,
        metricId: "referralRequests" as const,
      },
      {
        label: "View-to-referral rate",
        value: formatPercent(data.conversionRate, { digits: 2 }),
        icon: <GitBranch className="h-4 w-4" />,
        metricId: "viewToReferralRate" as const,
      },
      {
        label: "Bundles priced above market",
        value: `${data.abovePricing} / ${data.bundles.length}`,
        icon: <DollarSign className="h-4 w-4" />,
        metricId: "bundlesPricedAboveMarket" as const,
      },
    ],
    [data]
  );

  return (
    <div className="flex flex-col gap-6 px-6 pt-0">
      <Topbar
        title="Portfolio overview"
        subtitle="A single view across visibility, demand, pricing, referrals, operations, and bundle usage."
      />

      {!loading && (
        <Link
          to="/insights"
          className="group flex items-center gap-4 rounded-xl2 border border-accent-indigo/25 bg-accent-indigo/[0.06] p-5 shadow-panel-light backdrop-blur-sm transition-colors hover:border-accent-indigo/40 hover:bg-accent-indigo/[0.09] dark:shadow-panel"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-gradient">
            <Sparkles className="h-5 w-5 text-[#0B0D12]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Performance Insights — {data.totalInsights} signal{data.totalInsights === 1 ? "" : "s"} found for the current filters
            </p>
            <p className="mt-0.5 text-xs text-foreground-tertiary">
              {data.topInsights[0]
                ? data.topInsights[0].title
                : "See every opportunity, warning, and growth signal across your business in one place."}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-accent-indigo transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis.map((kpi) => <KpiTile key={kpi.label} {...kpi} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <CardSkeleton height={260} />
          ) : (
            <Card>
              <CardHeader title="Views trend" subtitle="Total marketplace views across your portfolio" 
              metricId="viewsTrend"
            />
              <AreaTrendChart data={data.trend} valueLabel="Views" />
            </Card>
          )}
        </div>
        <Card>
          <CardHeader title="Explore every module" subtitle="Jump into a module for the full breakdown" metricId="exploreModulesCard" />
          <div className="flex flex-col gap-2">
            {[
              { to: "/visibility", label: "Am I visible?", icon: Eye },
              { to: "/demand", label: "Are payers interested?", icon: TrendingUp },
              { to: "/pricing", label: "How competitive are my prices?", icon: DollarSign },
              { to: "/referrals", label: "Are payers choosing me?", icon: GitBranch },
              { to: "/operations", label: "How is my business running?", icon: Activity },
              { to: "/bundles", label: "What am I actually delivering?", icon: Package },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-center justify-between rounded-lg border border-border bg-surface-hover/40 px-3.5 py-3 text-sm text-foreground-secondary transition-colors hover:border-accent-indigo/40 hover:bg-surface-hover"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-accent-indigo" />
                    {item.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-foreground-faint transition-transform group-hover:translate-x-0.5 group-hover:text-foreground-secondary" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      <div>
        {loading ? (
          <CardSkeleton height={160} />
        ) : (
          <Card>
            <CardHeader title="Top performance insights" subtitle="The most important signals right now — see all of them in Performance Insights" metricId="topPerformanceInsightsCard" />
            <div className="flex flex-col gap-2.5">
              {data.topInsights.length === 0 ? (
                <p className="text-sm text-foreground-tertiary">No notable signals for the current filters — performance looks stable.</p>
              ) : (
                data.topInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
