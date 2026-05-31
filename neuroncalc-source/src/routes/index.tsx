import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "neuroncalc — cognitive metrics, calculators & calm" },
      { name: "description", content: "A minimalist suite of cognitive tests, everyday calculators, and a quiet focus space. Built for clear thinking." },
      { property: "og:title", content: "neuroncalc" },
      { property: "og:description", content: "Cognitive metrics, calculators, and a calm focus space." },
    ],
  }),
  component: Home,
});

const categories = [
  {
    eyebrow: "01 / Metrics",
    title: "Neuron Metrics",
    desc: "Nine focused tests for reaction, memory, attention and processing speed.",
    to: "/neuron-metrics",
    count: "9 modules",
  },
  {
    eyebrow: "02 / Calcs",
    title: "Universal Calcs",
    desc: "Health, accounts, mathematics and physics — clean tools for daily numbers.",
    to: "/universal-calcs",
    count: "4 calculators",
  },
  {
    eyebrow: "03 / Calm",
    title: "Calm Space",
    desc: "A zero-distraction sanctuary: focus timer, breath, ambient sound, and mindful display.",
    to: "/calm-space",
    count: "4 modules",
  },
] as const;

function Home() {
  return (
    <Shell>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="label-eyebrow mb-4">A quiet workbench for the mind</div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          Measure, calculate, and recover —<br/>
          <span className="text-muted-foreground">all in one minimalist space.</span>
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground text-base leading-relaxed">
          neuroncalc bundles cognitive tests, everyday calculators, and a focus sanctuary. No accounts, no clutter — your data stays on this device.
        </p>
        <div className="mt-8 flex gap-3 flex-wrap">
          <Link to="/neuron-metrics" className="px-5 py-3 bg-foreground text-background text-xs font-semibold tracking-[0.18em] uppercase rounded hover:opacity-90 transition">Start a test</Link>
          <Link to="/insights" className="px-5 py-3 border hairline text-xs font-semibold tracking-[0.18em] uppercase rounded hover:border-foreground transition">View insights</Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="border-t hairline pt-8 mb-8 flex justify-between items-end">
          <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground">Three spaces</h2>
          <span className="text-xs font-mono tracking-[0.15em] uppercase text-muted-foreground">+ Insights</span>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-border border hairline rounded overflow-hidden">
          {categories.map(c => (
            <Link key={c.to} to={c.to} className="bg-card p-8 hover:bg-accent transition-colors group">
              <div className="label-eyebrow mb-6">{c.eyebrow}</div>
              <h3 className="text-2xl font-semibold tracking-tight mb-3">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">{c.desc}</p>
              <div className="flex justify-between items-center font-mono text-[0.7rem] tracking-[0.15em] uppercase text-muted-foreground">
                <span>{c.count}</span>
                <span className="group-hover:text-foreground transition-colors">Enter →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
