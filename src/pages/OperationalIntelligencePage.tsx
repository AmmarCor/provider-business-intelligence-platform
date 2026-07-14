import React from "react";
import { Activity, Archive, FileCheck2, Ticket } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiTile } from "@/components/ui/KpiTile";
import { KpiSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { AreaTrendChart } from "@/components/charts/AreaTrendChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { InsightsPanel } from "@/components/ui/InsightCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useFilters } from "@/hooks/useFilters";
import { useDelayedCompute } from "@/hooks/useDelayedCompute";
import {
  computeActiveVsArchived,
  computeInvoiceCreationRate,
  computeOldReferralsWithoutInvoice,
  computeReferralAging,
  computeReferralSourceDistribution,
  computeReferralTrend,
  computeStaleReferrals,
  computeVoucherCreationRate,
  filterBundles,
  filterReferrals,
  generateOperationalInsights,
} from "@/utils/analytics";
import { formatNumber, formatPercent } from "@/utils/format";
import { REFERRAL_SOURCE_LABELS } from "@/types";

export function OperationalIntelligencePage() {
  const { filters } = useFilters();

  const { data, loading } = useDelayedCompute(
    () => {
      const bundles = filterBundles(filters);
      const referralRecords = filterReferrals(bundles, filters);

      const trend = computeReferralTrend(referralRecords);
      const sourceDistribution = computeReferralSourceDistribution(referralRecords);
      const aging = computeReferralAging(referralRecords);
      const activeVsArchived = computeActiveVsArchived(referralRecords);
      const invoiceRate = computeInvoiceCreationRate(referralRecords);
      const voucherRate = computeVoucherCreationRate(referralRecords);
      const stale = computeStaleReferrals(referralRecords);
      const oldNoInvoice = computeOldReferralsWithoutInvoice(referralRecords);

      const insights = generateOperationalInsights(referralRecords, sourceDistribution, aging);

      return {
        referralRecords,
        trend,
        sourceDistribution,
        aging,
        activeVsArchived,
        invoiceRate,
        voucherRate,
        stale,
        oldNoInvoice,
        insights,
      };
    },
    [filters]
  );

  return (
    <div className="flex flex-col gap-6 px-6 pt-0">
      <Topbar
        title="Operational intelligence"
        subtitle="How is my business running? Track referral operations across every source and channel."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiTile
              label="Total referral volume"
              value={formatNumber(data.referralRecords.length)}
              icon={<Activity className="h-4 w-4" />}
            />
            <KpiTile
              label="Invoice creation rate"
              value={formatPercent(data.invoiceRate)}
              icon={<FileCheck2 className="h-4 w-4" />}
            />
            <KpiTile
              label="Voucher creation rate"
              value={formatPercent(data.voucherRate)}
              icon={<Ticket className="h-4 w-4" />}
            />
            <KpiTile
              label="Active vs. archived"
              value={`${formatNumber(data.activeVsArchived.active)} / ${formatNumber(data.activeVsArchived.archived)}`}
              icon={<Archive className="h-4 w-4" />}
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
              <CardHeader title="Referral trend" subtitle="All referral sources combined, across the selected filters" />
              {data.trend.length === 0 ? <EmptyState /> : <AreaTrendChart data={data.trend} color="#8B7CF6" valueLabel="Referrals" />}
            </Card>
          )}
        </div>
        {loading ? (
          <CardSkeleton height={260} />
        ) : (
          <Card>
            <CardHeader title="Referral source distribution" subtitle="Marketplace, Direct Referral, and Patient Request" />
            {data.sourceDistribution.every((s) => s.value === 0) ? (
              <EmptyState />
            ) : (
              <CategoryBarChart
                data={data.sourceDistribution.map((s) => ({ category: REFERRAL_SOURCE_LABELS[s.source], value: s.value }))}
              />
            )}
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <CardSkeleton height={240} />
        ) : (
          <Card>
            <CardHeader title="Referral aging" subtitle="Open referrals grouped by how long they've been in progress" />
            {data.aging.every((b) => b.value === 0) ? (
              <EmptyState message="No open referrals for the current filters." />
            ) : (
              <CategoryBarChart data={data.aging.map((b) => ({ category: b.label, value: b.value }))} height={220} />
            )}
          </Card>
        )}
        {loading ? (
          <CardSkeleton height={240} />
        ) : (
          <Card>
            <CardHeader
              title="Needs attention"
              subtitle="Stale (21+ days inactive) and old-with-no-invoice (90+ days) referrals"
              action={<Badge tone="warning">{data.stale.length + data.oldNoInvoice.length} flagged</Badge>}
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-hover/40 px-3.5 py-3">
                <span className="text-sm text-foreground-secondary">Stale referrals (21+ days inactive)</span>
                <span className="tabular text-sm font-semibold text-foreground">{data.stale.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-hover/40 px-3.5 py-3">
                <span className="text-sm text-foreground-secondary">Referrals without invoices (90+ days)</span>
                <span className="tabular text-sm font-semibold text-foreground">{data.oldNoInvoice.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-hover/40 px-3.5 py-3">
                <span className="text-sm text-foreground-secondary">Referrals without any invoice (all time)</span>
                <span className="tabular text-sm font-semibold text-foreground">
                  {data.referralRecords.filter((r) => r.invoiceCount === 0).length}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div>{loading ? <CardSkeleton height={160} /> : <Card><InsightsPanel insights={data.insights} title="Operational insights" /></Card>}</div>
    </div>
  );
}
