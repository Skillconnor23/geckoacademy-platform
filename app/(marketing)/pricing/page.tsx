import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/landing/Section";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Section>
        <h1 className="text-center text-2xl font-bold text-[#3d4236] sm:text-3xl">
          Choose your path
        </h1>
        <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2 sm:gap-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
            <h2 className="text-xl font-semibold text-[#3d4236]">For Schools</h2>
            <p className="mt-2 text-sm text-[#5a5f57]">
              Platform licensing for schools.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 w-full bg-[#7daf41] hover:bg-[#6b9a39] text-white"
            >
              <Link href="/pricing-schools">View School Pricing</Link>
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
            <h2 className="text-xl font-semibold text-[#3d4236]">For Students</h2>
            <p className="mt-2 text-sm text-[#5a5f57]">
              Live classes and platform access.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 w-full bg-[#429ead] hover:bg-[#388694] text-white"
            >
              <Link href="/pricing-students">View Student Pricing</Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
