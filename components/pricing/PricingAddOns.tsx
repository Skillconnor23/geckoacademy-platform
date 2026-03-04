"use client";

import type { AddOn } from "@/lib/pricing/tiers";
import { cn } from "@/lib/utils";

interface PricingAddOnsProps {
  addOns: AddOn[];
  className?: string;
}

export function PricingAddOns({ addOns, className }: PricingAddOnsProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {addOns.map((addon) => (
        <div
          key={addon.id}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
        >
          <p className="font-medium text-[#3d4236]">{addon.name}</p>
          <p className="mt-1 text-sm text-[#5a5f57]">
            {addon.priceMonthly != null && (
              <>${addon.priceMonthly}/mo</>
            )}
            {addon.priceOneTime != null && (
              <>${addon.priceOneTime} {addon.priceNote}</>
            )}
            {addon.priceMonthly == null && addon.priceOneTime == null && (
              addon.priceNote
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
