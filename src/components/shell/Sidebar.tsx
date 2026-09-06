"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_ITEMS, NAV_ITEMS_SECONDARY, NAV_ITEM_ADMIN, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      data-tour-id={item.tourId}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-control px-4 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "bg-white text-sky-700 shadow-softer"
          : "text-white/85 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}

export function Sidebar({
  isMaster,
  onNavigate,
}: {
  isMaster: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto bg-gradient-to-b from-sky-600 to-sky-700 p-4">
      <div className="mb-3 flex items-center gap-2 px-2 py-2">
        <span className="text-2xl">☁️</span>
        <span className="font-heading text-lg font-extrabold text-white">Cinnamon Cegs</span>
      </div>

      {isMaster && (
        <>
          <NavLink item={NAV_ITEM_ADMIN} onNavigate={onNavigate} />
          <div className="my-2 h-px bg-white/15" />
        </>
      )}

      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} onNavigate={onNavigate} />
      ))}

      <div className="my-2 h-px bg-white/15" />

      {NAV_ITEMS_SECONDARY.map((item) => (
        <NavLink key={item.href} item={item} onNavigate={onNavigate} />
      ))}

      <button
        onClick={handleLogout}
        className="mt-1 flex items-center gap-3 rounded-control px-4 py-2.5 text-left text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut size={18} />
        Sair
      </button>
    </nav>
  );
}
