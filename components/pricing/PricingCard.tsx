"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PricingTier } from "@/lib/pricing/tiers";
import { BRAND_COLORS } from "@/lib/pricing/tiers";
import { Check } from "lucide-react";

interface PricingCardProps {
  tier: PricingTier;
  /** Monthly vs annual — for future use; display only monthly for now */
  billingPeriod: "monthly" | "annual";
}

export function PricingCard({ tier, billingPeriod }: PricingCardProps) {
  const accentHex = BRAND_COLORS[tier.accentColor];
  // When annual billing is enabled, tier config can add priceAnnual and we'll use it here
  const price = tier.priceMonthly;

  return (
    <Card
      className="relative flex flex-col rounded-2xl border-slate-200 shadow-sm transition-shadow hover:shadow-md"
      style={{
        borderTopWidth: 3,
        borderTopColor: accentHex,
      }}
    >
      {tier.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: accentHex }}
        >
          {tier.badge}
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-[#3d4236]">{tier.name}</CardTitle>
        <CardDescription className="text-[#5a5f57]">
          {tier.description}
        </CardDescription>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-[#3d4236]">
            ${price ?? tier.priceMonthly}
          </span>
          <span className="text-sm text-[#5a5f57]">{tier.priceNote}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {tier.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2 text-sm">
            <span
              className="mt-0.5 shrink-0 rounded-full p-0.5"
              style={{ color: accentHex }}
            >
              <Check className="h-4 w-4" />
            </span>
            <span className="text-[#5a5f57]">{feature}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-4">
        {/* TODO: When Stripe is wired, trigger checkout with tier.stripePriceId instead of linking */}
        <Button
          asChild
          size="lg"
          className="w-full rounded-full hover:opacity-90"
          style={{
            backgroundColor: accentHex,
          }}
        >
          <Link href={tier.ctaHref}>{tier.ctaLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
