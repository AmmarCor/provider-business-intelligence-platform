import React, { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info, Sparkles, XCircle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { CardSkeleton, KpiSkeleton } from "@/components/ui/Skeleton";
import { KpiTile } from "@/components/ui/KpiTile";
import { InsightsPanel } from "@/components/ui/InsightCard";
import { useFilters } from "@/hooks/useFilters";
import { useDelayedCompute } from "@/hooks/useDelayedCompute";
import {
  computeActiveVsArchived,
  computeBundlePerformance,
  computeBundleUsageRows,
  computeBundleUtilizationRate,
  computeMarketplaceVsManual,
  computePricingInsights,
  computeReferralAging,
  computeReferralSourceDistribution,
  computeReferralsByState,
  computeStaleReferrals,
  computeOldReferralsWithoutInvoice,
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
import { Insight, INSIGHT_CATEGORY_LABELS, InsightCategory } from "@/types";
import { MetricId } from "@/constants/metricDefinitions";

const CATEGORY_ORDER: InsightCategory[] = ["opportunity", "warning", "growth", "pricing", "referral", "marketplace"];

const CATEGORY_METRIC_IDS: Record<InsightCategory, MetricId> = {
  opportunity: "insightCategoryOpportunity",
  warning: "insightCategoryWarning",
  growth: "insightCategoryGrowth",
  pricing: "insightCategoryPricing",
  referral: "insightCategoryReferral",
  marketplace: "insightCategoryMarketplace",
};

export function PerformanceInsightsPage() {
  const { filters } = useFilters();

  const { data, loading } = useDelayedCompute(
    () => {
      const bundles = filterBundles(filters);
      const viewRecords = filterViews(bundles, filters);
      const referralRecords = filterReferrals(bundles, filters);
      const lines = filterTransactionLines(referralRecords);

      // Visibility
      const trend = computeViewsTrend(viewRecords);
      const viewsByBundle = computeViewsByBundle(bundles, viewRecords);
      const viewsByState = computeViewsByState(viewRecords);
      const visibilityInsights = generateVisibilityInsights(viewsByBundle, viewsByState, trend);

      // Demand
      const performance = computeBundlePerformance(bundles, viewRecords, referralRecords);
      const demandInsights = generateDemandInsights(performance);

      // Pricing
      const pricing = computePricingInsights(bundles);
      const pricingInsights = generatePricingModuleInsights(pricing);

      // Referral
      const stale = computeStaleReferrals(referralRecords);
      const oldNoInvoice = computeOldReferralsWithoutInvoice(referralRecords);
      const referralsByState = computeReferralsByState(referralRecords);
      const referralInsights = generateReferralModuleInsights(referralRecords, stale, oldNoInvoice, referralsByState);

      // Operational
      const sourceDistribution = computeReferralSourceDistribution(referralRecords);
      const aging = computeReferralAging(referralRecords);
      const operationalInsights = generateOperationalInsights(referralRecords, sourceDistribution, aging);

      // Bundle
      const rows = computeBundleUsageRows(bundles, lines);
      const utilizationRate = computeBundleUtilizationRate(bundles, rows);
      const marketplaceVsManual = computeMarketplaceVsManual(lines);
      const bundleInsights = generateBundleInsights(rows, utilizationRate, marketplaceVsManual);

      const allInsights = generatePerformanceInsights({
        visibility: visibilityInsights,
        demand: demandInsights,
        pricing: pricingInsights,
        referral: referralInsights,
        operational: operationalInsights,
        bundle: bundleInsights,
        performance,
        allReferrals: referralRecords,
      });

      const activeVsArchived = computeActiveVsArchived(referralRecords);

      return {
        allInsights,
        activeVsArchived,
        totalReferrals: referralRecords.length,
      };
    },
    [filters]
  );

  const grouped = useMemo(() => {
    const map = new Map<InsightCategory, Insight[]>();
    data.allInsights.forEach((insight) => {
      const category = insight.category ?? "marketplace";
      const arr = map.get(category) ?? [];
      arr.push(insight);
      map.set(category, arr);
    });
    return map;
  }, [data.allInsights]);

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, positive: 0, neutral: 0 };
    data.allInsights.forEach((i) => counts[i.tone]++);
    return counts;
  }, [data.allInsights]);

  return (
    <div className="flex flex-col gap-6 px-6 pt-0">
      <Topbar
        title="Performance insights"
        subtitle="What happened, why it happened, and what to do next — pulled from every module into one place."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiTile label="Total insights this period" value={String(data.allInsights.length)} icon={<Sparkles className="h-4 w-4" />} metricId="totalInsightsCount" />
            <KpiTile label="Needs immediate attention" value={String(severityCounts.critical)} icon={<XCircle className="h-4 w-4" />} metricId="needsImmediateAttention" invertDelta />
            <KpiTile label="Worth watching" value={String(severityCounts.warning)} icon={<AlertTriangle className="h-4 w-4" />} metricId="worthWatching" invertDelta />
            <KpiTile label="Working well" value={String(severityCounts.positive)} icon={<CheckCircle2 className="h-4 w-4" />} metricId="workingWell" />
          </>
        )}
      </div>

      {!loading && data.allInsights.length === 0 && (
        <Card>
          <div className="flex items-center gap-3 py-4">
            <Info className="h-5 w-5 text-accent-indigo" />
            <p className="text-sm text-foreground-secondary">
              No notable signals for the current filters. Try widening the date range or clearing a filter to see more of your portfolio.
            </p>
          </div>
        </Card>
      )}

      {loading
        ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} height={180} />)
        : CATEGORY_ORDER.map((category) => {
            const insights = grouped.get(category);
            if (!insights || insights.length === 0) return null;
            return (
              <Card key={category}>
                <CardHeader
                  title={INSIGHT_CATEGORY_LABELS[category]}
                  subtitle={`${insights.length} insight${insights.length > 1 ? "s" : ""} in this category for the current filters`}
                  metricId={CATEGORY_METRIC_IDS[category]}
                />
                <InsightsPanel insights={insights} title="" />
              </Card>
            );
          })}
    </div>
  );
}
