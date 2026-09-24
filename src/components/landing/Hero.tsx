// src/components/landing/Hero.tsx

import Link from "next/link";
import { Button } from ".././ui/button";

function AdirePattern() {
  return (
    <svg
      viewBox="0 0 360 360"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle cx="180" cy="180" r="150" fill="none" stroke="#2E3A8C" strokeWidth="1.5" opacity="0.25" />
      <circle cx="180" cy="180" r="110" fill="none" stroke="#2E3A8C" strokeWidth="1.5" opacity="0.35" />
      <circle cx="180" cy="180" r="70" fill="none" stroke="#E7A33E" strokeWidth="2" opacity="0.5" />
      <circle cx="180" cy="180" r="30" fill="#E7A33E" opacity="0.85" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = 180 + Math.cos(angle) * 150;
        const y = 180 + Math.sin(angle) * 150;
        return <circle key={i} cx={x} cy={y} r="4" fill="#2E3A8C" opacity="0.4" />;
      })}
    </svg>
  );
}

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
      <div>
        <h1 className="font-display text-4xl font-medium leading-tight text-ink sm:text-5xl lg:text-6xl">
          Read anything.
          <br />
          Understand it your way.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
          Upload a document, a lecture note, or a contract. KalaRead breaks it
          down using examples from your own world of work and play, then
          reads the summary back to you in Nigerian Pidgin whenever you'd
          rather listen than scroll.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
            <Link href="/register">Get started free</Link>
          </Button>
          <Link
            href="#features"
            className="text-sm font-medium text-ink/70 underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink"
          >
            See how it works
          </Link>
        </div>
        <p className="mt-4 text-sm text-ink/50">Free to start. No card needed.</p>
      </div>
      <div className="hidden aspect-square w-full max-w-sm justify-self-center lg:block">
        <AdirePattern />
      </div>
    </section>
  );
}