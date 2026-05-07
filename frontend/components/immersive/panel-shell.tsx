import type { HTMLAttributes, ReactNode } from "react";

type PanelShellProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PanelShell({ className, children, ...props }: PanelShellProps) {
  return (
    <section
      className={joinClasses(
        "relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.06] shadow-[0_28px_90px_rgba(2,6,23,0.45)] backdrop-blur-2xl",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_28%,transparent_72%,rgba(129,140,248,0.08))] before:content-['']",
        "after:pointer-events-none after:absolute after:inset-px after:rounded-[29px] after:border after:border-white/5 after:content-['']",
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </section>
  );
}
