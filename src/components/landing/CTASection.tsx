// src/components/landing/CTASection.tsx

import Link from "next/link";
import { Button } from ".././ui/button";

export function CTASection() {
  return (
    <section className="bg-indigo-dark">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-medium text-paper sm:text-4xl">
          Your next document doesn't have to be a struggle.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-paper/70">
          Join learners across Nigeria turning dense documents into something
          they actually understand.
        </p>
        <Button asChild size="lg" className="mt-8 bg-gold text-ink hover:bg-gold/90">
          <Link href="/register">Create your free account</Link>
        </Button>
      </div>
    </section>
  );
}