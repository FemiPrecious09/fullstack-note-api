// src/app/onboarding/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/services/types";

const LEARNING_STYLES = [
  { value: "visual", label: "Visual — I like diagrams and examples" },
  { value: "reading", label: "Reading — I like clear written explanations" },
  { value: "audio", label: "Audio — I'd rather listen than read" },
  { value: "hands_on", label: "Hands-on — I learn by doing" },
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "pidgin", label: "Nigerian Pidgin" },
];

const initialForm: Profile = {
  occupation: "",
  industry: "",
  hobbies: "",
  current_learning: "",
  learning_style: "",
  goal: "",
  language_preference: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [form, setForm] = useState<Profile>(initialForm);

  function handleChange<K extends keyof Profile>(field: K, value: Profile[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    try {
      await updateProfile(form);
      router.push("/dashboard");
    } catch {
      // error is already captured in the store
    }
  }

  return (
    <div className="flex min-h-screen justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-3xl font-medium text-ink">
          Tell us about yourself
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          KalaRead uses this to explain new ideas in ways that make sense to
          you — through your own work, hobbies, and interests.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occupation">What do you do?</Label>
            <Input
              id="occupation"
              value={form.occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
              placeholder="e.g. Market trader, student, software developer"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="industry">What industry or field is that in?</Label>
            <Input
              id="industry"
              value={form.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              placeholder="e.g. Retail, education, tech"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hobbies">What do you enjoy outside work?</Label>
            <Input
              id="hobbies"
              value={form.hobbies}
              onChange={(e) => handleChange("hobbies", e.target.value)}
              placeholder="e.g. Football, cooking, music"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current_learning">What are you trying to learn right now?</Label>
            <Input
              id="current_learning"
              value={form.current_learning}
              onChange={(e) => handleChange("current_learning", e.target.value)}
              placeholder="e.g. Crypto basics, a new language, a course"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal">What's your goal with KalaRead?</Label>
            <Input
              id="goal"
              value={form.goal}
              onChange={(e) => handleChange("goal", e.target.value)}
              placeholder="e.g. Understand my course notes faster"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="learning_style">How do you learn best?</Label>
            <select
              id="learning_style"
              value={form.learning_style}
              onChange={(e) => handleChange("learning_style", e.target.value)}
              required
              className="h-10 w-full rounded-md border border-ink/20 bg-paper px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <option value="" disabled>
                Choose one
              </option>
              {LEARNING_STYLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="language_preference">
              Which language should we explain things in?
            </Label>
            <select
              id="language_preference"
              value={form.language_preference}
              onChange={(e) => handleChange("language_preference", e.target.value)}
              required
              className="h-10 w-full rounded-md border border-ink/20 bg-paper px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <option value="" disabled>
                Choose one
              </option>
              {LANGUAGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 bg-gold text-ink hover:bg-gold/90"
          >
            {isLoading ? "Saving..." : "Finish setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}