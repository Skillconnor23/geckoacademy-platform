"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PricingCtaBannerProps {
  headline: string;
  subline?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Brand color for primary button */
  accentColor?: string;
}

export function PricingCtaBanner({
  headline,
  subline,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  accentColor = "#7daf41",
}: PricingCtaBannerProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-[#f5f6f4] px-6 py-14 text-center sm:px-10 sm:py-16">
      <h2 className="text-2xl font-semibold text-[#3d4236] sm:text-3xl">
        {headline}
      </h2>
      {subline && (
        <p className="mx-auto mt-3 max-w-xl text-[#5a5f57]">{subline}</p>
      )}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
        <Button
          asChild
          size="lg"
          className="rounded-full text-white"
          style={{ backgroundColor: accentColor }}
        >
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        {secondaryLabel && secondaryHref && (
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
