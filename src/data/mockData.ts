import {
  Bundle,
  Category,
  CATEGORIES,
  DailyViewRecord,
  Location,
  Payer,
  PayerPrice,
  Referral,
  ReferralSource,
  ReferralStatus,
  STATE_CODES,
  StateCode,
  TransactionBundleLine,
  TransactionContext,
} from "@/types";
import { createRng, gaussian, pick, randFloat, randInt, weighted } from "@/utils/random";

const SEED = 88172645;

// ---------------------------------------------------------------------------
// Reference pools
// ---------------------------------------------------------------------------

const CITIES_BY_STATE: Record<StateCode, string[]> = {
  TX: ["Austin", "Houston", "Dallas", "San Antonio", "El Paso"],
  CA: ["Los Angeles", "San Diego", "Sacramento", "Fresno", "Oakland"],
  FL: ["Miami", "Tampa", "Orlando", "Jacksonville", "Fort Lauderdale"],
  NY: ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"],
  IL: ["Chicago", "Naperville", "Peoria", "Springfield", "Rockford"],
  PA: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"],
  OH: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
  GA: ["Atlanta", "Savannah", "Augusta", "Athens", "Macon"],
  NC: ["Charlotte", "Raleigh", "Durham", "Greensboro", "Asheville"],
  AZ: ["Phoenix", "Tucson", "Mesa", "Scottsdale", "Chandler"],
  CO: ["Denver", "Boulder", "Colorado Springs", "Fort Collins", "Aurora"],
  TN: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"],
};

const CATEGORY_BUNDLE_TEMPLATES: Record<Category, { names: string[]; cpt: string[] }> = {
  Orthopedics: {
    names: ["Total Knee Replacement", "Total Hip Replacement", "ACL Reconstruction", "Rotator Cuff Repair", "Arthroscopic Knee Surgery"],
    cpt: ["27447", "27130", "29888", "29827", "29881"],
  },
  Cardiology: {
    names: ["Coronary Angioplasty", "Cardiac Catheterization", "Pacemaker Implantation", "Echocardiogram Package", "Stress Test Bundle"],
    cpt: ["92928", "93458", "33208", "93306", "93017"],
  },
  Imaging: {
    names: ["MRI Brain w/o Contrast", "CT Abdomen & Pelvis", "PET Scan Full Body", "Mammography Screening", "Ultrasound Abdomen"],
    cpt: ["70551", "74177", "78815", "77067", "76700"],
  },
  Maternity: {
    names: ["Vaginal Delivery Bundle", "Cesarean Section Bundle", "Prenatal Care Package", "High-Risk Pregnancy Monitoring", "Postpartum Care Bundle"],
    cpt: ["59400", "59510", "59425", "59426", "59430"],
  },
  "General Surgery": {
    names: ["Laparoscopic Cholecystectomy", "Inguinal Hernia Repair", "Appendectomy Bundle", "Colonoscopy with Polypectomy", "Gallbladder Removal"],
    cpt: ["47562", "49505", "44970", "45385", "47563"],
  },
  Oncology: {
    names: ["Chemotherapy Infusion Package", "Radiation Therapy Course", "Tumor Biopsy Bundle", "PET-CT Oncology Staging", "Mastectomy Surgical Bundle"],
    cpt: ["96413", "77385", "19100", "78815", "19303"],
  },
  Bariatric: {
    names: ["Gastric Sleeve Surgery", "Gastric Bypass Surgery", "Lap-Band Placement", "Bariatric Pre-Op Evaluation", "Revisional Bariatric Surgery"],
    cpt: ["43775", "43644", "43770", "43645", "43848"],
  },
  Spine: {
    names: ["Lumbar Spinal Fusion", "Cervical Disc Replacement", "Microdiscectomy Bundle", "Spinal Decompression Surgery", "Kyphoplasty Procedure"],
    cpt: ["22612", "22856", "63030", "63047", "22523"],
  },
  ENT: {
    names: ["Tonsillectomy Bundle", "Septoplasty Package", "Sinus Surgery Bundle", "Cochlear Implant Package", "Thyroidectomy Bundle"],
    cpt: ["42826", "30520", "31255", "69930", "60240"],
  },
  Gastroenterology: {
    names: ["Upper Endoscopy Bundle", "Colonoscopy Screening Package", "ERCP Procedure Bundle", "Liver Biopsy Package", "GERD Surgical Package"],
    cpt: ["43235", "45378", "43260", "47000", "43280"],
  },
};

