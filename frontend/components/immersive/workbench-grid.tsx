import { motion } from "framer-motion";

import { PanelShell } from "@/components/immersive/panel-shell";
import { PixelLabel } from "@/components/immersive/pixel-label";
import { QueryConsole } from "@/components/search/query-console";

const discoverySteps = [
  "Resolve market framing",
  "Generate source hypotheses",
  "Rank evidence candidates",
];

const enter = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export function WorkbenchGrid() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)_minmax(280px,0.85fr)] lg:grid-rows-[minmax(260px,0.9fr)_minmax(240px,0.8fr)_minmax(220px,0.75fr)]">
      <motion.div
        className="lg:col-span-2 lg:row-start-1"
        {...enter}
        transition={{ duration: 0.48, delay: 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <PanelShell className="h-full p-8 sm:p-10">
        <p className="text-[11px] uppercase tracking-[0.38em] text-slate-300/85">
          Source Recommendation Console
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
          <div>
            <h1 className="max-w-[11ch] text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
              Find Signal Before the Market Moves
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300/78 sm:text-base">
              A cinematic mock-data workbench for pressure-testing market narratives, source
              quality, and resolution paths before the crowd catches up.
            </p>
          </div>

          <div className="grid gap-4 self-end text-sm text-slate-300/75">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">
                Active posture
              </p>
              <p className="mt-3 text-base text-white">Workbench-first, asymmetric, low-noise.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">
                Surface goal
              </p>
              <p className="mt-3">Make ranking context visible before a user even runs a query.</p>
            </div>
          </div>
        </div>
      </PanelShell>
      </motion.div>

      <motion.div
        className="lg:col-start-3 lg:row-span-2"
        {...enter}
        transition={{ duration: 0.48, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        <PanelShell
          id="signal-surface"
          className="flex h-full min-h-[260px] flex-col justify-between p-6"
        >
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.28em] text-slate-200">
            Signal Surface
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300/78">
            Frame the first-screen experience around source confidence, market context, and a
            compact editorial read of what matters now.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Coverage</p>
            <p className="mt-2 text-lg text-white">Market ID + Custom thesis</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Bias check</p>
            <p className="mt-2 text-sm text-slate-200">Separate narrative energy from resolution evidence.</p>
          </div>
        </div>
      </PanelShell>
      </motion.div>

      <div id="console" className="lg:col-start-1 lg:row-start-2 lg:row-span-2">
        <div className="mb-3 flex items-center justify-between px-1">
          <PixelLabel>Query Surface</PixelLabel>
          <PixelLabel>Mock-first</PixelLabel>
        </div>
        <QueryConsole />
      </div>

      <motion.div
        className="lg:col-start-2 lg:row-start-2"
        {...enter}
        transition={{ duration: 0.48, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <PanelShell id="ranked-sources" className="h-full min-h-[240px] p-6">
        <h2 className="text-sm font-medium uppercase tracking-[0.28em] text-slate-200">
          Ranked Sources
        </h2>
        <div className="mt-5 grid gap-3 text-sm text-slate-300/78">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-100/85">Tier 01</p>
            <p className="mt-2 text-white">Primary evidence with explicit resolution relevance.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Tier 02</p>
            <p className="mt-2">Context links, supporting documents, and timestamped updates.</p>
          </div>
        </div>
      </PanelShell>
      </motion.div>

      <PanelShell id="flow" className="min-h-[220px] p-6 lg:col-start-2 lg:row-start-3">
        <h2 className="text-sm font-medium uppercase tracking-[0.28em] text-slate-200">
          Discovery Flow
        </h2>
        <ol className="mt-5 space-y-3 text-sm text-slate-300/78">
          {discoverySteps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] text-slate-200">
                0{index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </PanelShell>

      <PanelShell
        id="contract"
        className="min-h-[220px] p-6 lg:col-start-3 lg:row-start-3"
      >
        <h2 className="text-sm font-medium uppercase tracking-[0.28em] text-slate-200">
          Target Contract
        </h2>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-slate-400">
            Endpoint
          </p>
          <p className="mt-3 font-mono text-sm text-white">POST /api/v1/recommendations</p>
          <p className="mt-4 text-sm leading-7 text-slate-300/78">
            Keep the seam visible so the frontend can graduate from mock ranking to live backend
            sources without rewriting the shell.
          </p>
        </div>
      </PanelShell>
    </div>
  );
}
