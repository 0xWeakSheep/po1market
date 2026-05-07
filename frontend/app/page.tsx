import { PanelShell } from "@/components/immersive/panel-shell";
import { WorkbenchGrid } from "@/components/immersive/workbench-grid";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <nav className="sticky top-4 z-30 flex items-center justify-between rounded-full border border-white/10 bg-black/45 px-4 py-3 text-sm text-slate-300 shadow-[0_18px_48px_rgba(2,6,23,0.32)] backdrop-blur-xl sm:px-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.34em] text-slate-100">
          po1market
        </span>
        <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.22em] text-slate-400 sm:text-[11px]">
          <a href="#console">Console</a>
          <a href="#signal-surface">Signal</a>
          <a href="#flow">Flow</a>
          <a href="#api">API</a>
          <a href="#contract">Contract</a>
          <a href="#faq">FAQ</a>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-6.5rem)] items-center py-8 sm:py-10">
        <WorkbenchGrid />
      </section>

      <section
        id="lower"
        className="grid gap-4 border-t border-white/10 py-12 sm:py-16 lg:grid-cols-3"
        aria-label="Product context"
      >
        <article
          id="api"
          className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md"
        >
          <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">API</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300/85">
            The live contract stays{" "}
            <span className="font-mono text-slate-100">POST /api/v1/recommendations</span>. This build
            is mock-first: wire the request shape here once the backend session is stable.
          </p>
        </article>
        <article className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md">
          <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
            Atmosphere
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-300/85">
            Near-black layers, glass surfaces, violet-sky glow, and room to read before you commit to
            a query.
          </p>
        </article>
        <article className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md">
          <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
            How it works
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-300/85">
            Choose market ID or custom thesis, preview ranked mock sources, then graduate the same
            shell to real recommendations without redesigning the grid.
          </p>
        </article>
      </section>

      <section id="faq" className="py-12 sm:py-16">
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.34em] text-slate-400">Below the fold</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            FAQ
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300/78 sm:text-base">
            The first screen stays dedicated to the operating surface. Supporting context lives
            below it so exploration remains the primary interaction.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <PanelShell className="p-6">
            <h3 className="text-lg font-medium text-white">Is this using live backend data?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300/78">
              Not yet. This milestone stays mock-data-first so the frontend shell can harden the
              workflow before the backend recommendation service is wired in.
            </p>
          </PanelShell>
          <PanelShell className="p-6">
            <h3 className="text-lg font-medium text-white">What happens after this refresh?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300/78">
              The current seam keeps the console stable while later tasks deepen the control
              surface and move result presentation closer to the live recommendation contract.
            </p>
          </PanelShell>
        </div>
      </section>
    </main>
  );
}
