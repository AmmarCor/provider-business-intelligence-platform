import React from "react";
import { GitBranch, Percent, TrendingDown, TrendingUp } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiTile } from "@/components/ui/KpiTile";
import { KpiSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { AreaTrendChart } from "@/components/charts/AreaTrendChart";
import { HorizontalBarList } from "@/components/charts/HorizontalBarList";
import { RankingTable } from "@/components/tables/RankingTable";
import { InsightsPanel } from "@/components/ui/InsightCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useFilters } from "@/hooks/useFilters";
import { useDelayedCompute } from "@/hooks/useDelayedCompute";
import {
  computeBundlePerformance,
  computeReferralGrowth,
  computeReferralTrend,
  filterBundles,
  filterReferrals,
  filterViews,
  generateDemandInsights,
} from "@/utils/analytics";
import { formatNumber, formatPercent } from "@/utils/format";

export function DemandPage() {
  const { filters } = useFilters();

  const { data, loading } = useDelayedCompute(
    () => {
      const bundles = filterBundles(filters);
      const viewRecords = filterViews(bundles, filters);
      const referralRecords = filterReferrals(bundles, filters);
      const trend = computeReferralTrend(referralRecords);
      const performance = computeBundlePerformance(bundles, viewRecords, referralRecords);
      const growth = computeReferralGrowth(referralRecords);

      const totalViews = viewRecords.reduce((sum, v) => sum + v.views, 0);
      const totalReferrals = referralRecords.length;
      const overallConversion = totalViews > 0 ? totalReferrals / totalViews : 0;

      const highViewsLowReferrals = performance
        .filter((p) => p.views >= 30)
        .sort((a, b) => b.views - a.views)
        .filter((p) => p.conversionRate < overallConversion * 0.5)
        .slice(0, 6);

      const highPerforming = performance
        .filter((p) => p.views > 0)
        .sort((a, b) => b.conversionRate - a.conversionRate)
        .slice(0, 6);

      const lowPerforming = performance
        .filter((p) => p.views >= 10)
        .sort((a, b) => a.conversionRate - b.conversionRate)
        .slice(0, 6);

      const referralsPerBundle = performance
        .filter((p) => p.referrals > 0)
        .sort((a, b) => b.referrals - a.referrals)
        .slice(0, 10);

      const insights = generateDemandInsights(performance);

      return {
        trend,
        performance,
        growth,
        totalReferrals,
        overallConversion,
        highViewsLowReferrals,
        highPerforming,
        lowPerforming,
        referralsPerBundle,
        insights,
      };
    },
    [filters]
  );

  return (
    <div className="flex flex-col gap-6 px-6 pt-0">
      <Topbar title="Demand intelligence" subtitle="Are payers interested? Track how views turn into referral requests." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiTile
              label="Referral requests"
              value={formatNumber(data.totalReferrals)}
              delta={data.growth.growthPct}
              deltaLabel="vs prior period"
              icon={<GitBranch className="h-4 w-4" />}
              metricId="referralRequests"
            />
            <KpiTile
              label="Overall conversion rate"
              value={formatPercent(data.overallConversion, { digits: 2 })}
              icon={<Percent className="h-4 w-4" />}
              metricId="overallConversionRate"
            />
            <KpiTile
              label="Bundles underconverting"
              value={String(data.highViewsLowReferrals.length)}
              icon={<TrendingDown className="h-4 w-4" />}
              metricId="bundlesUnderconverting"
              invertDelta
            />
            <KpiTile
              label="Bundles above average conversion"
              value={String(data.performance.filter((p) => p.conversionRate > data.overallConversion).length)}
              icon={<TrendingUp className="h-4 w-4" />}
              metricId="bundlesAboveAverageConversion"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <CardSkeleton height={260} />
          ) : (
            <Card>
              <CardHeader title="Referral trend" subtitle="Referral requests created per day across the selected filters" 
              metricId="referralTrend"
            />
              {data.trend.length === 0 ? <EmptyState /> : <AreaTrendChart data={data.trend} color="#3ECF8E" valueLabel="Referrals" />}
            </Card>
          )}
        </div>
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="Referral requests per bundle" subtitle="Top 10 bundles by referral volume" 
              metricId="referralsPerBundle"
            />
            <HorizontalBarList
              color="#3ECF8E"
              items={data.referralsPerBundle.map((p) => ({ label: p.bundle.name, value: p.referrals }))}
              maxItems={10}
            />
          </Card>
        )}
      </div>

      {!loading && data.highViewsLowReferrals.length > 0 && (
        <Card>
          <CardHeader
            title="High views, low referrals"
            subtitle="Bundles attracting attention that isn't converting — pricing is the most common cause"
            action={<Badge tone="warning">Needs review</Badge>}
            metricId="highViewsLowReferrals"
          />
          <RankingTable
            rows={data.highViewsLowReferrals.map((p) => ({
              bundle: p.bundle,
              primaryValue: p.views,
              secondaryValue: p.referrals,
              primaryLabel: "Bundle Views",
              secondaryLabel: "Referral Requests",
            }))}
          />
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="High performing bundles" subtitle="Best view-to-referral conversion in your portfolio" 
              metricId="highPerformingBundles"
            />
            <RankingTable
              rows={data.highPerforming.map((p) => ({
                bundle: p.bundle,
                primaryValue: Math.round(p.conversionRate * 10000) / 100,
                secondaryValue: p.referrals,
                primaryLabel: "Referral Conversion Rate (%)",
                secondaryLabel: "Referral Requests",
              }))}
            />
          </Card>
        )}
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="Low performing bundles" subtitle="Bundles with meaningful views but weak conversion" 
              metricId="lowPerformingBundles"
            />
            <RankingTable
              rows={data.lowPerforming.map((p) => ({
                bundle: p.bundle,
                primaryValue: Math.round(p.conversionRate * 10000) / 100,
                secondaryValue: p.views,
                primaryLabel: "Referral Conversion Rate (%)",
                secondaryLabel: "Bundle Views",
              }))}
            />
          </Card>
        )}
      </div>

      <div>{loading ? <CardSkeleton height={160} /> : <Card><InsightsPanel insights={data.insights} /></Card>}</div>
    </div>
  );
}