const PAYER_NAMES = [
  "Meridian Health Partners", "BlueStone Alliance", "Coastal Employer Trust", "Summit Benefits Group",
  "Horizon Employer Coalition", "Pinnacle Health Fund", "Lakeside Purchasing Alliance", "Northgate Benefits",
  "Anchor Employer Network", "Cedar Point Health Trust", "Bright Path Benefits", "Union Square Health Coalition",
  "Vantage Employer Group", "Redwood Health Alliance", "Frontier Benefits Trust", "Clearwater Purchasing Group",
  "Sterling Employer Health", "Ridgeline Benefits Alliance", "Harborview Health Trust", "Ironwood Employer Coalition",
];

const BASE_PRICE_RANGE: Record<Category, [number, number]> = {
  Orthopedics: [18000, 42000],
  Cardiology: [12000, 55000],
  Imaging: [400, 3200],
  Maternity: [6000, 22000],
  "General Surgery": [7000, 26000],
  Oncology: [15000, 90000],
  Bariatric: [14000, 28000],
  Spine: [30000, 85000],
  ENT: [5000, 18000],
  Gastroenterology: [2500, 9000],
};

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

function generateLocations(rng: () => number, count: number): Location[] {
  const locations: Location[] = [];
  for (let i = 0; i < count; i++) {
    const state = pick(rng, STATE_CODES);
    const city = pick(rng, CITIES_BY_STATE[state]);
    locations.push({ id: `loc-${i + 1}`, city, state });
  }
  return locations;
}

function generatePayers(rng: () => number): Payer[] {
  return PAYER_NAMES.map((name, i) => ({ id: `payer-${i + 1}`, name }));
}

function generateBundles(rng: () => number, locations: Location[], count: number): Bundle[] {
  const bundles: Bundle[] = [];
  // Weight category selection so some categories dominate the provider's portfolio (realism)
  const categoryWeights = CATEGORIES.map(() => randFloat(rng, 0.4, 1.6));

  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[weighted(rng, categoryWeights)];
    const template = CATEGORY_BUNDLE_TEMPLATES[category];
    const nameIdx = randInt(rng, 0, template.names.length - 1);
    const baseName = template.names[nameIdx];
    const cpt = template.cpt[nameIdx];
    const location = pick(rng, locations);
    const [lo, hi] = BASE_PRICE_RANGE[category];
    const basePrice = Math.round(randFloat(rng, lo, hi) / 50) * 50;
    // marketplace price is typically a discount off base price
    const discount = randFloat(rng, 0.05, 0.28);
    const marketplacePrice = Math.round((basePrice * (1 - discount)) / 50) * 50;

    const payerPriceCount = randInt(rng, 0, 4);
    const payerPrices: PayerPrice[] = [];
    const usedPayerIdx = new Set<number>();
    for (let p = 0; p < payerPriceCount; p++) {
      let idx = randInt(rng, 0, PAYER_NAMES.length - 1);
      let guard = 0;
      while (usedPayerIdx.has(idx) && guard < 10) {
        idx = randInt(rng, 0, PAYER_NAMES.length - 1);
        guard++;
      }
      usedPayerIdx.add(idx);
      const variance = randFloat(rng, -0.08, 0.05);
      payerPrices.push({
        payerId: `payer-${idx + 1}`,
        payerName: PAYER_NAMES[idx],
        price: Math.round((marketplacePrice * (1 + variance)) / 50) * 50,
      });
    }

    const createdDaysAgo = randInt(rng, 40, 420);
    const createdAt = new Date(Date.now() - createdDaysAgo * 86400000).toISOString().slice(0, 10);

    bundles.push({
      id: `bundle-${i + 1}`,
      name: `${baseName} — ${location.city}`,
      description: `Comprehensive ${category.toLowerCase()} bundle covering pre-operative evaluation, procedure, and standard follow-up care.`,
      category,
      cptCodes: [cpt],
      basePrice,
      marketplacePrice,
      payerPrices,
      locationId: location.id,
      state: location.state,
      createdAt,
    });
  }
  return bundles;
}

/** Market-wide price distribution per category, used for pricing intelligence
 *  without materializing thousands of competitor bundle records. */
export interface CategoryMarketStats {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  sampleSize: number;
}

function generateCategoryMarketStats(rng: () => number): Record<Category, CategoryMarketStats> {
  const stats = {} as Record<Category, CategoryMarketStats>;
  for (const category of CATEGORIES) {
    const [lo, hi] = BASE_PRICE_RANGE[category];
    const discountMean = randFloat(rng, 0.1, 0.22);
    const mean = ((lo + hi) / 2) * (1 - discountMean);
    const stdDev = mean * randFloat(rng, 0.12, 0.22);
    stats[category] = {
      mean: Math.round(mean),
      stdDev: Math.round(stdDev),
      min: Math.round(mean - stdDev * 2.1),
      max: Math.round(mean + stdDev * 2.6),
      sampleSize: randInt(rng, 180, 420), // simulated marketplace-wide competitor count for this category
    };
  }
  return stats;
}

