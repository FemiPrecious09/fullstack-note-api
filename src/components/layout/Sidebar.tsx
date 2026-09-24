// src/components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, StickyNote, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/util";

const NAV_ITEMS = [
  { label: "Library", href: "/dashboard#documents", icon: LayoutGrid },
  { label: "Notes", href: "/dashboard#notes", icon: StickyNote },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const profile = useAuthStore((state) => state.profile);

  async function handleLogout() {
    await logout();
    onNavigate?.();
    router.push("/login");
  }

  return (
    <aside className="flex w-60 flex-col border-r border-ink/10 bg-paper-dim px-4 py-6">
      <Link href="/dashboard" onClick={onNavigate} className="px-2 font-display text-xl font-medium text-indigo">
        KalaRead
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href.split("#")[0];
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-indigo text-paper" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink/10 pt-4">
        {profile && (
          <p className="truncate px-3 pb-2 text-xs text-ink/50">{profile.occupation}</p>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </aside>
  );
}