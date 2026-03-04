"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PricingTier } from "@/lib/pricing/tiers";
import { Check } from "lucide-react";

interface PricingCompareTableProps {
  tiers: PricingTier[];
  /** Optional: limit to first N features for a simpler table */
  maxFeatures?: number;
}

export function PricingCompareTable({
  tiers,
  maxFeatures,
}: PricingCompareTableProps) {
  const allFeatures = Array.from(
    new Set(tiers.flatMap((t) => t.features))
  ).slice(0, maxFeatures);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 bg-slate-50/80">
            <TableHead className="w-[220px] text-[#3d4236]">Feature</TableHead>
            {tiers.map((tier) => (
              <TableHead
                key={tier.id}
                className="text-center font-medium text-[#3d4236]"
              >
                {tier.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allFeatures.map((feature) => (
            <TableRow key={feature} className="border-slate-200">
              <TableCell className="text-[#5a5f57]">{feature}</TableCell>
              {tiers.map((tier) => (
                <TableCell key={tier.id} className="text-center">
                  {tier.features.includes(feature) ? (
                    <Check className="mx-auto h-5 w-5 text-[#7daf41]" />
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
