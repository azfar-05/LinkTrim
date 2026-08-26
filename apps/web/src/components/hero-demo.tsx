"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { CopyButton } from "@/components/copy-button";

const SAMPLES = [
  {
    long: "https://example.com/campaigns/summer-2026/landing?utm_source=newsletter",
    slug: "summer-launch",
  },
  {
    long: "https://checkout.stripe.com/c/pay/cs_live_a1b2c3d4e5f6g7h8i9",
    slug: "deal-page",
  },
  {
    long: "https://notion.so/team/Templates/Library/Onboarding-4f7b2c",
    slug: "onboarding",
  },
];

export function HeroDemo() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [staticMode, setStaticMode] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStaticMode(true);
    }
  }, []);

  useEffect(() => {
    if (staticMode) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % SAMPLES.length);
        setFading(false);
      }, 180);
    }, 2600);
    return () => clearInterval(timer);
  }, [staticMode]);

  const sample = SAMPLES[index];

  return (
    <div className="mx-auto mt-14 w-full max-w-2xl">
      <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
        See it in action
      </p>

      <div className="rounded-xl border bg-card p-4 shadow-sm ring-1 ring-foreground/10 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Long URL */}
          <p
            className={`min-w-0 flex-1 truncate rounded-lg border border-input bg-muted/40 px-3.5 py-2.5 font-mono text-xs text-muted-foreground transition-opacity duration-150 ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          >
            {sample.long}
          </p>

          <ArrowRight className="hidden size-4 shrink-0 text-chart-3 sm:block" aria-hidden />

          {/* Trimmed result */}
          <div
            className={`flex items-center justify-between gap-1.5 rounded-lg border border-chart-3/30 bg-chart-3/10 px-3 py-1.5 transition-opacity duration-150 sm:shrink-0 ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="whitespace-nowrap font-mono text-xs font-semibold">
              {origin && <>{new URL(origin).host}/<span className="text-chart-3">{sample.slug}</span></>}
            </span>
            <CopyButton value={origin ? `${origin}/${sample.slug}` : `/${sample.slug}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
