import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = "Loading..." }: SpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-8", className)}>
      <div className="h-10 w-10 rounded-full border-[3px] border-surface-200 border-t-brand-500 animate-spin-slow" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
