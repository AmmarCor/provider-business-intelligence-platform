// ---------------------------------------------------------------------------
// Domain types — Provider Business Intelligence Platform
// ---------------------------------------------------------------------------

export type Category =
  | "Orthopedics"
  | "Cardiology"
  | "Imaging"
  | "Maternity"
  | "General Surgery"
  | "Oncology"
  | "Bariatric"
  | "Spine"
  | "ENT"
  | "Gastroenterology";

export const CATEGORIES: Category[] = [
  "Orthopedics",
  "Cardiology",
  "Imaging",
  "Maternity",
  "General Surgery",
  "Oncology",
  "Bariatric",
  "Spine",
  "ENT",
  "Gastroenterology",
];

export type StateCode =
  | "TX" | "CA" | "FL" | "NY" | "IL" | "PA" | "OH" | "GA" | "NC" | "AZ" | "CO" | "TN";

export const STATE_CODES: StateCode[] = [
  "TX", "CA", "FL", "NY", "IL", "PA", "OH", "GA", "NC", "AZ", "CO", "TN",
];

export const STATE_NAMES: Record<StateCode, string> = {
  TX: "Texas",
  CA: "California",
  FL: "Florida",
  NY: "New York",
  IL: "Illinois",
  PA: "Pennsylvania",
  OH: "Ohio",
  GA: "Georgia",
  NC: "North Carolina",
  AZ: "Arizona",
  CO: "Colorado",
  TN: "Tennessee",
};

export interface Location {
  id: string;
  city: string;
  state: StateCode;
}

export interface PayerPrice {
  payerId: string;
  payerName: string;
  price: number;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  category: Category;
  cptCodes: string[];
  basePrice: number;
  marketplacePrice: number;
  payerPrices: PayerPrice[];
  locationId: string;
  state: StateCode;
  createdAt: string; // ISO date
}

export interface DailyViewRecord {
  date: string; // ISO date, daily granularity
  bundleId: string;
  views: number;
}

export type ReferralStatus = "new" | "in_review" | "scheduled" | "completed" | "cancelled";

/** Where a Referral originated. Every referral is tagged with exactly one. */
export type ReferralSource = "marketplace" | "direct_referral" | "patient_request";

export const REFERRAL_SOURCES: ReferralSource[] = ["marketplace", "direct_referral", "patient_request"];

export const REFERRAL_SOURCE_LABELS: Record<ReferralSource, string> = {
  marketplace: "Marketplace",
  direct_referral: "Direct Referral",
  patient_request: "Patient Request",
};

export interface Referral {
  id: string;
  bundleId: string;
  payerId: string;
  payerName: string;
  state: StateCode;
  createdAt: string; // ISO date
  status: ReferralStatus;
  invoiceCount: number;
  hasVoucher: boolean;
  lastActivityAt: string; // ISO date
  source: ReferralSource;
}

// ---------------------------------------------------------------------------
// Bundle Intelligence — Marketplace Bundles vs. Transaction Bundles
// ---------------------------------------------------------------------------

/** A Marketplace Bundle (the existing `Bundle` type) is catalog inventory:
 *  published, priced, searchable. A Transaction Bundle is what actually gets
 *  used inside an Invoice or Voucher for a given referral — it may point
 *  back to a Marketplace Bundle, or it may be a one-off "manual" bundle that
 *  was typed in during invoicing and never existed in the marketplace
 *  catalog at all. Business usage is measured from these lines, not from
 *  the marketplace catalog. */
export type TransactionBundleSource = "marketplace" | "manual";
export type TransactionContext = "invoice" | "voucher";

export interface TransactionBundleLine {
  id: string;
  referralId: string;
  /** Null when this line is a manual, one-off bundle with no marketplace record. */
  bundleId: string | null;
  bundleName: string;
  category: Category;
  source: TransactionBundleSource;
  context: TransactionContext;
  price: number;
  createdAt: string; // ISO date
}

export interface Payer {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Derived / analytics types
// ---------------------------------------------------------------------------

export interface TrendPoint {
  date: string;
  value: number;
}

export interface CategoryBreakdown {
  category: Category;
  value: number;
}

export interface StateBreakdown {
  state: StateCode;
  value: number;
}

export interface LocationBreakdown {
  locationId: string;
  city: string;
  state: StateCode;
  value: number;
}

export interface BundlePerformance {
  bundle: Bundle;
  views: number;
  referrals: number;
  conversionRate: number; // referrals / views
  invoicedReferrals: number;
  successRate: number; // invoicedReferrals / referrals
}

export type MarketPosition = "below" | "aligned" | "above" | "significantly_above";

export interface PricingInsight {
  bundle: Bundle;
  providerPrice: number;
  marketAverage: number;
  marketMin: number;
  marketMax: number;
  differencePct: number;
  position: MarketPosition;
}

export type InsightTone = "positive" | "warning" | "critical" | "neutral";

/** Business domain an insight belongs to — used to organize the Performance
 *  Insights section and let a provider scan by topic rather than severity. */
export type InsightCategory = "opportunity" | "warning" | "growth" | "pricing" | "referral" | "marketplace";

export const INSIGHT_CATEGORY_LABELS: Record<InsightCategory, string> = {
  opportunity: "Opportunity",
  warning: "Warning",
  growth: "Growth",
  pricing: "Pricing",
  referral: "Referral",
  marketplace: "Marketplace",
};

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  body: string;
  /** Business domain this insight belongs to (Performance Insights grouping). */
  category?: InsightCategory;
  /** A concrete next step the provider can take in response to this insight. */
  action?: string;
}

export interface GlobalFilters {
  dateRangeDays: 7 | 30 | 90 | 180 | 365;
  state: StateCode | "all";
  locationId: string | "all";
  category: Category | "all";
  bundleId: string | "all";
  payerId: string | "all";
  referralSource: ReferralSource | "all";
}

// ---------------------------------------------------------------------------
// Bundle Intelligence aggregate shapes
// ---------------------------------------------------------------------------

export interface BundleUsageRow {
  bundleId: string | null;
  bundleName: string;
  category: Category;
  source: TransactionBundleSource;
  invoiceCount: number;
  voucherCount: number;
  totalCount: number;
}
