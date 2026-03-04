"use client";

import { cn } from "@/lib/utils";

interface BillingToggleProps {
  value: "monthly" | "annual";
  onChange: (value: "monthly" | "annual") => void;
  annualDisabled?: boolean;
  className?: string;
}

export function BillingToggle({
  value,
  onChange,
  annualDisabled = true,
  className,
}: BillingToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-slate-200 bg-slate-50 p-1",
        className
      )}
      role="tablist"
      aria-label="Billing period"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "monthly"}
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-colors",
          value === "monthly"
            ? "bg-white text-[#3d4236] shadow-sm"
            : "text-[#5a5f57] hover:text-[#3d4236]"
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "annual"}
        onClick={() => !annualDisabled && onChange("annual")}
        disabled={annualDisabled}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-colors",
          value === "annual"
            ? "bg-white text-[#3d4236] shadow-sm"
            : annualDisabled
              ? "cursor-not-allowed text-slate-400"
              : "text-[#5a5f57] hover:text-[#3d4236]"
        )}
      >
        Annual
        {annualDisabled && (
          <span className="ml-1.5 text-xs text-slate-400">(Coming soon)</span>
        )}
      </button>
    </div>
  );
}
