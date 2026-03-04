import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/landing/Section";
import { studentTiers, studentAddOns } from "@/lib/pricing/tiers";
import { PricingCard } from "@/components/pricing/PricingCard";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PricingCompareTable } from "@/components/pricing/PricingCompareTable";
import { PricingAddOns } from "@/components/pricing/PricingAddOns";
import { PricingFAQ, type FAQItem } from "@/components/pricing/PricingFAQ";
import { PricingCtaBanner } from "@/components/pricing/PricingCtaBanner";
import { STUDENT_TRIAL_HREF } from "@/lib/routes";
import { PricingPageClient } from "./PricingPageClient";

const STUDENT_FAQS: FAQItem[] = [
  {
    id: "schedule",
    question: "What does the schedule look like?",
    answer:
      "Classes are scheduled on weekday evenings and weekends so they work around school and work. We offer weekend-friendly options so you can learn without missing other commitments.",
  },
  {
    id: "trial",
    question: "How does the free trial work?",
    answer:
      "Start with a short free trial to meet your teacher and try the platform. No payment is required upfront. If you like it, you can choose a plan and continue.",
  },
  {
    id: "cancel",
    question: "Can I cancel or change plans?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel your plan at any time. We’ll prorate or refund as needed so you’re never overcharged.",
  },
  {
    id: "level",
    question: "How do you place me in the right level?",
    answer:
      "We use a short placement process (and sometimes a quick conversation with a teacher) to put you in a group that matches your level and goals.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <Section className="pt-12 pb-8 sm:pt-16 sm:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#3d4236] sm:text-4xl md:text-5xl">
            Gecko Academy — Pricing
          </h1>
          <p className="mt-4 text-lg text-[#5a5f57]">
            Live English classes with native-level teachers, weekend-friendly
            schedules, and a platform built for real progress.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#7daf41] text-white hover:bg-[#6b9a39]"
            >
              <Link href={STUDENT_TRIAL_HREF}>Start Free Trial</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-[#429ead] bg-white text-[#429ead] hover:bg-[#429ead]/5"
            >
              <Link href="/schools/pricing">For schools? View GeckoTeach pricing</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Billing toggle + Cards (client for toggle state) */}
      <PricingPageClient tiers={studentTiers} />

      {/* Compare plans */}
      <Section variant="alt" className="py-12 sm:py-16">
        <h2 className="text-center text-2xl font-semibold text-[#3d4236] sm:text-3xl">
          Compare plans
        </h2>
        <div className="mt-8">
          <PricingCompareTable tiers={studentTiers} />
        </div>
      </Section>

      {/* Add-ons */}
      <Section className="py-12 sm:py-16">
        <h2 className="text-center text-2xl font-semibold text-[#3d4236] sm:text-3xl">
          Add-ons
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[#5a5f57]">
          Optional extras to deepen your learning. (Not yet available for purchase — coming with Stripe.)
        </p>
        <div className="mt-8">
          <PricingAddOns addOns={studentAddOns} />
        </div>
      </Section>

      {/* FAQ */}
      <Section variant="alt" className="py-12 sm:py-16">
        <h2 className="text-center text-2xl font-semibold text-[#3d4236] sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mx-auto mt-10 max-w-2xl">
          <PricingFAQ items={STUDENT_FAQS} />
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="py-12 sm:py-16">
        <PricingCtaBanner
          headline="Start learning with Gecko Academy"
          subline="Join a small group, get live feedback, and use the platform on your schedule."
          primaryLabel="Start Free Trial"
          primaryHref={STUDENT_TRIAL_HREF}
          secondaryLabel="Contact us"
          secondaryHref="/contact"
          accentColor="#7daf41"
        />
      </Section>
    </div>
  );
}
