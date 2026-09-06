import { cn } from "@/lib/utils";

type Tone = "sky" | "success" | "warning" | "danger" | "pink";

const toneClasses: Record<Tone, string> = {
  sky: "bg-gradient-to-br from-sky-400 to-sky-600",
  success: "bg-gradient-to-br from-success-500 to-sky-600",
  warning: "bg-gradient-to-br from-warning-500 to-warning-700",
  danger: "bg-gradient-to-br from-danger-500 to-danger-700",
  pink: "bg-gradient-to-br from-pink-500 to-sky-500",
};

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "sky",
  tourId,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: Tone;
  tourId?: string;
}) {
  return (
    <div
      data-tour-id={tourId}
      className={cn(
        "rounded-card p-4 text-white shadow-soft flex flex-col gap-1",
        toneClasses[tone],
      )}
    >
      <span className="flex items-center gap-1.5 text-sm font-semibold opacity-90">
        {icon}
        {label}
      </span>
      <span className="font-heading text-2xl font-bold">{value}</span>
      {hint && <span className="text-xs opacity-80">{hint}</span>}
    </div>
  );
}
