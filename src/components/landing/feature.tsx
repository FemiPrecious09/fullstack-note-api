// src/components/landing/Features.tsx

import { Upload, MessageCircle, Volume2, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Upload,
    title: "Upload anything",
    description:
      "Drop in a PDF, a scanned note, or a lecture handout. KalaRead reads it in seconds, however messy the file.",
  },
  {
    icon: MessageCircle,
    title: "Ask it questions",
    description:
      "Stuck on a sentence or a clause? Ask KalaRead in plain language and get an answer that actually explains, not just repeats.",
  },
  {
    icon: Volume2,
    title: "Hear it in Pidgin",
    description:
      "Prefer to listen than read line by line? Play the summary back in Nigerian Pidgin, at your own pace.",
  },
  {
    icon: Sparkles,
    title: "Explained your way",
    description:
      "Tell KalaRead what you do and what you love, and it explains new ideas using examples from your world — market trading, football, whatever fits.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-ink/10 bg-paper-dim">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
          How it works
        </h2>
        <div className="mt-10 grid divide-y divide-ink/10 border-t border-ink/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-3 py-8 pr-8 sm:px-8 sm:first:pl-0">
              <Icon className="h-6 w-6 text-indigo" strokeWidth={1.75} />
              <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
              <p className="text-sm leading-relaxed text-ink/65">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}