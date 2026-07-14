import React from "react";
import { Eye, EyeOff, MapPin, TrendingUp } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiTile } from "@/components/ui/KpiTile";
import { KpiSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { AreaTrendChart } from "@/components/charts/AreaTrendChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { StateHeatGrid } from "@/components/charts/StateHeatGrid";
import { ViewsTreemap } from "@/components/charts/ViewsTreemap";
import { RankingTable } from "@/components/tables/RankingTable";
import { InsightsPanel } from "@/components/ui/InsightCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilters } from "@/hooks/useFilters";
import { useDelayedCompute } from "@/hooks/useDelayedCompute";
import {
  computeViewsByBundle,
  computeViewsByCategory,
  computeViewsByLocation,
  computeViewsByState,
  computeViewsTrend,
  filterBundles,
  filterViews,
  generateVisibilityInsights,
} from "@/utils/analytics";
import { formatNumber } from "@/utils/format";

export function VisibilityPage() {
  const { filters } = useFilters();

  const { data, loading } = useDelayedCompute(
    () => {
      const bundles = filterBundles(filters);
      const viewRecords = filterViews(bundles, filters);

      const trend = computeViewsTrend(viewRecords);
      const byCategory = computeViewsByCategory(viewRecords);
      const byState = computeViewsByState(viewRecords);
      const byLocation = computeViewsByLocation(viewRecords);
      const byBundle = computeViewsByBundle(bundles, viewRecords);

      const totalViews = viewRecords.reduce((sum, v) => sum + v.views, 0);
      const zeroViewBundles = byBundle.filter((b) => b.views === 0);
      const topViewed = byBundle.slice(0, 8);
      const lowestViewed = byBundle
        .filter((b) => b.views > 0)
        .slice(-8)
        .reverse();

      const first7 = trend.slice(0, 7).reduce((a, b) => a + b.value, 0);
      const last7 = trend.slice(-7).reduce((a, b) => a + b.value, 0);
      const trendDelta = first7 > 0 ? (last7 - first7) / first7 : 0;

      const insights = generateVisibilityInsights(byBundle, byState, trend);

      return {
        bundles,
        trend,
        byCategory,
        byState,
        byLocation,
        byBundle,
        totalViews,
        zeroViewBundles,
        topViewed,
        lowestViewed,
        trendDelta,
        insights,
      };
    },
    [filters]
  );

  return (
    <div className="flex flex-col gap-6 px-6 pt-0">
      <Topbar title="Visibility intelligence" subtitle="Am I visible? Understand how often payers discover your bundles." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiTile
              label="Total bundle views"
              value={formatNumber(data.totalViews, { compact: true })}
              delta={data.trendDelta}
              deltaLabel="vs start of period"
              icon={<Eye className="h-4 w-4" />}
            />
            <KpiTile
              label="Zero-view bundles"
              value={String(data.zeroViewBundles.length)}
              icon={<EyeOff className="h-4 w-4" />}
              invertDelta
            />
            <KpiTile
              label="Top state"
              value={data.byState[0] ? data.byState[0].state : "—"}
              icon={<MapPin className="h-4 w-4" />}
            />
            <KpiTile
              label="Active bundles viewed"
              value={`${data.byBundle.filter((b) => b.views > 0).length} / ${data.bundles.length}`}
              icon={<TrendingUp className="h-4 w-4" />}
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
              <CardHeader title="Views trend" subtitle="Daily marketplace views across the selected filters" />
              {data.trend.length === 0 ? <EmptyState /> : <AreaTrendChart data={data.trend} valueLabel="Views" />}
            </Card>
          )}
        </div>
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="Views by category" subtitle="Which specialties get discovered most" />
            {data.byCategory.length === 0 ? (
              <EmptyState />
            ) : (
              <CategoryBarChart data={data.byCategory.map((c) => ({ category: c.category, value: c.value }))} />
            )}
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <CardSkeleton height={220} />
        ) : (
          <Card>
            <CardHeader title="Views by state" subtitle="Geographic concentration of payer attention" />
            {data.byState.length === 0 ? <EmptyState /> : <StateHeatGrid data={data.byState} />}
          </Card>
        )}
        {loading ? (
          <CardSkeleton height={220} />
        ) : (
          <Card>
            <CardHeader title="Views by location" subtitle="City-level breakdown, sized by share of total views" />
            {data.byLocation.length === 0 ? (
              <EmptyState />
            ) : (
              <ViewsTreemap
                data={data.byLocation.slice(0, 14).map((l) => ({ name: `${l.city}, ${l.state}`, size: l.value }))}
              />
            )}
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="Top viewed bundles" subtitle="Your strongest visibility performers" />
            <RankingTable
              rows={data.topViewed.map((b) => ({
                bundle: b.bundle,
                primaryValue: b.views,
                primaryLabel: "Views",
              }))}
            />
          </Card>
        )}
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="Lowest viewed bundles" subtitle="Listings that may need a refresh" />
            <RankingTable
              rows={data.lowestViewed.map((b) => ({
                bundle: b.bundle,
                primaryValue: b.views,
                primaryLabel: "Views",
              }))}
              emptyMessage="Every bundle either has strong views or zero views — check the panel below."
            />
          </Card>
        )}
      </div>

      {data.zeroViewBundles.length > 0 && !loading && (
        <Card>
          <CardHeader
            title="Zero-view bundles"
            subtitle="These bundles have not been seen by a single payer in the selected period"
          />
          <RankingTable
            rows={data.zeroViewBundles.map((b) => ({
              bundle: b.bundle,
              primaryValue: 0,
              primaryLabel: "Views",
            }))}
          />
        </Card>
      )}

      <div>{loading ? <CardSkeleton height={160} /> : <Card><InsightsPanel insights={data.insights} /></Card>}</div>
    </div>
  );
}