function generateDailyViews(rng: () => number, bundles: Bundle[], days: number): DailyViewRecord[] {
  const records: DailyViewRecord[] = [];
  const today = new Date();

  // Each bundle gets an intrinsic popularity multiplier; ~7% are "zero view" dead listings
  const popularity = bundles.map(() => {
    const isDead = rng() < 0.07;
    if (isDead) return 0;
    return randFloat(rng, 0.3, 1.0) ** 1.6 * randFloat(rng, 3, 22);
  });

  // Gentle overall upward trend + weekly seasonality (lower on weekends)
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const iso = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1.0;
    const trendFactor = 0.75 + ((days - d) / days) * 0.5; // ramps up over the window

    bundles.forEach((bundle, i) => {
      const base = popularity[i];
      if (base === 0) return;
      const noise = Math.max(0, gaussian(rng, 1, 0.35));
      const views = Math.round(base * weekendFactor * trendFactor * noise);
      if (views > 0) {
        records.push({ date: iso, bundleId: bundle.id, views });
      }
    });
  }
  return records;
}

const STATUS_BY_AGE = (ageDays: number, rng: () => number): ReferralStatus => {
  if (ageDays < 3) return weighted(rng, [0.7, 0.3]) === 0 ? "new" : "in_review";
  if (ageDays < 10) return pick(rng, ["in_review", "scheduled", "new"] as ReferralStatus[]);
  if (ageDays < 30) return pick(rng, ["scheduled", "completed", "in_review"] as ReferralStatus[]);
  const roll = rng();
  if (roll < 0.72) return "completed";
  if (roll < 0.85) return "cancelled";
  return "scheduled";
};

/** Builds `count` referrals for a single bundle + source combination. Shared
 *  by all three referral sources so status/age/invoice logic stays
 *  consistent — only the volume driver and age skew differ per source. */
function buildReferralBatch(
  rng: () => number,
  bundle: Bundle,
  payers: Payer[],
  source: ReferralSource,
  count: number,
  ageMean: number,
  ageStdDev: number,
  counterRef: { value: number }
): Referral[] {
  const batch: Referral[] = [];
  for (let i = 0; i < count; i++) {
    const ageDays = Math.round(Math.abs(gaussian(rng, ageMean, ageStdDev)));
    const cappedAge = Math.min(ageDays, 400);
    const createdAt = new Date(Date.now() - cappedAge * 86400000).toISOString().slice(0, 10);
    const status = STATUS_BY_AGE(cappedAge, rng);
    const payer = pick(rng, payers);

    const hasInvoice =
      status === "completed" ? rng() < 0.96 :
      status === "scheduled" ? rng() < 0.55 :
      status === "cancelled" ? rng() < 0.1 :
      rng() < 0.2;

    const invoiceCount = hasInvoice ? randInt(rng, 1, 3) : 0;
    const lastActivityOffset = randInt(rng, 0, Math.min(cappedAge, 60));
    const lastActivityAt = new Date(Date.now() - lastActivityOffset * 86400000).toISOString().slice(0, 10);

    batch.push({
      id: `ref-${counterRef.value++}`,
      bundleId: bundle.id,
      payerId: payer.id,
      payerName: payer.name,
      state: bundle.state,
      createdAt,
      status,
      invoiceCount,
      hasVoucher: rng() < 0.4,
      lastActivityAt,
      source,
    });
  }
  return batch;
}

function generateReferrals(
  rng: () => number,
  bundles: Bundle[],
  payers: Payer[],
  viewsByBundle: Map<string, number>,
  marketStats: Record<Category, CategoryMarketStats>
): Referral[] {
  const referrals: Referral[] = [];
  const counterRef = { value: 1 };

  bundles.forEach((bundle) => {
    const totalViews = viewsByBundle.get(bundle.id) ?? 0;
    if (totalViews === 0) return;

    const stats = marketStats[bundle.category];
    const priceDelta = (bundle.marketplacePrice - stats.mean) / stats.mean; // negative = cheaper than market
    // cheaper-than-market bundles convert better; pricier bundles convert worse
    const priceEffect = Math.max(0.4, 1 - priceDelta * 1.3);
    const baseConversion = randFloat(rng, 0.015, 0.09) * priceEffect;
    const marketplaceReferralCount = Math.max(0, Math.round(totalViews * Math.min(0.35, baseConversion)));

    // Marketplace: a referral created directly from a bundle shown in the
    // Marketplace — this is the existing view-driven volume, unchanged.
    referrals.push(
      ...buildReferralBatch(rng, bundle, payers, "marketplace", marketplaceReferralCount, 45, 55, counterRef)
    );

    // Direct Referral: created manually from the Referral List, independent
    // of marketplace view volume — scaled off marketplace volume as a proxy
    // for the provider's overall relationship strength with payers for this
    // service, but with its own, wider variance.
    const directReferralCount = Math.round(marketplaceReferralCount * randFloat(rng, 0.35, 0.95));
    referrals.push(
      ...buildReferralBatch(rng, bundle, payers, "direct_referral", directReferralCount, 50, 60, counterRef)
    );

    // Patient Request: originates in the mobile app and is converted by the
    // payer — a newer, smaller, but skews-recent channel (growing faster
    // than the other two), which is what powers the "Patient Requests are
    // increasing" growth insight.
    const patientRequestCount = Math.round(marketplaceReferralCount * randFloat(rng, 0.1, 0.4));
    referrals.push(
      ...buildReferralBatch(rng, bundle, payers, "patient_request", patientRequestCount, 22, 28, counterRef)
    );
  });

  return referrals;
}

