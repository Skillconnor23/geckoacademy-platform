import { cn } from "@/lib/utils";

type MarketingSectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

/** Marketing section: white bg, max-w-6xl, consistent spacing */
export function MarketingSection({ children, className, id }: MarketingSectionProps) {
  return (
    <section
      id={id}
      className={cn("bg-white py-16 sm:py-20", className)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
