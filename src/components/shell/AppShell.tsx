"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppShell({
  isMaster,
  greeting,
  children,
}: {
  isMaster: boolean;
  greeting: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa (desktop) */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <Sidebar isMaster={isMaster} />
        </div>
      </aside>

      {/* Sidebar em drawer (mobile) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">
            <Sidebar isMaster={isMaster} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          data-tour-id="topbar"
          className="sticky top-0 z-30 flex items-center gap-3 border-b border-sky-100 bg-white/90 px-4 py-3 backdrop-blur"
        >
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-control p-2 text-sky-700 hover:bg-sky-100 lg:hidden"
            aria-label="Abrir menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <p className="font-heading text-base font-bold text-sky-800 sm:text-lg">
            {greeting}
          </p>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
