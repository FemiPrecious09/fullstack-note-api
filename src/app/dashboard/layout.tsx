"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, PanelLeftOpen } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile) {
      router.replace("/onboarding");
    }
  }, [isInitialized, user, profile, router]);

  if (!isInitialized || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper">
      {desktopSidebarOpen && (
        <div className="hidden lg:flex">
          <Sidebar onCollapse={() => setDesktopSidebarOpen(false)} />
        </div>
      )}

      {!desktopSidebarOpen && (
        <button
          onClick={() => setDesktopSidebarOpen(true)}
          aria-label="Open sidebar"
          className="fixed left-3 top-4 z-40 hidden rounded-md p-1.5 text-ink/50 hover:bg-ink/5 hover:text-ink lg:block"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 lg:hidden">
          <button onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5 text-ink" />
          </button>
          <span className="font-display text-lg font-medium text-indigo">KalaRead</span>
          <div className="w-5" />
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="relative w-60">
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 text-ink/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            className="flex-1 bg-ink/30"
            aria-label="Close menu overlay"
            onClick={() => setMobileNavOpen(false)}
          />
        </div>
      )}
    </div>
  );
}