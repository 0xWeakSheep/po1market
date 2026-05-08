"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ApiSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (getPrefersReducedMotion()) return;

    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const ctx = gsap.context(() => {
      gsap.from(card, {
        y: 80,
        opacity: 0,
        scale: 0.94,
        rotateX: 10,
        rotateY: -10,
        transformOrigin: "center bottom",
        ease: "power3.out",
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="api"
      className="relative mx-auto w-full max-w-[900px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div ref={cardRef} style={{ perspective: "1000px" }}>
        <div className="rounded-[30px] border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-slate-500">
            [ API ]
          </p>
          <p className="mt-3 font-mono text-sm text-white">
            POST /api/v1/recommendations
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300/85">
            The Next app serializes the form, calls the endpoint from the browser, and renders the JSON response — no ranking logic in the frontend bundle.
          </p>
        </div>
      </div>
    </section>
  );
}
