import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/landing/Section";
import { schoolTiers } from "@/lib/pricing/tiers";
import { PricingCard } from "@/components/pricing/PricingCard";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PricingCompareTable } from "@/components/pricing/PricingCompareTable";
import { PricingFAQ, type FAQItem } from "@/components/pricing/PricingFAQ";
import { PricingCtaBanner } from "@/components/pricing/PricingCtaBanner";
import { SCHOOLS_DEMO_HREF } from "@/lib/routes";
import { SchoolsPricingPageClient } from "./SchoolsPricingPageClient";

const SCHOOL_FAQS: FAQItem[] = [
  {
    id: "teachers",
    question: "Do you provide native English teachers?",
    answer:
      "Yes. GeckoTeach includes optional native English teachers who work with your students on our platform. You get both the platform and teaching support — curriculum, classes, and tracking in one place.",
  },
  {
    id: "demo",
    question: "How do I get a custom quote?",
    answer:
      "Book a demo and we’ll walk you through the platform, discuss your student count and goals, and provide a tailored quote. Pricing depends on seats and whether you add Gecko teachers.",
  },
  {
    id: "platform-only",
    question: "Can we use only the platform with our own teachers?",
    answer:
      "Yes. The Platform Only tier gives you the full GeckoTeach platform — placement tests, classroom management, teacher dashboard, recordings, and analytics — for your own teachers to use.",
  },
  {
    id: "training",
    question: "Is teacher training included?",
    answer:
      "Full Program Partner plans include teacher training and academic reporting. Platform + Teachers and Platform Only can add training as an optional service. Ask during your demo.",
  },
];

export default function SchoolsPricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <Section className="pt-12 pb-8 sm:pt-16 sm:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#3d4236] sm:text-4xl md:text-5xl">
            GeckoTeach — Pricing for Schools
          </h1>
          <p className="mt-4 text-lg text-[#5a5f57]">
            Native English teachers and a full platform for your school. Scale
            from platform-only to a full program partnership.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#7daf41] text-white hover:bg-[#6b9a39]"
            >
              <Link href={SCHOOLS_DEMO_HREF}>Book a Demo</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-[#429ead] bg-white text-[#429ead] hover:bg-[#429ead]/5"
            >
              <Link href="/pricing">For students? View Gecko Academy pricing</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Billing toggle + Cards */}
      <SchoolsPricingPageClient tiers={schoolTiers} />

      {/* Compare plans */}
      <Section variant="alt" className="py-12 sm:py-16">
        <h2 className="text-center text-2xl font-semibold text-[#3d4236] sm:text-3xl">
          Compare plans
        </h2>
        <div className="mt-8">
          <PricingCompareTable tiers={schoolTiers} />
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-12 sm:py-16">
        <h2 className="text-center text-2xl font-semibold text-[#3d4236] sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mx-auto mt-10 max-w-2xl">
          <PricingFAQ items={SCHOOL_FAQS} />
        </div>
      </Section>

      {/* Final CTA */}
      <Section variant="alt" className="py-12 sm:py-16">
        <PricingCtaBanner
          headline="Ready to bring Gecko to your school?"
          subline="Book a demo to see the platform and get a custom quote for your students."
          primaryLabel="Book a Demo"
          primaryHref={SCHOOLS_DEMO_HREF}
          secondaryLabel="Contact us"
          secondaryHref="/contact"
          accentColor="#7daf41"
        />
      </Section>
    </div>
  );
}
