import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Insights — neuroncalc" }, { name: "description", content: "Your best scores and recent activity across modules." }] }),
  component: Insights,
});

const METRICS = [
  { id: "reaction",   name: "Reaction Time",   unit: "ms",     type: "low"  },
  { id: "typing",     name: "Speed Typing",    unit: "WPM",    type: "high" },
  { id: "chimp",      name: "Chimp Test",      unit: "Pts",    type: "high" },
  { id: "visual",     name: "Visual Memory",   unit: "Lvl",    type: "high" },
  { id: "sequence",   name: "Sequence Memory", unit: "Lvl",    type: "high" },
  { id: "number",     name: "Number Memory",   unit: "Digits", type: "high" },
  { id: "stroop",     name: "Stroop Test",     unit: "Pts",    type: "high" },
  { id: "cps",        name: "CPS Test",        unit: "CPS",    type: "high" },
  { id: "estimation", name: "Time Estimation", unit: "ms",     type: "raw"  },
];

function Insights() {
  const [stats, setStats] = useState<Record<string, { best: number; total: number; count: number }>>({});
  const [focusMin, setFocusMin] = useState(0);

  useEffect(() => {
    setStats(JSON.parse(localStorage.getItem("nc_stats") || "{}"));
    const week = (JSON.parse(localStorage.getItem("nc_focus") || "[]") as { at: number; minutes: number }[])
      .filter(s => s.at > Date.now() - 7*86400000)
      .reduce((a, b) => a + b.minutes, 0);
    setFocusMin(week);
  }, []);

  const tested = METRICS.filter(m => stats[m.id]?.count);

  const reset = () => {
    if (!confirm("Erase all scores and focus history?")) return;
    localStorage.removeItem("nc_stats");
    localStorage.removeItem("nc_focus");
    setStats({}); setFocusMin(0);
  };

  return (
    <Shell category="Insights" title="Insights" lead="Your best scores and accumulated focus, pulled live from this device.">
      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Modules tried" value={`${tested.length} / 9`} />
          <Stat label="Total attempts" value={String(tested.reduce((a, m) => a + stats[m.id].count, 0))} />
          <Stat label="Focus this week" value={`${focusMin}m`} />
          <Stat label="Top module" value={tested[0]?.name?.split(" ")[0] ?? "—"} />
        </div>

        <div className="border hairline rounded bg-card overflow-hidden">
          <div className="px-6 py-4 border-b hairline flex justify-between items-center">
            <span className="label-eyebrow">Neuron metrics</span>
            <button onClick={reset} className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive transition">Reset all →</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-6 py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase font-normal">Module</th>
                <th className="px-6 py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase font-normal text-right">Best</th>
                <th className="px-6 py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase font-normal text-right">Avg</th>
                <th className="px-6 py-3 font-mono text-[0.65rem] tracking-[0.15em] uppercase font-normal text-right">Tries</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map(m => {
                const s = stats[m.id];
                return (
                  <tr key={m.id} className="border-t hairline">
                    <td className="px-6 py-3.5">
                      <a href={`/tests/${m.id}.html`} className="hover:underline">{m.name}</a>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono tabular-nums">{s?.best ? `${s.best} ${m.unit}` : "—"}</td>
                    <td className="px-6 py-3.5 text-right font-mono tabular-nums text-muted-foreground">{s?.count ? (s.total / s.count).toFixed(1) : "—"}</td>
                    <td className="px-6 py-3.5 text-right font-mono tabular-nums text-muted-foreground">{s?.count ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/neuron-metrics" className="px-5 py-3 bg-foreground text-background text-xs font-semibold tracking-[0.18em] uppercase rounded hover:opacity-90 transition">Run a test</Link>
          <Link to="/calm/mindful" className="px-5 py-3 border hairline text-xs font-semibold tracking-[0.18em] uppercase rounded hover:border-foreground transition">Focus history</Link>
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border hairline rounded bg-card p-5">
      <div className="label-eyebrow mb-2">{label}</div>
      <div className="font-mono text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
