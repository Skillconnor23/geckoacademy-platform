/**
 * Gecko Academy enrollment class options.
 * Levels: G (Beginner Low), E (Beginner High), C (Intermediate Low), K (Intermediate High), O (Advanced).
 * Classes run Saturday and Sunday. Each level has multiple time slots.
 * Students choose ONE class time. Stripe one-time payment per enrollment.
 * Placement test results (G, E, C, K, O) map directly to these levels.
 */

import type { GeckoLevel } from '@/lib/level-check/questions';

export type GeckoEnrollLevel = GeckoLevel; // 'G' | 'E' | 'C' | 'K' | 'O'

export interface GeckoLevelMeta {
  letter: GeckoEnrollLevel;
  nameEn: string;
  nameMn: string;
  descriptionEn: string;
  descriptionMn: string;
}

/** Gecko curriculum level metadata for enrollment UI. */
export const GEKO_LEVEL_META: Record<GeckoEnrollLevel, GeckoLevelMeta> = {
  G: {
    letter: 'G',
    nameEn: 'Beginner Low',
    nameMn: 'Эхлэгч доод',
    descriptionEn: 'Building foundations — basic vocabulary, simple sentences, everyday phrases.',
    descriptionMn: 'Суурийг босгох — үндсэн үгс, энгийн өгүүлбэр, өдөр тутмын хэллэг.',
  },
  E: {
    letter: 'E',
    nameEn: 'Beginner High',
    nameMn: 'Эхлэгч дээд',
    descriptionEn: 'Solid base — essential grammar, common expressions, simple conversations.',
    descriptionMn: 'Бат суурь — чухал дүрэм, түгээмэл хэллэг, энгийн яриа.',
  },
  C: {
    letter: 'C',
    nameEn: 'Intermediate Low',
    nameMn: 'Дунд доод',
    descriptionEn: 'Everyday fluency — natural expressions, familiar topics, confident speaking.',
    descriptionMn: 'Өдөр тутмын ур чадвар — байгалийн хэллэг, танил сэдэв, итгэлтэй ярих.',
  },
  K: {
    letter: 'K',
    nameEn: 'Intermediate High',
    nameMn: 'Дунд дээд',
    descriptionEn: 'Strong skills — richer vocabulary, abstract ideas, nuanced expression.',
    descriptionMn: 'Чадварлаг — баялаг үгс, хийсвэр санаа, нарийн сэтгэгдэл илэрхийлэх.',
  },
  O: {
    letter: 'O',
    nameEn: 'Advanced',
    nameMn: 'Дэвшилтэт',
    descriptionEn: 'Professional-ready — fluency, precision, demanding situations.',
    descriptionMn: 'Мэргэжлийн түвшин — ур чадвар, нарийвчлал, өндөр шаардлагатай нөхцөл.',
  },
};

export interface GeckoClassOption {
  id: string;
  /** Level letter: G | E | C | K | O */
  level: GeckoEnrollLevel;
  /** Display time e.g. "10:00" (in scheduleTimezone) */
  time: string;
  /** IANA timezone e.g. "Asia/Ulaanbaatar" */
  timezone: string;
  /** Days e.g. ["Saturday", "Sunday"] */
  days: string[];
  /** Price in cents (e.g. 6900 = $69.00) */
  priceCents: number;
  /** Currency code */
  currency: string;
  /** Stripe Price ID for one-time payment */
  stripePriceId: string | null;
  /** Optional: edu_classes.id to enroll into (when payment succeeds) */
  eduClassId: string | null;
  /** Seats remaining; null if unknown */
  seatsRemaining: number | null;
}

function envPrice(key: string): string | null {
  return (process.env[key] as string) ?? null;
}

/**
 * All Gecko Academy enrollment class options.
 * Update stripePriceId and eduClassId when Stripe/DB are configured.
 */
