import { mockDataset } from "@/data/mockData";
import { Category } from "@/types";

/**
 * Marketplace Opportunity Map — data layer.
 *
 * This does NOT introduce a second, disconnected mock dataset. Every number
 * shown on the map (views, referrals, success rate, competition, pricing)
 * is derived from the same `mockDataset` that powers the rest of the
 * dashboard, so it stays numerically consistent with Visibility, Demand,
 * and Pricing Intelligence. States outside the provider's current bundle
 * footprint simply have no underlying data and render as "no-data".
 */

export type OpportunityLevel = "high" | "medium" | "low" | "no-data";
export type CompetitionLevel = "Low" | "Medium" | "High";
export type MapPricePosition = "below" | "aligned" | "above" | "significantly_above";

export interface OpportunityMapEntry {
  /** USPS two-letter code. */
  code: string;
  name: string;
  level: OpportunityLevel;
  opportunityScore?: number; // 0–100
  marketplaceViews?: number;
  referralRequests?: number;
  referralSuccessRate?: number; // 0–1
  competitionLevel?: CompetitionLevel;
  avgMarketPrice?: number;
  yourAvgPrice?: number;
  pricePosition?: MapPricePosition;
  topCategories?: Category[];
  recommendedAction?: string;
}

// ---------------------------------------------------------------------------
// Tile-grid layout
// ---------------------------------------------------------------------------
// Each state occupies one cell in a 12-column x 8-row grid, arranged to
// loosely mirror real US geography (west coast on the left, New England
// clustered top-right, AK/HI as corner insets). This is the same "tile grid
// map" pattern used by several commercial BI/news dashboards — it avoids
// needing precise geographic border paths while still reading instantly as
// a US map, and every state gets an equally clickable/hoverable target
// regardless of its real land area.

export const US_STATE_GRID: Record<string, { col: number; row: number }> = {
  AK: { col: 1, row: 1 },
  ME: { col: 12, row: 1 },

  WA: { col: 2, row: 2 },
  ID: { col: 3, row: 2 },
  MT: { col: 4, row: 2 },
  ND: { col: 5, row: 2 },
  MN: { col: 6, row: 2 },
  WI: { col: 7, row: 2 },
  MI: { col: 8, row: 2 },
  NY: { col: 10, row: 2 },
  VT: { col: 11, row: 2 },
  NH: { col: 12, row: 2 },

  OR: { col: 2, row: 3 },
  NV: { col: 3, row: 3 },
  WY: { col: 4, row: 3 },
  SD: { col: 5, row: 3 },
  IA: { col: 6, row: 3 },
  IL: { col: 7, row: 3 },
  IN: { col: 8, row: 3 },
  OH: { col: 9, row: 3 },
  PA: { col: 10, row: 3 },
  NJ: { col: 11, row: 3 },
  MA: { col: 12, row: 3 },

  CA: { col: 2, row: 4 },
  UT: { col: 3, row: 4 },
  CO: { col: 4, row: 4 },
  NE: { col: 5, row: 4 },
  MO: { col: 6, row: 4 },
  KY: { col: 7, row: 4 },
  WV: { col: 8, row: 4 },
  VA: { col: 9, row: 4 },
  MD: { col: 10, row: 4 },
  DE: { col: 11, row: 4 },
  CT: { col: 12, row: 4 },

  AZ: { col: 3, row: 5 },
  NM: { col: 4, row: 5 },
  KS: { col: 5, row: 5 },
  AR: { col: 6, row: 5 },
  TN: { col: 7, row: 5 },
  NC: { col: 8, row: 5 },
  SC: { col: 9, row: 5 },
  RI: { col: 12, row: 5 },

  OK: { col: 5, row: 6 },
  LA: { col: 6, row: 6 },
  MS: { col: 7, row: 6 },
  GA: { col: 8, row: 6 },
  DC: { col: 9, row: 6 },

  TX: { col: 5, row: 7 },
  AL: { col: 7, row: 7 },
  FL: { col: 9, row: 7 },

  HI: { col: 1, row: 8 },
};

const FULL_STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function bucketCompetition(avgSampleSize: number): CompetitionLevel {
  if (avgSampleSize < 240) return "Low";
  if (avgSampleSize < 330) return "Medium";
  return "High";
}

function bucketPricePosition(differencePct: number): MapPricePosition {
  if (differencePct <= -0.08) return "below";
  if (differencePct >= 0.25) return "significantly_above";
  if (differencePct >= 0.08) return "above";
  return "aligned";
}

const COMPETITION_SCORE: Record<CompetitionLevel, number> = { Low: 100, Medium: 60, High: 30 };
const PRICE_SCORE: Record<MapPricePosition, number> = {
  below: 100,
  aligned: 75,
  above: 40,
  significantly_above: 15,
};

function recommendAction(input: {
  pricePosition: MapPricePosition;
  referralSuccessRate: number;
  viewsScore: number;
  conversionScore: number;
  topCategory: Category;
  topCategoryShare: number;
}): string {
  if (input.pricePosition === "significantly_above") return "Reduce pricing";
  if (input.referralSuccessRate < 0.35) return "Improve referral conversion";
  if (input.viewsScore < 40) return "Promote marketplace visibility";
  if (input.conversionScore < 40) return "Increase bundle sharing";
  if (input.topCategoryShare >= 0.35) return `Expand ${input.topCategory} bundles`;
  return "Promote marketplace visibility";
}

