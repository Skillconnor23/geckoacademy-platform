import { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function FeatureCard({ icon: Icon, title, description, children }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7daf41]/10">
          <Icon className="h-5 w-5 text-[#7daf41]" />
        </div>
      )}
      <h3 className="mt-4 font-semibold text-[#3d4236]">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[#5a5f57]">{description}</p>
      )}
      {children}
    </div>
  );
}
