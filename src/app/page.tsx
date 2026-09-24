// src/app/page.tsx

import { Navbar } from "../components/layout/Navbar";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/feature";
import { CTASection } from "../components/landing/CTASection";
import { Footer } from "../components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}