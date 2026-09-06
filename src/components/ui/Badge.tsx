import { cn } from "@/lib/utils";

type Tone = "sky" | "success" | "warning" | "danger" | "neutral" | "pink";

const toneClasses: Record<Tone, string> = {
  sky: "bg-sky-100 text-sky-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  danger: "bg-danger-100 text-danger-700",
  neutral: "bg-surface-muted text-foreground-muted",
  pink: "bg-pink-100 text-pink-500",
};

export function Badge({
  tone = "sky",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-bold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
