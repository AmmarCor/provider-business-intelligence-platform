import { mockDataset } from "@/data/mockData";
import {
  Bundle,
  BundlePerformance,
  BundleUsageRow,
  Category,
  CategoryBreakdown,
  DailyViewRecord,
  GlobalFilters,
  Insight,
  LocationBreakdown,
  PricingInsight,
  Referral,
  ReferralSource,
  REFERRAL_SOURCE_LABELS,
  StateBreakdown,
  StateCode,
  STATE_NAMES,
  TransactionBundleLine,
  TrendPoint,
} from "@/types";
import { daysAgo, isoDaysAgo } from "@/utils/format";

const { locations, payers, bundles, views, referrals, transactionBundleLines, marketStats } = mockDataset;

export const locationById = new Map(locations.map((l) => [l.id, l]));
export const payerById = new Map(payers.map((p) => [p.id, p]));
export const bundleById = new Map(bundles.map((b) => [b.id, b]));

export function getAllBundles(): Bundle[] {
  return bundles;
}
export function getAllPayers() {
  return payers;
}
export function getAllLocations() {
  return locations;
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

export function filterBundles(filters: GlobalFilters): Bundle[] {
  return bundles.filter((b) => {
    if (filters.state !== "all" && b.state !== filters.state) return false;
    if (filters.locationId !== "all" && b.locationId !== filters.locationId) return false;
    if (filters.category !== "all" && b.category !== filters.category) return false;
    if (filters.bundleId !== "all" && b.id !== filters.bundleId) return false;
    return true;
  });
}

function withinWindow(dateIso: string, days: number): boolean {
  return dateIso >= isoDaysAgo(days);
}

export function filterViews(filteredBundles: Bundle[], filters: GlobalFilters): DailyViewRecord[] {
  const idSet = new Set(filteredBundles.map((b) => b.id));
  return views.filter((v) => idSet.has(v.bundleId) && withinWindow(v.date, filters.dateRangeDays));
}

export function filterReferrals(filteredBundles: Bundle[], filters: GlobalFilters): Referral[] {
  const idSet = new Set(filteredBundles.map((b) => b.id));
  return referrals.filter((r) => {
    if (!idSet.has(r.bundleId)) return false;
    if (filters.payerId !== "all" && r.payerId !== filters.payerId) return false;
    if (filters.referralSource !== "all" && r.source !== filters.referralSource) return false;
    return withinWindow(r.createdAt, filters.dateRangeDays);
  });
}

/** Transaction Bundle lines (Invoice/Voucher usage) for a given set of
 *  already-filtered referrals — Bundle Intelligence measures actual usage
 *  from these, not from marketplace catalog visibility. */
export function filterTransactionLines(filteredReferrals: Referral[]): TransactionBundleLine[] {
  const referralIdSet = new Set(filteredReferrals.map((r) => r.id));
  return transactionBundleLines.filter((line) => referralIdSet.has(line.referralId));
}

// ---------------------------------------------------------------------------
// Module 1 — Visibility Intelligence
// ---------------------------------------------------------------------------

export function computeViewsTrend(viewRecords: DailyViewRecord[]): TrendPoint[] {
  const byDate = new Map<string, number>();
  viewRecords.forEach((v) => byDate.set(v.date, (byDate.get(v.date) ?? 0) + v.views));
  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({ date, value }));
}