export const GECKO_ENROLL_CLASSES: GeckoClassOption[] = [
  // G Level — Beginner Low
  { id: 'g-sat-10', level: 'G', time: '10:00', timezone: 'Asia/Ulaanbaatar', days: ['Saturday', 'Sunday'], priceCents: 6900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_G') ?? envPrice('STRIPE_PRICE_BEGINNER'), eduClassId: null, seatsRemaining: 8 },
  { id: 'g-sat-14', level: 'G', time: '14:00', timezone: 'Asia/Ulaanbaatar', days: ['Saturday', 'Sunday'], priceCents: 6900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_G') ?? envPrice('STRIPE_PRICE_BEGINNER'), eduClassId: null, seatsRemaining: 6 },
  { id: 'g-sun-10', level: 'G', time: '10:00', timezone: 'Asia/Ulaanbaatar', days: ['Sunday'], priceCents: 6900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_G') ?? envPrice('STRIPE_PRICE_BEGINNER'), eduClassId: null, seatsRemaining: 10 },
  // E Level — Beginner High
  { id: 'e-sat-10', level: 'E', time: '10:00', timezone: 'Asia/Ulaanbaatar', days: ['Saturday', 'Sunday'], priceCents: 6900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_E') ?? envPrice('STRIPE_PRICE_BEGINNER'), eduClassId: null, seatsRemaining: 7 },
  { id: 'e-sat-14', level: 'E', time: '14:00', timezone: 'Asia/Ulaanbaatar', days: ['Sunday'], priceCents: 6900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_E') ?? envPrice('STRIPE_PRICE_BEGINNER'), eduClassId: null, seatsRemaining: 9 },
  // C Level — Intermediate Low
  { id: 'c-sat-09', level: 'C', time: '09:00', timezone: 'Asia/Ulaanbaatar', days: ['Saturday', 'Sunday'], priceCents: 7900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_C') ?? envPrice('STRIPE_PRICE_INTERMEDIATE'), eduClassId: null, seatsRemaining: 5 },
  { id: 'c-sat-13', level: 'C', time: '13:00', timezone: 'Asia/Ulaanbaatar', days: ['Saturday', 'Sunday'], priceCents: 7900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_C') ?? envPrice('STRIPE_PRICE_INTERMEDIATE'), eduClassId: null, seatsRemaining: 7 },
  { id: 'c-sun-14', level: 'C', time: '14:00', timezone: 'Asia/Ulaanbaatar', days: ['Sunday'], priceCents: 7900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_C') ?? envPrice('STRIPE_PRICE_INTERMEDIATE'), eduClassId: null, seatsRemaining: 6 },
  // K Level — Intermediate High
  { id: 'k-sat-11', level: 'K', time: '11:00', timezone: 'Asia/Ulaanbaatar', days: ['Saturday', 'Sunday'], priceCents: 7900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_K') ?? envPrice('STRIPE_PRICE_INTERMEDIATE'), eduClassId: null, seatsRemaining: 4 },
  { id: 'k-sun-10', level: 'K', time: '10:00', timezone: 'Asia/Ulaanbaatar', days: ['Sunday'], priceCents: 7900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_K') ?? envPrice('STRIPE_PRICE_INTERMEDIATE'), eduClassId: null, seatsRemaining: 8 },
  // O Level — Advanced
  { id: 'o-sat-11', level: 'O', time: '11:00', timezone: 'Asia/Ulaanbaatar', days: ['Saturday', 'Sunday'], priceCents: 8900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_O') ?? envPrice('STRIPE_PRICE_ADVANCED'), eduClassId: null, seatsRemaining: 4 },
  { id: 'o-sun-10', level: 'O', time: '10:00', timezone: 'Asia/Ulaanbaatar', days: ['Sunday'], priceCents: 8900, currency: 'usd', stripePriceId: envPrice('STRIPE_PRICE_O') ?? envPrice('STRIPE_PRICE_ADVANCED'), eduClassId: null, seatsRemaining: 6 },
];

export function getClassesByLevel(level: GeckoEnrollLevel): GeckoClassOption[] {
  return GECKO_ENROLL_CLASSES.filter((c) => c.level === level);
}

export function getClassById(id: string): GeckoClassOption | undefined {
  return GECKO_ENROLL_CLASSES.find((c) => c.id === id);
}
