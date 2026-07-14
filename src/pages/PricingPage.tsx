import React, { useMemo, useState } from "react";
import { DollarSign, TrendingDown, TrendingUp, Scale } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiTile } from "@/components/ui/KpiTile";
import { KpiSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { DistributionChart } from "@/components/charts/DistributionChart";
import { InsightsPanel } from "@/components/ui/InsightCard";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFilters } from "@/hooks/useFilters";
import { useDelayedCompute } from "@/hooks/useDelayedCompute";
import { computePricingInsights, filterBundles, generatePricingModuleInsights, priceDistributionForCategory } from "@/utils/analytics";
import { formatCurrency, formatPercent } from "@/utils/format";
import { PricingInsight } from "@/types";

const POSITION_LABEL: Record<PricingInsight["position"], string> = {
  below: "Below market",
  aligned: "Aligned with market",
  above: "Above market",
  significantly_above: "Significantly above market",
};

const POSITION_TONE: Record<PricingInsight["position"], "positive" | "neutral" | "warning" | "critical"> = {
  below: "positive",
  aligned: "neutral",
  above: "warning",
  significantly_above: "critical",
};

function positionCopy(p: PricingInsight): string {
  switch (p.position) {
    case "below":
      return "Your bundle is competitively priced below the aggregated market average.";
    case "aligned":
      return "Your bundle is competitively priced in line with similar bundles.";
    case "above":
      return "Your price is above the market average for this category.";
    case "significantly_above":
      return "Your bundle is significantly more expensive than similar bundles.";
  }
}

export function PricingPage() {
  const { filters } = useFilters();
  const [selectedBundleId, setSelectedBundleId] = useState<string>("");

  const { data, loading } = useDelayedCompute(
    () => {
      const bundles = filterBundles(filters);
      const pricing = computePricingInsights(bundles);
      const below = pricing.filter((p) => p.position === "below").length;
      const aligned = pricing.filter((p) => p.position === "aligned").length;
      const above = pricing.filter((p) => p.position === "above").length;
      const significantlyAbove = pricing.filter((p) => p.position === "significantly_above").length;
      const avgDifference =
        pricing.length > 0 ? pricing.reduce((sum, p) => sum + p.differencePct, 0) / pricing.length : 0;
      const insights = generatePricingModuleInsights(pricing);
      const sorted = [...pricing].sort((a, b) => b.differencePct - a.differencePct);
      return { bundles, pricing, below, aligned, above, significantlyAbove, avgDifference, insights, sorted };
    },
    [filters]
  );

  const activeBundle = useMemo(() => {
    if (data.pricing.length === 0) return undefined;
    const found = data.pricing.find((p) => p.bundle.id === selectedBundleId);
    return found ?? data.pricing[0];
  }, [data.pricing, selectedBundleId]);

  const distribution = useMemo(() => {
    if (!activeBundle) return null;
    return priceDistributionForCategory(activeBundle.bundle.category, activeBundle.providerPrice);
  }, [activeBundle]);

  return (
    <div className="flex flex-col gap-6 px-6 pt-0">
      <Topbar
        title="Pricing intelligence"
        subtitle="How competitive are my prices? Compare against anonymized, aggregated marketplace pricing."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiTile
              label="Average price vs market"
              value={formatPercent(data.avgDifference, { signed: true, digits: 1 })}
              icon={<Scale className="h-4 w-4" />}
            />
            <KpiTile label="Priced below market" value={String(data.below)} icon={<TrendingDown className="h-4 w-4" />} />
            <KpiTile label="Aligned with market" value={String(data.aligned)} icon={<DollarSign className="h-4 w-4" />} />
            <KpiTile
              label="Significantly above market"
              value={String(data.significantlyAbove)}
              icon={<TrendingUp className="h-4 w-4" />}
              invertDelta
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <CardSkeleton height={340} />
          ) : (
            <Card>
              <CardHeader title="Price positioning by bundle" subtitle="Sorted from most above market to most below market" />
              {data.sorted.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-[11px] uppercase tracking-wide text-foreground-tertiary">
                        <th className="py-2 pr-3 font-medium">Bundle</th>
                        <th className="py-2 pr-3 text-right font-medium">Your price</th>
                        <th className="py-2 pr-3 text-right font-medium">Market avg</th>
                        <th className="py-2 pr-3 text-right font-medium">Difference</th>
                        <th className="py-2 pl-3 font-medium">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sorted.slice(0, 12).map((p) => (
                        <tr key={p.bundle.id} className="border-b border-surface-hover last:border-0 hover:bg-surface-hover/40">
                          <td className="py-2.5 pr-3 font-medium text-foreground">{p.bundle.name}</td>
                          <td className="py-2.5 pr-3 tabular text-right">{formatCurrency(p.providerPrice)}</td>
                          <td className="py-2.5 pr-3 tabular text-right text-foreground-tertiary">{formatCurrency(p.marketAverage)}</td>
                          <td className="py-2.5 pr-3 tabular text-right">{formatPercent(p.differencePct, { signed: true })}</td>
                          <td className="py-2.5 pl-3">
                            <Badge tone={POSITION_TONE[p.position]}>{POSITION_LABEL[p.position]}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.sorted.length > 12 && (
                    <p className="mt-2 text-center text-[11px] text-foreground-tertiary">
                      Showing 12 of {data.sorted.length} bundles for the current filters.
                    </p>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        {loading ? (
          <CardSkeleton height={340} />
        ) : (
          <Card>
            <CardHeader title="Market position detail" subtitle="Select a bundle to see its distribution" />
            {activeBundle ? (
              <div className="flex flex-col gap-4">
                <Select
                  value={activeBundle.bundle.id}
                  onChange={setSelectedBundleId}
                  options={data.pricing.map((p) => ({ label: p.bundle.name, value: p.bundle.id }))}
                />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-border bg-surface-hover/40 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-foreground-tertiary">Lowest</p>
                    <p className="tabular text-sm font-semibold text-foreground">{formatCurrency(activeBundle.marketMin, { compact: true })}</p>
                  </div>
                  <div className="rounded-lg border border-accent-indigo/40 bg-accent-indigo/10 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-foreground-tertiary">Your price</p>
                    <p className="tabular text-sm font-semibold text-accent-indigo">{formatCurrency(activeBundle.providerPrice, { compact: true })}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface-hover/40 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-foreground-tertiary">Highest</p>
                    <p className="tabular text-sm font-semibold text-foreground">{formatCurrency(activeBundle.marketMax, { compact: true })}</p>
                  </div>
                </div>
                {distribution && (
                  <DistributionChart buckets={distribution.buckets} providerBucketIndex={distribution.providerBucketIndex} height={180} />
                )}
                <div className="rounded-lg border border-border bg-surface-hover/40 p-3">
                  <Badge tone={POSITION_TONE[activeBundle.position]} className="mb-1.5">
                    {POSITION_LABEL[activeBundle.position]}
                  </Badge>
                  <p className="text-xs leading-relaxed text-foreground-tertiary">{positionCopy(activeBundle)}</p>
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </Card>
        )}
      </div>

      <div>{loading ? <CardSkeleton height={160} /> : <Card><InsightsPanel insights={data.insights} /></Card>}</div>
    </div>
  );
}
