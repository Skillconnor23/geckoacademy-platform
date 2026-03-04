/**
 * Central pricing config for Gecko Academy (students) and GeckoTeach (schools).
 * Update tiers here; pages consume this data. Stripe price IDs go in when ready.
 */

export const BRAND_COLORS = {
  primary: "#7daf41",
  teal: "#429ead",
  rust: "#b64b29",
  gold: "#ffaa00",
} as const;

export type BrandAccent = keyof typeof BRAND_COLORS;

export interface PricingTier {
  id: string;
  name: string;
  priceMonthly: number;
  priceNote: string;
  description: string;
  /** e.g. "Most Popular" */
  badge?: string;
  accentColor: BrandAccent;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  /** Stripe Price ID — set when Stripe is wired up */
  stripePriceId: string | null;
}

export interface AddOn {
  id: string;
  name: string;
  priceMonthly?: number;
  priceOneTime?: number;
  priceNote: string;
}

// ——— Gecko Academy (Students) ———

export const studentTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 69,
    priceNote: "≈ 220,000 MNT",
    description: "Group Learning",
    accentColor: "teal",
    features: [
      "2 live classes/week (50 min)",
      "8–12 students per class",
      "Platform access",
      "Recordings",
      "Homework + quizzes",
      "Teacher feedback",
    ],
    ctaLabel: "Start Free Trial",
    ctaHref: "/trial",
    stripePriceId: null,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 129,
    priceNote: "per month",
    description: "Intensive Learning",
    badge: "Most Popular",
    accentColor: "primary",
    features: [
      "Everything in Starter",
      "3–4 classes/week",
      "Smaller groups (6–8 students)",
      "Speaking practice sessions",
      "Priority feedback",
      "Advanced conversation lessons",
    ],
    ctaLabel: "Start Free Trial",
    ctaHref: "/trial",
    stripePriceId: null,
  },
  {
    id: "elite",
    name: "Elite",
    priceMonthly: 299,
    priceNote: "per month",
    description: "Private Coaching",
    accentColor: "gold",
    features: [
      "1 private lesson/week",
      "Group classes included",
      "Personal learning plan",
      "Pronunciation coaching",
      "Interview prep",
      "Direct teacher support",
    ],
    ctaLabel: "Start Free Trial",
    ctaHref: "/trial",
    stripePriceId: null,
  },
];

export const studentAddOns: AddOn[] = [
  {
    id: "pronunciation-lab",
    name: "Pronunciation Lab",
    priceMonthly: 19,
    priceNote: "/mo",
  },
  {
    id: "exam-prep",
    name: "Exam Prep Pack",
    priceMonthly: 49,
    priceNote: "/mo",
  },
  {
    id: "tutoring-session",
    name: "1-on-1 Tutoring Session",
    priceOneTime: 40,
    priceNote: "per session",
  },
];

// ——— GeckoTeach (Schools) ———

export const schoolTiers: PricingTier[] = [
  {
    id: "platform-only",
    name: "Platform Only",
    priceMonthly: 99,
    priceNote: "per school / month",
    description: "Self-serve platform",
    accentColor: "teal",
    features: [
      "GeckoTeach platform",
      "Placement tests",
      "Classroom management",
      "Teacher dashboard",
      "Recordings & assignments",
      "Analytics",
    ],
    ctaLabel: "Book a Demo",
    ctaHref: "/contact",
    stripePriceId: null,
  },
  {
    id: "platform-teachers",
    name: "Platform + Teachers",
    priceMonthly: 499,
    priceNote: "per month",
    description: "Platform + teaching support",
    badge: "Most Popular",
    accentColor: "primary",
    features: [
      "Platform + up to 2 native teachers",
      "Weekly classes",
      "Curriculum included",
      "Student tracking",
      "Add a teacher: $150–$200/month (contact for quote)",
    ],
    ctaLabel: "Book a Demo",
    ctaHref: "/contact",
    stripePriceId: null,
  },
  {
    id: "full-program",
    name: "Full Program Partner",
    priceMonthly: 1500,
    priceNote: "+ / month",
    description: "Full deployment",
    accentColor: "rust",
    features: [
      "Full program deployment",
      "Multiple teachers",
      "Curriculum licensing",
      "Placement testing",
      "Teacher training",
      "Academic reporting",
    ],
    ctaLabel: "Book a Demo",
    ctaHref: "/contact",
    stripePriceId: null,
  },
];
