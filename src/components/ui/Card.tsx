import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card bg-surface shadow-soft overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  icon,
  title,
  actions,
}: {
  className?: string;
  icon?: React.ReactNode;
  title: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 bg-gradient-to-r from-sky-400 to-sky-500 px-5 py-4 text-white",
        className,
      )}
    >
      <h2 className="font-heading text-lg font-bold flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {actions}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
