// src/components/layout/Navbar.tsx

import Link from "next/link";
import { Button } from ".././ui/button";

export function Navbar() {
  return (
    <header className="border-b border-ink/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl font-medium text-indigo">
          KalaRead
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            Log in
          </Link>
          <Button asChild className="bg-indigo hover:bg-indigo-dark text-paper">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}