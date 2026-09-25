// src/hooks/useSpeech.ts

"use client";

import { useState, useRef, useCallback, useEffect } from "react";

function stripMarkdown(md: string): string {
  return md
    .replace(/\|/g, " ")
    .replace(/^-{3,}$/gm, "")
    .replace(/[*_`#]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\n{2,}/g, ". ")
    .trim();
}

export function useSpeech(text: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggle = useCallback(() => {
    if (!text) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    // Prefer a Nigerian English voice if the browser happens to have
    // one installed; otherwise fall back to any English voice.
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang === "en-NG") ?? voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [text, isPlaying]);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  return { isPlaying, toggle, isSupported };
}