export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex items-center gap-2">
        <span className="text-3xl">☁️</span>
        <h1 className="font-heading text-2xl font-extrabold text-sky-700">
          Cinnamon Cegs
        </h1>
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="text-xs text-foreground-muted">feito com 💙 por Cinnamon Cegs</p>
    </div>
  );
}