export function computeViewsByCategory(viewRecords: DailyViewRecord[]): CategoryBreakdown[] {
  const byCat = new Map<Category, number>();
  viewRecords.forEach((v) => {
    const bundle = bundleById.get(v.bundleId);
    if (!bundle) return;
    byCat.set(bundle.category, (byCat.get(bundle.category) ?? 0) + v.views);
  });
  return Array.from(byCat.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

export function computeViewsByState(viewRecords: DailyViewRecord[]): StateBreakdown[] {
  const byState = new Map<StateCode, number>();
  viewRecords.forEach((v) => {
    const bundle = bundleById.get(v.bundleId);
    if (!bundle) return;
    byState.set(bundle.state, (byState.get(bundle.state) ?? 0) + v.views);
  });
  return Array.from(byState.entries())
    .map(([state, value]) => ({ state, value }))
    .sort((a, b) => b.value - a.value);
}

export function computeViewsByLocation(viewRecords: DailyViewRecord[]): LocationBreakdown[] {
  const byLoc = new Map<string, number>();
  viewRecords.forEach((v) => {
    const bundle = bundleById.get(v.bundleId);
    if (!bundle) return;
    byLoc.set(bundle.locationId, (byLoc.get(bundle.locationId) ?? 0) + v.views);
  });
  return Array.from(byLoc.entries())
    .map(([locationId, value]) => {
      const loc = locationById.get(locationId);
      return { locationId, city: loc?.city ?? "Unknown", state: loc?.state ?? "TX", value };
    })
    .sort((a, b) => b.value - a.value);
}

export function computeViewsByBundle(
  filteredBundles: Bundle[],
  viewRecords: DailyViewRecord[]
): { bundle: Bundle; views: number }[] {
  const byBundle = new Map<string, number>();
  viewRecords.forEach((v) => byBundle.set(v.bundleId, (byBundle.get(v.bundleId) ?? 0) + v.views));
  return filteredBundles
    .map((bundle) => ({ bundle, views: byBundle.get(bundle.id) ?? 0 }))
    .sort((a, b) => b.views - a.views);
}

// ---------------------------------------------------------------------------
// Module 2 — Demand Intelligence & bundle performance (shared with Module 4)
// ---------------------------------------------------------------------------

export function computeReferralTrend(referralRecords: Referral[]): TrendPoint[] {
  const byDate = new Map<string, number>();
  referralRecords.forEach((r) => byDate.set(r.createdAt, (byDate.get(r.createdAt) ?? 0) + 1));
  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({ date, value }));
}

export function computeBundlePerformance(
  filteredBundles: Bundle[],
  viewRecords: DailyViewRecord[],
  referralRecords: Referral[]
): BundlePerformance[] {
  const viewsByBundle = new Map<string, number>();
  viewRecords.forEach((v) => viewsByBundle.set(v.bundleId, (viewsByBundle.get(v.bundleId) ?? 0) + v.views));

  const referralsByBundle = new Map<string, Referral[]>();
  referralRecords.forEach((r) => {
    const arr = referralsByBundle.get(r.bundleId) ?? [];
    arr.push(r);
    referralsByBundle.set(r.bundleId, arr);
  });

  return filteredBundles.map((bundle) => {
    const bundleViews = viewsByBundle.get(bundle.id) ?? 0;
    const bundleReferrals = referralsByBundle.get(bundle.id) ?? [];
    const invoiced = bundleReferrals.filter((r) => r.invoiceCount > 0).length;
    return {
      bundle,
      views: bundleViews,
      referrals: bundleReferrals.length,
      conversionRate: bundleViews > 0 ? bundleReferrals.length / bundleViews : 0,
      invoicedReferrals: invoiced,
      successRate: bundleReferrals.length > 0 ? invoiced / bundleReferrals.length : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Module 3 — Pricing Intelligence
// ---------------------------------------------------------------------------

export function computePricingInsights(filteredBundles: Bundle[]): PricingInsight[] {
  return filteredBundles.map((bundle) => {
    const stats = marketStats[bundle.category];
    const differencePct = (bundle.marketplacePrice - stats.mean) / stats.mean;
    let position: PricingInsight["position"] = "aligned";
    if (differencePct <= -0.08) position = "below";
    else if (differencePct >= 0.25) position = "significantly_above";
    else if (differencePct >= 0.08) position = "above";

    return {
      bundle,
      providerPrice: bundle.marketplacePrice,
      marketAverage: Math.round(stats.mean),
      marketMin: Math.round(stats.min),
      marketMax: Math.round(stats.max),
      differencePct,
      position,
    };
  });
}

export function priceDistributionForCategory(
  category: Category,
  providerPrice: number
): { buckets: { label: string; count: number }[]; providerBucketIndex: number } {
  const stats = marketStats[category];
  const buckets: { label: string; count: number }[] = [];
  const bucketWidth = (stats.max - stats.min) / 8;
  let providerBucketIndex = 0;
  let smallestDist = Infinity;

  for (let i = 0; i < 8; i++) {
    const lo = stats.min + i * bucketWidth;
    const hi = lo + bucketWidth;
    const mid = (lo + hi) / 2;
    const z = (mid - stats.mean) / stats.stdDev;
    const density = Math.exp(-0.5 * z * z);
    buckets.push({
      label: `$${Math.round(lo / 1000)}k`,
      count: Math.round(density * stats.sampleSize * 0.22),
    });
    const dist = Math.abs(providerPrice - mid);
    if (dist < smallestDist) {
      smallestDist = dist;
      providerBucketIndex = i;
    }
  }
  return { buckets, providerBucketIndex };
}

// ---------------------------------------------------------------------------
// Module 4 — Referral Intelligence
// ---------------------------------------------------------------------------

export function computeReferralsByState(referralRecords: Referral[]): StateBreakdown[] {
  const byState = new Map<StateCode, number>();
  referralRecords.forEach((r) => byState.set(r.state, (byState.get(r.state) ?? 0) + 1));
  return Array.from(byState.entries())
    .map(([state, value]) => ({ state, value }))
    .sort((a, b) => b.value - a.value);
}

export function computeReferralsByPayer(referralRecords: Referral[]) {
  const byPayer = new Map<string, number>();
  referralRecords.forEach((r) => byPayer.set(r.payerName, (byPayer.get(r.payerName) ?? 0) + 1));
  return Array.from(byPayer.entries())
    .map(([payerName, value]) => ({ payerName, value }))
    .sort((a, b) => b.value - a.value);
}

export function computeReferralGrowth(referralRecords: Referral[]): { current: number; previous: number; growthPct: number } {
  const midpoint = isoDaysAgo(15);
  const current = referralRecords.filter((r) => r.createdAt >= midpoint).length;
  const previous = referralRecords.filter((r) => r.createdAt < midpoint).length;
  const growthPct = previous > 0 ? (current - previous) / previous : 0;
  return { current, previous, growthPct };
}

export function computeStaleReferrals(referralRecords: Referral[]): Referral[] {
  const staleThreshold = isoDaysAgo(21);
  return referralRecords.filter(
    (r) => r.status !== "completed" && r.status !== "cancelled" && r.lastActivityAt < staleThreshold
  );
}

export function computeOldReferralsWithoutInvoice(referralRecords: Referral[]): Referral[] {
  const oldThreshold = isoDaysAgo(90);
  return referralRecords.filter((r) => r.invoiceCount === 0 && r.createdAt < oldThreshold);
}

// ---------------------------------------------------------------------------
// Insights Engine
// ---------------------------------------------------------------------------

export function generateVisibilityInsights(
  viewsByBundle: { bundle: Bundle; views: number }[],
  viewsByState: StateBreakdown[],
  trend: TrendPoint[]
): Insight[] {
  const insights: Insight[] = [];
  const zeroView = viewsByBundle.filter((v) => v.views === 0);
  if (zeroView.length > 0) {
    insights.push({
      id: "vis-zero",
      tone: "critical",
      category: "warning",
      title: `${zeroView.length} bundle${zeroView.length > 1 ? "s" : ""} have zero views`,
      body: `${zeroView.length} of your bundles received no marketplace views in the selected period. Payers cannot choose what they cannot see — review pricing, titles, and category tagging for these listings.`,
      action: "Review titles, categories, and pricing on zero-view bundles, or consider unpublishing them.",
    });
  }
  if (viewsByState.length > 0) {
    const top = viewsByState[0];
    insights.push({
      id: "vis-top-state",
      tone: "positive",
      category: "marketplace",
      title: `${STATE_NAMES[top.state]} drives your highest visibility`,
      body: `${STATE_NAMES[top.state]} accounts for the largest share of your bundle views. Consider concentrating new bundle launches or promotional pricing there first.`,
      action: `Prioritize new bundle launches or promotions in ${STATE_NAMES[top.state]}.`,
    });
  }
  if (trend.length >= 14) {
    const recent = trend.slice(-7).reduce((a, b) => a + b.value, 0);
    const prior = trend.slice(-14, -7).reduce((a, b) => a + b.value, 0);
    if (prior > 0) {
      const change = (recent - prior) / prior;
      if (Math.abs(change) >= 0.1) {
        insights.push({
          id: "vis-trend",
          tone: change > 0 ? "positive" : "warning",
          category: change > 0 ? "growth" : "warning",
          title: change > 0 ? "Views are trending up" : "Views are trending down",
          body: `Marketplace views moved ${change > 0 ? "up" : "down"} ${Math.abs(Math.round(change * 100))}% week over week. ${
            change > 0
              ? "Momentum is building — this is a good window to review pricing to convert the extra attention."
              : "Investigate whether recent price changes, seasonality, or new competing bundles are pulling attention away."
          }`,
          action: change > 0 ? "Review pricing now while attention is elevated." : "Audit recent pricing or listing changes on affected bundles.",
        });
      }
    }
  }
  return insights;
}

export function generateDemandInsights(performance: BundlePerformance[]): Insight[] {
  const insights: Insight[] = [];
  const highViewLowReferral = performance
    .filter((p) => p.views >= 40 && p.conversionRate < 0.01)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  if (highViewLowReferral.length > 0) {
    insights.push({
      id: "dem-high-low",
      tone: "warning",
      category: "opportunity",
      title: "High interest isn't converting to referrals",
      body: `${highViewLowReferral
        .map((p) => p.bundle.name)
        .join(", ")} ${highViewLowReferral.length > 1 ? "receive" : "receives"} strong marketplace attention but very few referral requests. Pricing appears to be limiting conversions on these bundles.`,
      action: "Test a price reduction or bundle repositioning on these listings.",
    });
  }

  const highPerformers = performance
    .filter((p) => p.views > 0 && p.conversionRate > 0)
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 3);

  if (highPerformers.length > 0) {
    insights.push({
      id: "dem-high-performers",
      tone: "positive",
      category: "growth",
      title: "Your strongest converting bundles",
      body: `${highPerformers.map((p) => p.bundle.name).join(", ")} convert views into referrals at the highest rate in your portfolio. Their pricing and positioning are worth replicating elsewhere.`,
      action: "Apply the same pricing and positioning strategy to similar underperforming bundles.",
    });
  }

  return insights;
}

export function generatePricingModuleInsights(insights: PricingInsight[]): Insight[] {
  const result: Insight[] = [];
  const significantlyAbove = insights.filter((i) => i.position === "significantly_above");
  const above = insights.filter((i) => i.position === "above");
  const below = insights.filter((i) => i.position === "below");
  const aligned = insights.filter((i) => i.position === "aligned");

  if (significantlyAbove.length > 0) {
    result.push({
      id: "price-above",
      tone: "critical",
      category: "pricing",
      title: `${significantlyAbove.length} bundle${significantlyAbove.length > 1 ? "s are" : " is"} significantly more expensive than the market`,
      body: `These bundles are priced well above the aggregated marketplace average for their category. This is a common reason for low referral conversion — consider a pricing review.`,
      action: "Consider a 5–15% price reduction to bring these bundles closer to the market average.",
    });
  }
  if (above.length > 0) {
    result.push({
      id: "price-somewhat-above",
      tone: "warning",
      category: "pricing",
      title: `${above.length} bundle${above.length > 1 ? "s are" : " is"} priced above the market average`,
      body: `Your pricing on these bundles is above the aggregated marketplace average for their category, though not by a wide margin. Monitor conversion closely.`,
      action: "Watch conversion trends before deciding whether a price adjustment is needed.",
    });
  }
  if (below.length > 0) {
    result.push({
      id: "price-below",
      tone: "positive",
      category: "pricing",
      title: `${below.length} bundle${below.length > 1 ? "s are" : " is"} competitively priced below market`,
      body: `Your pricing on these bundles sits below the aggregated marketplace average, which typically supports stronger referral conversion. Confirm your margin still supports this positioning.`,
      action: "Confirm margin health, then consider this pricing as a template for similar bundles.",
    });
  }
  if (aligned.length > 0) {
    result.push({
      id: "price-aligned",
      tone: "neutral",
      category: "pricing",
      title: `${aligned.length} bundle${aligned.length > 1 ? "s are" : " is"} closely aligned with market average`,
      body: `Pricing on these bundles is within a normal competitive range for their category. Differentiation through visibility and service quality will matter more than price here.`,
      action: "Invest in visibility and listing quality rather than further price changes.",
    });
  }
  return result;
}

export function generateReferralModuleInsights(
  referralRecords: Referral[],
  stale: Referral[],
  oldNoInvoice: Referral[],
  byState: StateBreakdown[]
): Insight[] {
  const insights: Insight[] = [];
  if (byState.length > 0) {
    insights.push({
      id: "ref-top-state",
      tone: "neutral",
      category: "referral",
      title: `${STATE_NAMES[byState[0].state]} generates your highest referral demand`,
      body: `${STATE_NAMES[byState[0].state]} produced the largest share of referrals in the selected period. This is a strong signal for where to expand capacity or add bundles.`,
      action: `Explore adding capacity or new bundles in ${STATE_NAMES[byState[0].state]}.`,
    });
  }
  if (stale.length > 0) {
    insights.push({
      id: "ref-stale",
      tone: "warning",
      category: "warning",
      title: `${stale.length} referral${stale.length > 1 ? "s have" : " has"} had no activity in over 21 days`,
      body: `These referrals are still open but have gone quiet. Following up directly with the payer may prevent them from stalling out entirely.`,
      action: "Follow up directly with the payer on each stale referral this week.",
    });
  }
  if (oldNoInvoice.length > 0) {
    insights.push({
      id: "ref-old-no-invoice",
      tone: "critical",
      category: "warning",
      title: `${oldNoInvoice.length} referral${oldNoInvoice.length > 1 ? "s" : ""} older than 90 days still have no invoice`,
      body: `These referrals have not produced any billing activity in over 90 days. Review them individually — they may need to be closed out or escalated.`,
      action: "Escalate or close out each referral older than 90 days with no invoice.",
    });
  }
  const completed = referralRecords.filter((r) => r.status === "completed").length;
  const successRate = referralRecords.length > 0 ? completed / referralRecords.length : 0;
  insights.push({
    id: "ref-success-rate",
    tone: successRate >= 0.5 ? "positive" : "neutral",
    category: "referral",
    title: `${Math.round(successRate * 100)}% of referrals reach completion`,
    body: `Of the referrals in the selected period, ${completed} were marked completed. ${
      successRate >= 0.5
        ? "This is a healthy completion rate relative to typical marketplace benchmarks."
        : "There may be room to tighten the referral-to-completion workflow."
    }`,
    action: successRate >= 0.5 ? "Maintain current referral follow-up cadence." : "Tighten follow-up cadence on in-progress referrals.",
  });
  return insights;
}

// ---------------------------------------------------------------------------
// Operational Intelligence — cross-source referral operations
// ---------------------------------------------------------------------------

export function computeReferralSourceDistribution(referralRecords: Referral[]): { source: ReferralSource; value: number }[] {
  const bySource = new Map<ReferralSource, number>();
  referralRecords.forEach((r) => bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1));
  return (["marketplace", "direct_referral", "patient_request"] as ReferralSource[])
    .map((source) => ({ source, value: bySource.get(source) ?? 0 }))
    .sort((a, b) => b.value - a.value);
}

export interface AgingBucket {
  label: string;
  value: number;
}

/** Buckets *open* referrals (not completed/cancelled) by age, so a provider
 *  can see how much work is piling up rather than just a single stale count. */
export function computeReferralAging(referralRecords: Referral[]): AgingBucket[] {
  const open = referralRecords.filter((r) => r.status !== "completed" && r.status !== "cancelled");
  const buckets: AgingBucket[] = [
    { label: "0–7 days", value: 0 },
    { label: "8–21 days", value: 0 },
    { label: "22–45 days", value: 0 },
    { label: "46–90 days", value: 0 },
    { label: "90+ days", value: 0 },
  ];
  open.forEach((r) => {
    const age = daysAgo(r.createdAt);
    if (age <= 7) buckets[0].value++;
    else if (age <= 21) buckets[1].value++;
    else if (age <= 45) buckets[2].value++;
    else if (age <= 90) buckets[3].value++;
    else buckets[4].value++;
  });
  return buckets;
}

/** A referral is considered archived once it has reached a terminal state
 *  (completed or cancelled) and has been quiet for a while — active
 *  referrals are everything still realistically in motion. */
export function computeActiveVsArchived(referralRecords: Referral[]): { active: number; archived: number } {
  let active = 0;
  let archived = 0;
  referralRecords.forEach((r) => {
    const terminal = r.status === "completed" || r.status === "cancelled";
    const quiet = daysAgo(r.lastActivityAt) > 45;
    if (terminal && quiet) archived++;
    else active++;
  });
  return { active, archived };
}

export function computeInvoiceCreationRate(referralRecords: Referral[]): number {
  if (referralRecords.length === 0) return 0;
  return referralRecords.filter((r) => r.invoiceCount > 0).length / referralRecords.length;
}

export function computeVoucherCreationRate(referralRecords: Referral[]): number {
  if (referralRecords.length === 0) return 0;
  return referralRecords.filter((r) => r.hasVoucher).length / referralRecords.length;
}

export function generateOperationalInsights(
  referralRecords: Referral[],
  sourceDistribution: { source: ReferralSource; value: number }[],
  aging: AgingBucket[]
): Insight[] {
  const insights: Insight[] = [];
  const total = referralRecords.length;

  if (total > 0 && sourceDistribution.length > 0) {
    const top = sourceDistribution[0];
    const share = top.value / total;
    if (top.source !== "marketplace" && share >= 0.4) {
      insights.push({
        id: "ops-source-mix",
        tone: "neutral",
        category: "referral",
        title: `Most of your referrals come from ${REFERRAL_SOURCE_LABELS[top.source]} rather than Marketplace`,
        body: `${REFERRAL_SOURCE_LABELS[top.source]} accounts for ${Math.round(share * 100)}% of referrals in the selected period. Marketplace visibility work may be under-leveraged relative to your other channels.`,
        action: "Compare channel economics and consider rebalancing effort toward the highest-converting source.",
      });
    }
  }

  const oldAging = aging.find((b) => b.label === "90+ days");
  if (oldAging && oldAging.value > 0) {
    insights.push({
      id: "ops-aging",
      tone: "critical",
      category: "warning",
      title: `${oldAging.value} open referral${oldAging.value > 1 ? "s" : ""} are over 90 days old`,
      body: `These referrals are still open and have been in progress for more than 90 days. Long-open referrals typically indicate a stalled workflow step.`,
      action: "Audit each 90+ day referral to identify where the workflow is stuck.",
    });
  }

  const invoiceRate = computeInvoiceCreationRate(referralRecords);
  if (total >= 10) {
    insights.push({
      id: "ops-invoice-rate",
      tone: invoiceRate >= 0.5 ? "positive" : "warning",
      category: invoiceRate >= 0.5 ? "growth" : "opportunity",
      title: `${Math.round(invoiceRate * 100)}% of referrals produce an invoice`,
      body: `Of ${total} referrals in the selected period, ${referralRecords.filter((r) => r.invoiceCount > 0).length} generated at least one invoice. ${
        invoiceRate >= 0.5
          ? "This is a healthy operational conversion rate."
          : "A meaningful share of referrals never reach billing — this is worth investigating."
      }`,
      action: invoiceRate >= 0.5 ? "Keep the current intake-to-billing workflow." : "Investigate why referrals stall before an invoice is created.",
    });
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Bundle Intelligence — Marketplace Bundles vs. Transaction Bundles
// ---------------------------------------------------------------------------

export function computeBundleUsageRows(
  filteredBundles: Bundle[],
  lines: TransactionBundleLine[]
): BundleUsageRow[] {
  const rows = new Map<string, BundleUsageRow>();

  lines.forEach((line) => {
    const key = line.bundleId ?? `manual:${line.bundleName}`;
    const existing = rows.get(key);
    if (existing) {
      if (line.context === "invoice") existing.invoiceCount++;
      else existing.voucherCount++;
      existing.totalCount++;
    } else {
      rows.set(key, {
        bundleId: line.bundleId,
        bundleName: line.bundleName,
        category: line.category,
        source: line.source,
        invoiceCount: line.context === "invoice" ? 1 : 0,
        voucherCount: line.context === "voucher" ? 1 : 0,
        totalCount: 1,
      });
    }
  });

  // Restrict marketplace-sourced rows to bundles within the current filter set
  // (manual rows have no marketplace bundle to filter against, so they always pass).
  const allowedIds = new Set(filteredBundles.map((b) => b.id));
  return Array.from(rows.values()).filter((row) => row.bundleId === null || allowedIds.has(row.bundleId));
}

export function computeBundleUtilizationRate(filteredBundles: Bundle[], rows: BundleUsageRow[]): number {
  if (filteredBundles.length === 0) return 0;
  const usedIds = new Set(rows.filter((r) => r.bundleId !== null).map((r) => r.bundleId));
  return usedIds.size / filteredBundles.length;
}

export function computeMarketplaceVsManual(lines: TransactionBundleLine[]): { marketplace: number; manual: number } {
  let marketplace = 0;
  let manual = 0;
  lines.forEach((l) => (l.source === "marketplace" ? marketplace++ : manual++));
  return { marketplace, manual };
}

export function computeAverageBundlesPerReferral(lines: TransactionBundleLine[], referralRecords: Referral[]): number {
  const referralsWithLines = new Set(lines.map((l) => l.referralId));
  const relevantReferrals = referralRecords.filter((r) => referralsWithLines.has(r.id));
  if (relevantReferrals.length === 0) return 0;
  return lines.length / relevantReferrals.length;
}

export function computeBundleUsageTrend(lines: TransactionBundleLine[]): TrendPoint[] {
  const byDate = new Map<string, number>();
  lines.forEach((l) => byDate.set(l.createdAt, (byDate.get(l.createdAt) ?? 0) + 1));
  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({ date, value }));
}

export function generateBundleInsights(
  rows: BundleUsageRow[],
  utilizationRate: number,
  marketplaceVsManual: { marketplace: number; manual: number }
): Insight[] {
  const insights: Insight[] = [];
  const totalLines = marketplaceVsManual.marketplace + marketplaceVsManual.manual;

  if (totalLines > 0) {
    const manualShare = marketplaceVsManual.manual / totalLines;
    if (manualShare >= 0.15) {
      insights.push({
        id: "bundle-manual-share",
        tone: manualShare >= 0.3 ? "warning" : "neutral",
        category: "opportunity",
        title: `Manual bundles represent ${Math.round(manualShare * 100)}% of your invoiced services`,
        body: `A meaningful share of what you actually bill happens outside the Marketplace catalog. Publishing these as real Marketplace Bundles could improve visibility and pricing consistency for services you're already delivering.`,
        action: "Review your most common manual bundles and publish the recurring ones to the Marketplace catalog.",
      });
    }
  }

  if (rows.length > 0) {
    insights.push({
      id: "bundle-utilization",
      tone: utilizationRate >= 0.6 ? "positive" : "warning",
      category: utilizationRate >= 0.6 ? "growth" : "opportunity",
      title: `${Math.round(utilizationRate * 100)}% of your Marketplace Bundles have been used in a real transaction`,
      body: `${
        utilizationRate >= 0.6
          ? "Most of your published bundles are actively converting into billed business."
          : "A large share of your published bundles have never appeared on an invoice or voucher — the catalog may be larger than what payers actually need."
      }`,
      action: utilizationRate >= 0.6 ? "Keep expanding the catalog in categories that are converting." : "Prune or repackage bundles with no transaction history.",
    });
  }

  const leastUsed = [...rows]
    .filter((r) => r.bundleId !== null)
    .sort((a, b) => a.totalCount - b.totalCount)
    .slice(0, 3);
  if (leastUsed.length > 0 && rows.length > 5) {
    insights.push({
      id: "bundle-least-used",
      tone: "neutral",
      category: "warning",
      title: "Some published bundles are rarely used",
      body: `${leastUsed.map((r) => r.bundleName).join(", ")} ${leastUsed.length > 1 ? "have" : "has"} the lowest transaction volume among bundles that have been used at all. Confirm these still reflect services you want to promote.`,
      action: "Reassess pricing or positioning on your lowest-usage bundles.",
    });
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Performance Insights — the cross-module aggregator
// ---------------------------------------------------------------------------

/** Category-level conversion comparison ("Orthopedic bundles outperform
 *  Cardiology bundles") — compares average view-to-referral conversion
 *  rate across the two categories with the most views, so the comparison
 *  is always statistically meaningful rather than picking obscure ones. */
function generateCategoryComparisonInsight(performance: BundlePerformance[]): Insight | null {
  const byCategory = new Map<Category, { views: number; referrals: number }>();
  performance.forEach((p) => {
    const entry = byCategory.get(p.bundle.category) ?? { views: 0, referrals: 0 };
    entry.views += p.views;
    entry.referrals += p.referrals;
    byCategory.set(p.bundle.category, entry);
  });

  const ranked = Array.from(byCategory.entries())
    .filter(([, v]) => v.views >= 50)
    .map(([category, v]) => ({ category, conversion: v.views > 0 ? v.referrals / v.views : 0 }))
    .sort((a, b) => b.conversion - a.conversion);

  if (ranked.length < 2) return null;
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  if (best.conversion <= worst.conversion * 1.3) return null;

  return {
    id: "perf-category-comparison",
    tone: "neutral",
    category: "growth",
    title: `${best.category} bundles outperform ${worst.category} bundles`,
    body: `${best.category} converts views into referrals at roughly ${(best.conversion / Math.max(worst.conversion, 0.0001)).toFixed(1)}x the rate of ${worst.category} in the selected period. Pricing, positioning, or category demand differ meaningfully between the two.`,
    action: `Review what's working in ${best.category} and consider applying it to ${worst.category}.`,
  };
}

/** "Patient Requests are increasing month over month" — compares the most
 *  recent 30 days of a given source against the prior 30 days. */
function generateSourceGrowthInsight(referralRecords: Referral[]): Insight | null {
  const patientRequests = referralRecords.filter((r) => r.source === "patient_request");
  const recentCutoff = isoDaysAgo(30);
  const priorCutoff = isoDaysAgo(60);
  const recent = patientRequests.filter((r) => r.createdAt >= recentCutoff).length;
  const prior = patientRequests.filter((r) => r.createdAt >= priorCutoff && r.createdAt < recentCutoff).length;
  if (prior < 3) return null;
  const growth = (recent - prior) / prior;
  if (growth < 0.15) return null;

  return {
    id: "perf-patient-request-growth",
    tone: "positive",
    category: "growth",
    title: "Patient Requests are increasing month over month",
    body: `Patient Request referrals grew ${Math.round(growth * 100)}% compared to the prior 30 days. This channel is becoming a more meaningful part of your referral mix.`,
    action: "Ensure bundle pricing and availability are optimized for mobile-app patient demand.",
  };
}

/** Pulls together every module's insights plus a few cross-cutting ones that
 *  only make sense at the portfolio level, for the dedicated Performance
 *  Insights section. Existing per-module pages are unaffected — they keep
 *  calling their own generate*Insights functions directly. */
export function generatePerformanceInsights(params: {
  visibility: Insight[];
  demand: Insight[];
  pricing: Insight[];
  referral: Insight[];
  operational: Insight[];
  bundle: Insight[];
  performance: BundlePerformance[];
  allReferrals: Referral[];
}): Insight[] {
  const combined = [
    ...params.visibility,
    ...params.demand,
    ...params.pricing,
    ...params.referral,
    ...params.operational,
    ...params.bundle,
  ];

  const categoryComparison = generateCategoryComparisonInsight(params.performance);
  if (categoryComparison) combined.push(categoryComparison);

  const sourceGrowth = generateSourceGrowthInsight(params.allReferrals);
  if (sourceGrowth) combined.push(sourceGrowth);

  // De-duplicate by id (a handful of insights can be generated by more than
  // one caller in the same page) and surface the most actionable ones first:
  // critical > warning > positive > neutral.
  const severityRank: Record<Insight["tone"], number> = { critical: 0, warning: 1, positive: 2, neutral: 3 };
  const seen = new Set<string>();
  return combined
    .filter((insight) => {
      if (seen.has(insight.id)) return false;
      seen.add(insight.id);
      return true;
    })
    .sort((a, b) => severityRank[a.tone] - severityRank[b.tone]);
}
