import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string | undefined;
  error?: string | undefined;
  icon?: string | undefined;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-500 tracking-wide uppercase"
          >
            {icon && <span className="mr-1.5">{icon}</span>}
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3",
            "text-sm text-slate-800 placeholder:text-slate-400",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:bg-white",
            error && "border-red-300 focus:ring-red-400",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