const MANUAL_BUNDLE_SUFFIXES = ["(Custom)", "(Ancillary)", "(Add-on)", "(Follow-up)"];

/** Generates the Invoice/Voucher line items actually billed against each
 *  referral. Most lines point back to the referral's own Marketplace Bundle;
 *  a minority are one-off "manual" bundles typed in during invoicing that
 *  never existed in the Marketplace catalog — this is what powers Bundle
 *  Intelligence's manual-vs-marketplace and utilization metrics. */
function generateTransactionBundleLines(
  rng: () => number,
  bundles: Bundle[],
  referrals: Referral[]
): TransactionBundleLine[] {
  const bundleMap = new Map(bundles.map((b) => [b.id, b]));
  const lines: TransactionBundleLine[] = [];
  let counter = 1;

  referrals.forEach((referral) => {
    const bundle = bundleMap.get(referral.bundleId);
    if (!bundle) return;

    const addLine = (context: TransactionContext, referenceDate: string) => {
      // The primary line always reflects the bundle the referral was created for.
      lines.push({
        id: `txn-${counter++}`,
        referralId: referral.id,
        bundleId: bundle.id,
        bundleName: bundle.name,
        category: bundle.category,
        source: "marketplace",
        context,
        price: bundle.marketplacePrice,
        createdAt: referenceDate,
      });

      // A minority of invoices/vouchers pick up an extra manual bundle that
      // was never published to the Marketplace (e.g. an ancillary service
      // added while billing).
      if (rng() < (context === "invoice" ? 0.22 : 0.12)) {
        const suffix = pick(rng, MANUAL_BUNDLE_SUFFIXES);
        lines.push({
          id: `txn-${counter++}`,
          referralId: referral.id,
          bundleId: null,
          bundleName: `${bundle.category} Service ${suffix}`,
          category: bundle.category,
          source: "manual",
          context,
          price: Math.round(bundle.marketplacePrice * randFloat(rng, 0.08, 0.35)),
          createdAt: referenceDate,
        });
      }
    };

    if (referral.invoiceCount > 0) {
      for (let i = 0; i < referral.invoiceCount; i++) {
        addLine("invoice", referral.lastActivityAt);
      }
    }
    if (referral.hasVoucher) {
      addLine("voucher", referral.createdAt);
    }
  });

  return lines;
}

// ---------------------------------------------------------------------------
// Public dataset
// ---------------------------------------------------------------------------

export interface MockDataset {
  locations: Location[];
  payers: Payer[];
  bundles: Bundle[];
  views: DailyViewRecord[];
  referrals: Referral[];
  transactionBundleLines: TransactionBundleLine[];
  marketStats: Record<Category, CategoryMarketStats>;
  windowDays: number;
}

function build(): MockDataset {
  const rng = createRng(SEED);
  const locations = generateLocations(rng, 42);
  const payers = generatePayers(rng);
  const bundles = generateBundles(rng, locations, 96);
  const windowDays = 400;
  const views = generateDailyViews(rng, bundles, windowDays);

  const viewsByBundle = new Map<string, number>();
  views.forEach((v) => viewsByBundle.set(v.bundleId, (viewsByBundle.get(v.bundleId) ?? 0) + v.views));

  const marketStats = generateCategoryMarketStats(rng);
  const referrals = generateReferrals(rng, bundles, payers, viewsByBundle, marketStats);
  const transactionBundleLines = generateTransactionBundleLines(rng, bundles, referrals);

  return { locations, payers, bundles, views, referrals, transactionBundleLines, marketStats, windowDays };
}

// Generated once at module load — deterministic seed keeps it stable across reloads.
export const mockDataset: MockDataset = build();
