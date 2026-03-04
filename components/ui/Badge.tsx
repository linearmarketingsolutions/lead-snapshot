import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
};

const variantClasses = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-600 border border-red-200",
  info: "bg-brand-50 text-brand-700 border border-brand-200",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
