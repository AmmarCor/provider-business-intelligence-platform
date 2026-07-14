import React from "react";
import { CheckCircle2, Clock, FileWarning, GitBranch } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiTile } from "@/components/ui/KpiTile";
import { KpiSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { StateHeatGrid } from "@/components/charts/StateHeatGrid";
import { HorizontalBarList } from "@/components/charts/HorizontalBarList";
import { ReferralTable } from "@/components/tables/ReferralTable";
import { InsightsPanel } from "@/components/ui/InsightCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useFilters } from "@/hooks/useFilters";
import { useDelayedCompute } from "@/hooks/useDelayedCompute";
import {
  bundleById,
  computeOldReferralsWithoutInvoice,
  computeReferralGrowth,
  computeReferralsByPayer,
  computeReferralsByState,
  computeStaleReferrals,
  filterBundles,
  filterReferrals,
  generateReferralModuleInsights,
} from "@/utils/analytics";
import { formatNumber, formatPercent } from "@/utils/format";

export function ReferralsPage() {
  const { filters } = useFilters();

  const { data, loading } = useDelayedCompute(
    () => {
      const bundles = filterBundles(filters);
      const referralRecords = filterReferrals(bundles, filters);

      const byState = computeReferralsByState(referralRecords);
      const byPayer = computeReferralsByPayer(referralRecords);
      const growth = computeReferralGrowth(referralRecords);
      const stale = computeStaleReferrals(referralRecords);
      const oldNoInvoice = computeOldReferralsWithoutInvoice(referralRecords);

      const byBundleMap = new Map<string, number>();
      referralRecords.forEach((r) => byBundleMap.set(r.bundleId, (byBundleMap.get(r.bundleId) ?? 0) + 1));
      const byBundle = Array.from(byBundleMap.entries())
        .map(([bundleId, value]) => ({ label: bundleById.get(bundleId)?.name ?? "Unknown bundle", value }))
        .sort((a, b) => b.value - a.value);

      const completed = referralRecords.filter((r) => r.status === "completed").length;
      const successful = referralRecords.filter((r) => r.invoiceCount > 0).length;
      const successRate = referralRecords.length > 0 ? successful / referralRecords.length : 0;
      const withoutInvoices = referralRecords.filter((r) => r.invoiceCount === 0);

      const insights = generateReferralModuleInsights(referralRecords, stale, oldNoInvoice, byState);

      return {
        referralRecords,
        byState,
        byPayer,
        byBundle,
        growth,
        stale,
        oldNoInvoice,
        completed,
        successRate,
        withoutInvoices,
        insights,
      };
    },
    [filters]
  );

  return (
    <div className="flex flex-col gap-6 px-6 pt-0">
      <Topbar title="Referral intelligence" subtitle="Are payers choosing me? Track referral volume, quality, and follow-through." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiTile
              label="Total referrals"
              value={formatNumber(data.referralRecords.length)}
              delta={data.growth.growthPct}
              deltaLabel="vs prior period"
              icon={<GitBranch className="h-4 w-4" />}
            />
            <KpiTile
              label="Referral success rate"
              value={formatPercent(data.successRate)}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <KpiTile
              label="Stale referrals (21d+ inactive)"
              value={String(data.stale.length)}
              icon={<Clock className="h-4 w-4" />}
              invertDelta
            />
            <KpiTile
              label="Referrals without invoices"
              value={String(data.withoutInvoices.length)}
              icon={<FileWarning className="h-4 w-4" />}
              invertDelta
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <CardSkeleton height={240} />
        ) : (
          <Card>
            <CardHeader title="Referrals by state" subtitle="Where your referral demand is concentrated" />
            {data.byState.length === 0 ? <EmptyState /> : <StateHeatGrid data={data.byState} />}
          </Card>
        )}
        {loading ? (
          <CardSkeleton height={240} />
        ) : (
          <Card>
            <CardHeader title="Referrals by payer" subtitle="Top payer organizations sending referrals" />
            <HorizontalBarList color="#8B7CF6" items={data.byPayer.map((p) => ({ label: p.payerName, value: p.value }))} maxItems={8} />
          </Card>
        )}
      </div>

      <div>
        {loading ? (
          <CardSkeleton height={220} />
        ) : (
          <Card>
            <CardHeader title="Referrals by bundle" subtitle="Referral volume ranked across your portfolio" />
            <HorizontalBarList color="#5B8DEF" items={data.byBundle} maxItems={10} />
          </Card>
        )}
      </div>

      {!loading && (data.stale.length > 0 || data.oldNoInvoice.length > 0) && (
        <Card>
          <CardHeader
            title="Referrals needing attention"
            subtitle="Stale (21+ days inactive) or old with no invoice (90+ days)"
            action={<Badge tone="critical">{data.stale.length + data.oldNoInvoice.length} flagged</Badge>}
          />
          <ReferralTable referrals={[...data.stale, ...data.oldNoInvoice].filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i)} />
        </Card>
      )}

      <div>
        {loading ? (
          <CardSkeleton height={340} />
        ) : (
          <Card>
            <CardHeader title="All referrals" subtitle="Sortable log of referral activity for the current filters" />
            <ReferralTable referrals={data.referralRecords} />
          </Card>
        )}
      </div>

      <div>{loading ? <CardSkeleton height={160} /> : <Card><InsightsPanel insights={data.insights} /></Card>}</div>
    </div>
  );
}
