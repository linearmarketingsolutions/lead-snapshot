import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white shadow-card border border-surface-100",
        className
      )}
    >
      {children}
    </div>
  );
}