function buildActiveStateEntries(): Map<string, OpportunityMapEntry> {
  const { bundles, views, referrals, marketStats } = mockDataset;

  const viewsByBundleId = new Map<string, number>();
  views.forEach((v) => viewsByBundleId.set(v.bundleId, (viewsByBundleId.get(v.bundleId) ?? 0) + v.views));

  const stateCodes = Array.from(new Set(bundles.map((b) => b.state)));

  interface RawStats {
    code: string;
    totalViews: number;
    referralRequests: number;
    referralSuccessRate: number;
    competitionLevel: CompetitionLevel;
    avgMarketPrice: number;
    yourAvgPrice: number;
    pricePosition: MapPricePosition;
    topCategories: Category[];
    topCategoryShare: number;
  }

  const raw: RawStats[] = stateCodes.map((code) => {
    const stateBundles = bundles.filter((b) => b.state === code);
    const stateReferrals = referrals.filter((r) => r.state === code);

    const totalViews = stateBundles.reduce((sum, b) => sum + (viewsByBundleId.get(b.id) ?? 0), 0);
    const referralRequests = stateReferrals.length;
    const successCount = stateReferrals.filter((r) => r.invoiceCount > 0).length;
    const referralSuccessRate = referralRequests > 0 ? successCount / referralRequests : 0;

    const categoryCounts = new Map<Category, number>();
    stateBundles.forEach((b) => categoryCounts.set(b.category, (categoryCounts.get(b.category) ?? 0) + 1));
    const sortedCategories = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1]);
    const topCategories = sortedCategories.slice(0, 3).map(([category]) => category);
    const topCategoryShare = sortedCategories.length > 0 ? sortedCategories[0][1] / stateBundles.length : 0;

    let weightedMarketPrice = 0;
    let weightedSampleSize = 0;
    stateBundles.forEach((b) => {
      const stats = marketStats[b.category];
      weightedMarketPrice += stats.mean;
      weightedSampleSize += stats.sampleSize;
    });
    const avgMarketPrice = stateBundles.length > 0 ? weightedMarketPrice / stateBundles.length : 0;
    const avgSampleSize = stateBundles.length > 0 ? weightedSampleSize / stateBundles.length : 0;
    const competitionLevel = bucketCompetition(avgSampleSize);

    const yourAvgPrice =
      stateBundles.length > 0 ? stateBundles.reduce((sum, b) => sum + b.marketplacePrice, 0) / stateBundles.length : 0;
    const differencePct = avgMarketPrice > 0 ? (yourAvgPrice - avgMarketPrice) / avgMarketPrice : 0;
    const pricePosition = bucketPricePosition(differencePct);

    return {
      code,
      totalViews,
      referralRequests,
      referralSuccessRate,
      competitionLevel,
      avgMarketPrice,
      yourAvgPrice,
      pricePosition,
      topCategories,
      topCategoryShare,
    };
  });

  const maxViews = Math.max(...raw.map((r) => r.totalViews), 1);
  const maxConversion = Math.max(...raw.map((r) => (r.totalViews > 0 ? r.referralRequests / r.totalViews : 0)), 0.0001);

  const result = new Map<string, OpportunityMapEntry>();

  raw.forEach((r) => {
    const viewsScore = (r.totalViews / maxViews) * 100;
    const conversionRate = r.totalViews > 0 ? r.referralRequests / r.totalViews : 0;
    const conversionScore = (conversionRate / maxConversion) * 100;
    const successScore = r.referralSuccessRate * 100;
    const competitionScore = COMPETITION_SCORE[r.competitionLevel];
    const pricingScore = PRICE_SCORE[r.pricePosition];

    const opportunityScore = Math.round(
      0.25 * viewsScore + 0.2 * conversionScore + 0.25 * successScore + 0.15 * competitionScore + 0.15 * pricingScore
    );

    const level: OpportunityLevel = opportunityScore >= 70 ? "high" : opportunityScore >= 45 ? "medium" : "low";

    const recommendedAction = recommendAction({
      pricePosition: r.pricePosition,
      referralSuccessRate: r.referralSuccessRate,
      viewsScore,
      conversionScore,
      topCategory: r.topCategories[0] ?? "General Surgery",
      topCategoryShare: r.topCategoryShare,
    });

    result.set(r.code, {
      code: r.code,
      name: FULL_STATE_NAMES[r.code] ?? r.code,
      level,
      opportunityScore,
      marketplaceViews: r.totalViews,
      referralRequests: r.referralRequests,
      referralSuccessRate: r.referralSuccessRate,
      competitionLevel: r.competitionLevel,
      avgMarketPrice: r.avgMarketPrice,
      yourAvgPrice: r.yourAvgPrice,
      pricePosition: r.pricePosition,
      topCategories: r.topCategories,
      recommendedAction,
    });
  });

  return result;
}

function build(): OpportunityMapEntry[] {
  const active = buildActiveStateEntries();
  return Object.keys(US_STATE_GRID).map((code) => {
    const existing = active.get(code);
    if (existing) return existing;
    return {
      code,
      name: FULL_STATE_NAMES[code] ?? code,
      level: "no-data" as const,
    };
  });
}

/** Precomputed once — deterministic because it derives from the already
 *  deterministic, seeded `mockDataset`. */
export const OPPORTUNITY_MAP_DATA: OpportunityMapEntry[] = build();

export const OPPORTUNITY_MAP_BY_CODE: Map<string, OpportunityMapEntry> = new Map(
  OPPORTUNITY_MAP_DATA.map((e) => [e.code, e])
);
