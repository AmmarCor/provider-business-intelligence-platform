import React from "react";
import { Boxes, Layers, PackageCheck, Wrench } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiTile } from "@/components/ui/KpiTile";
import { KpiSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { AreaTrendChart } from "@/components/charts/AreaTrendChart";
import { HorizontalBarList } from "@/components/charts/HorizontalBarList";
import { BundleUsageTable } from "@/components/tables/BundleUsageTable";
import { InsightsPanel } from "@/components/ui/InsightCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilters } from "@/hooks/useFilters";
import { useDelayedCompute } from "@/hooks/useDelayedCompute";
import {
  computeAverageBundlesPerReferral,
  computeBundleUsageRows,
  computeBundleUsageTrend,
  computeBundleUtilizationRate,
  computeMarketplaceVsManual,
  filterBundles,
  filterReferrals,
  filterTransactionLines,
  generateBundleInsights,
} from "@/utils/analytics";
import { formatNumber, formatPercent } from "@/utils/format";

export function BundleIntelligencePage() {
  const { filters } = useFilters();

  const { data, loading } = useDelayedCompute(
    () => {
      const bundles = filterBundles(filters);
      const referralRecords = filterReferrals(bundles, filters);
      const lines = filterTransactionLines(referralRecords);

      const rows = computeBundleUsageRows(bundles, lines);
      const utilizationRate = computeBundleUtilizationRate(bundles, rows);
      const marketplaceVsManual = computeMarketplaceVsManual(lines);
      const avgBundlesPerReferral = computeAverageBundlesPerReferral(lines, referralRecords);
      const trend = computeBundleUsageTrend(lines);

      const mostUsed = [...rows].sort((a, b) => b.totalCount - a.totalCount).slice(0, 8);
      const leastUsed = [...rows]
        .filter((r) => r.bundleId !== null)
        .sort((a, b) => a.totalCount - b.totalCount)
        .slice(0, 8);
      const mostInvoiced = [...rows].sort((a, b) => b.invoiceCount - a.invoiceCount).slice(0, 8);
      const mostVouchered = [...rows].filter((r) => r.voucherCount > 0).sort((a, b) => b.voucherCount - a.voucherCount).slice(0, 8);

      const insights = generateBundleInsights(rows, utilizationRate, marketplaceVsManual);

      return {
        bundles,
        lines,
        rows,
        utilizationRate,
        marketplaceVsManual,
        avgBundlesPerReferral,
        trend,
        mostUsed,
        leastUsed,
        mostInvoiced,
        mostVouchered,
        insights,
      };
    },
    [filters]
  );

  const manualSharePct = data.lines.length > 0 ? data.marketplaceVsManual.manual / data.lines.length : 0;

  return (
    <div className="flex flex-col gap-6 px-6 pt-0">
      <Topbar
        title="Bundle intelligence"
        subtitle="What am I actually delivering? Compare Marketplace catalog inventory against real transaction usage."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiTile
              label="Bundle utilization rate"
              value={formatPercent(data.utilizationRate)}
              icon={<PackageCheck className="h-4 w-4" />}
            />
            <KpiTile
              label="Marketplace vs. manual bundles"
              value={`${formatNumber(data.marketplaceVsManual.marketplace)} / ${formatNumber(data.marketplaceVsManual.manual)}`}
              icon={<Boxes className="h-4 w-4" />}
            />
            <KpiTile
              label="Manual bundle share"
              value={formatPercent(manualSharePct)}
              icon={<Wrench className="h-4 w-4" />}
              invertDelta
            />
            <KpiTile
              label="Avg. bundles per referral"
              value={data.avgBundlesPerReferral.toFixed(2)}
              icon={<Layers className="h-4 w-4" />}
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
              <CardHeader title="Bundle usage trend" subtitle="Transaction bundle lines created per day (invoices + vouchers)" />
              {data.trend.length === 0 ? <EmptyState /> : <AreaTrendChart data={data.trend} color="#3ECF8E" valueLabel="Bundle lines" />}
            </Card>
          )}
        </div>
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="Most frequently invoiced" subtitle="Top bundles by invoice line volume" />
            <HorizontalBarList
              color="#5B8DEF"
              items={data.mostInvoiced.map((r) => ({ label: r.bundleName, value: r.invoiceCount }))}
              maxItems={8}
            />
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="Most used bundles" subtitle="Highest total transaction volume — marketplace and manual combined" />
            <BundleUsageTable rows={data.mostUsed} />
          </Card>
        )}
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="Least used marketplace bundles" subtitle="Published bundles with the lowest transaction volume" />
            <BundleUsageTable rows={data.leastUsed} emptyMessage="Every published bundle has meaningful usage." />
          </Card>
        )}
      </div>

      {!loading && data.mostVouchered.length > 0 && (
        <Card>
          <CardHeader title="Most frequently vouchered" subtitle="Bundles most often used inside a Voucher" />
          <HorizontalBarList
            color="#8B7CF6"
            items={data.mostVouchered.map((r) => ({ label: r.bundleName, value: r.voucherCount }))}
            maxItems={8}
          />
        </Card>
      )}

      <div>{loading ? <CardSkeleton height={160} /> : <Card><InsightsPanel insights={data.insights} title="Bundle insights" /></Card>}</div>
    </div>
  );
}
