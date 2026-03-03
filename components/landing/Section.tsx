import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  /** Use "alt" for alternating light gray background */
  variant?: "default" | "alt";
  id?: string;
};

export function Section({ children, className, variant = "default", id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-12 sm:py-16",
        variant === "alt" && "bg-[#f5f6f4]",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
