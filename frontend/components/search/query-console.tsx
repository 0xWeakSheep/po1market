"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { PixelLabel } from "@/components/immersive/pixel-label";
import {
  EXAMPLE_MARKET_ID,
  EXAMPLE_MARKET_QUESTION,
  EXAMPLE_RESOLUTION_SOURCE,
} from "@/lib/examples";
import { formatScore, shortenUrl } from "@/lib/display";
import { runMockSearch } from "@/lib/mock-search";
import type { MockSearchResponse, QueryMode } from "@/lib/types";

const INITIAL_RESPONSE: MockSearchResponse = {
  state: "no-results",
  results: [],
};

export function QueryConsole() {
  const [mode, setMode] = useState<QueryMode>("market-id");
  const [marketId, setMarketId] = useState("");
  const [marketQuestion, setMarketQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<MockSearchResponse>(INITIAL_RESPONSE);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSubmit() {
    setIsLoading(true);
    setHasSearched(true);

    const next =
      mode === "market-id"
        ? await runMockSearch({ mode, marketId })
        : await runMockSearch({ mode, marketQuestion });

    setResponse(next);
    setIsLoading(false);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.42)] backdrop-blur-2xl"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <PixelLabel>Query Console</PixelLabel>
        <PixelLabel>{mode === "market-id" ? "ID Mode" : "Custom Mode"}</PixelLabel>
      </div>

      <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/25 p-1">
        <button
          type="button"
          onClick={() => setMode("market-id")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-colors sm:text-sm ${
            mode === "market-id"
              ? "bg-white text-slate-950 shadow-sm shadow-black/20"
              : "text-slate-200 hover:bg-white/10"
          }`}
        >
          Use Market ID
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-colors sm:text-sm ${
            mode === "custom"
              ? "bg-white text-slate-950 shadow-sm shadow-black/20"
              : "text-slate-200 hover:bg-white/10"
          }`}
        >
          Use Custom Market
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("market-id");
              setMarketId(EXAMPLE_MARKET_ID);
            }}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            Example Market ID
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("custom");
              setMarketQuestion(EXAMPLE_MARKET_QUESTION);
            }}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            Example Custom Market
          </button>
        </div>

        {mode === "market-id" ? (
          <label className="block text-sm text-slate-300">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Market ID
            </span>
            <input
              aria-label="Market ID"
              value={marketId}
              onChange={(event) => setMarketId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-violet-500/0 transition-shadow focus:ring-2 focus:ring-violet-500/35"
            />
          </label>
        ) : (
          <label className="block text-sm text-slate-300">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Market Question
            </span>
            <input
              aria-label="Market Question"
              value={marketQuestion}
              onChange={(event) => setMarketQuestion(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-violet-500/0 transition-shadow focus:ring-2 focus:ring-violet-500/35"
            />
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Resolution hint · {shortenUrl(EXAMPLE_RESOLUTION_SOURCE)}
            </p>
          </label>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-full bg-gradient-to-r from-sky-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_40px_rgba(56,189,248,0.25)] transition hover:brightness-105 sm:w-auto"
        >
          Find Sources
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
        {!hasSearched ? (
          <p className="text-sm text-slate-400">Run a market query to preview recommended sources.</p>
        ) : isLoading ? (
          <p className="text-sm text-slate-400">Searching mock sources...</p>
        ) : response.state === "error" ? (
          <p className="text-sm text-rose-300">{response.errorMessage ?? "Something went wrong."}</p>
        ) : response.state === "no-results" ? (
          <p className="text-sm text-slate-400">No sources found. Try a richer query.</p>
        ) : (
          <div className="space-y-3">
            {response.results.map((item) => (
              <article
                key={item.url}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-violet-400/25 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium text-white">{item.label}</h3>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 font-mono text-[11px] text-violet-100">
                    {formatScore(item.score)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.reason}</p>
                <a
                  className="mt-3 inline-block text-sm text-sky-300/90 hover:text-sky-200"
                  href={item.url}
                >
                  {item.domain}
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
