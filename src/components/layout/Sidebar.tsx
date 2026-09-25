// src/components/layout/Sidebar.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, StickyNote, User, LogOut, FileText, PanelLeftClose } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useChatRefreshStore } from "@/store/chatRefreshStore";
import { getRecentConversations } from "@/services/api/chat";
import { cn } from "@/lib/util";
import type { RecentConversation } from "@/services/api/chat";

const NAV_ITEMS = [
  { label: "Library", href: "/dashboard#documents", icon: LayoutGrid },
  { label: "Notes", href: "/dashboard#notes", icon: StickyNote },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

interface SidebarProps {
  onNavigate?: () => void;
  onCollapse?: () => void;
}

export function Sidebar({ onNavigate, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const profile = useAuthStore((state) => state.profile);
  const refreshKey = useChatRefreshStore((state) => state.refreshKey);

  const [recentChats, setRecentChats] = useState<RecentConversation[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRecentConversations(8)
      .then((data) => {
        if (!cancelled) setRecentChats(data);
      })
      .catch(() => {
        if (!cancelled) setRecentChats([]);
      })
      .finally(() => {
        if (!cancelled) setChatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, refreshKey]);

  async function handleLogout() {
    await logout();
    onNavigate?.();
    router.push("/login");
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-ink/10 bg-paper-dim px-4 py-6">
      <div className="flex items-center justify-between px-2">
        <Link href="/dashboard" onClick={onNavigate} className="font-display text-xl font-medium text-indigo">
          KalaRead
        </Link>
        {onCollapse && (
          <button
            onClick={onCollapse}
            aria-label="Collapse sidebar"
            className="text-ink/40 transition-colors hover:text-ink"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="mt-8 flex flex-col gap-1">
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

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <p className="px-3 text-xs font-medium uppercase tracking-wide text-ink/40">Recent chats</p>
        <div className="mt-2 flex-1 overflow-y-auto">
          {chatsLoading ? (
            <p className="px-3 py-2 text-xs text-ink/40">Loading...</p>
          ) : recentChats.length === 0 ? (
            <p className="px-3 py-2 text-xs text-ink/40">No conversations yet.</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {recentChats.map((chat) => {
                const href = `/dashboard/${chat.type}/${chat.id}`;
                const Icon = chat.type === "note" ? StickyNote : FileText;
                const isActive = pathname === href;
                return (
                  <Link
                    key={`${chat.type}-${chat.id}`}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive ? "bg-indigo/10 text-indigo" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{chat.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-ink/10 pt-4">
        {profile && <p className="truncate px-3 pb-2 text-xs text-ink/50">{profile.occupation}</p>}
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