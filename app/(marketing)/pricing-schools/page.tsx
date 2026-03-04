import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/landing/Section";

export default function PricingSchoolsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#3d4236] sm:text-4xl">
              Gecko for Schools
            </h1>
            <p className="mt-6 text-base text-[#5a5f57] sm:text-lg">
              Pricing depends on the number of student seats and optional teacher add-on. Contact us for a custom quote.
            </p>
            <ul className="mt-6 space-y-2 text-left sm:mx-auto sm:max-w-sm">
              <li className="flex items-center gap-2 text-[#5a5f57]">
                <span className="text-[#7daf41]">•</span>
                Number of student seats
              </li>
              <li className="flex items-center gap-2 text-[#5a5f57]">
                <span className="text-[#7daf41]">•</span>
                Optional teacher add-on
              </li>
            </ul>
            <Button
              asChild
              size="lg"
              className="mt-10 bg-[#7daf41] hover:bg-[#6b9a39] text-white"
            >
              <Link href="/contact">Contact us for pricing</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
