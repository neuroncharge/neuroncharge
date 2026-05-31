import { Link, Outlet } from "@tanstack/react-router";
import { type ReactNode } from "react";

export function Shell({ children, eyebrow, title, lead, category }: {
  children?: ReactNode;
  eyebrow?: string;
  title?: string;
  lead?: string;
  category?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopBar />
      {(title || eyebrow) && (
        <header className="max-w-3xl w-full mx-auto px-6 pt-12 pb-6">
          {eyebrow && <div className="label-eyebrow mb-2">{category ?? eyebrow}</div>}
          {title && <h1 className="text-4xl font-semibold tracking-tight mb-3">{title}</h1>}
          {lead && <p className="text-muted-foreground text-base leading-relaxed max-w-prose">{lead}</p>}
        </header>
      )}
      <main className="flex-1 w-full">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}

export function TopBar() {
  return (
    <nav className="h-16 border-b hairline flex justify-between items-center px-8 sticky top-0 bg-background z-10">
      <Link to="/" className="font-bold text-sm tracking-[0.18em] uppercase">
        NEURON<span className="font-light opacity-70">CALC</span>
      </Link>
      <div className="flex gap-6 items-center">
        <Link to="/neuron-metrics" className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">Metrics</Link>
        <Link to="/universal-calcs" className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">Calcs</Link>
        <Link to="/calm-space" className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">Calm</Link>
        <Link to="/insights" className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">Insights</Link>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="py-5 border-t hairline text-center font-mono text-[0.7rem] tracking-[0.15em] uppercase text-muted-foreground">
      © 2026 neuroncalc · Built for clear minds
    </footer>
  );
}

export function ItemCard({ to, href, eyebrow, title, desc }: {
  to?: string; href?: string; eyebrow?: string; title: string; desc: string;
}) {
  const cls = "group block border hairline bg-card p-6 hover:border-foreground transition-colors rounded";
  const inner = (
    <>
      {eyebrow && <div className="label-eyebrow mb-3">{eyebrow}</div>}
      <h3 className="text-lg font-semibold mb-1.5 tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <div className="font-mono text-[0.65rem] tracking-[0.2em] uppercase mt-4 text-muted-foreground group-hover:text-foreground transition-colors">
        Open →
      </div>
    </>
  );
  if (href) return <a href={href} className={cls}>{inner}</a>;
  return <Link to={to!} className={cls}>{inner}</Link>;
}
