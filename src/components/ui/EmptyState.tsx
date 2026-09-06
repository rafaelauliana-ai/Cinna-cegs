export function EmptyState({
  icon = "📭",
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-control bg-surface-muted px-6 py-10 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="font-heading font-semibold text-foreground">{title}</p>
      {description && <p className="text-sm text-foreground-muted">{description}</p>}
    </div>
  );
}
