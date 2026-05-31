import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/calm/mindful")({
  head: () => ({ meta: [{ title: "Mindful Metrics — neuroncalc" }] }),
  component: Mindful,
});

type Session = { at: number; minutes: number; objective: string };

function Mindful() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(JSON.parse(localStorage.getItem("nc_focus") || "[]"));
  }, []);

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 3600 * 1000;
  const week = sessions.filter(s => s.at > weekAgo);
  const total = week.reduce((s, x) => s + x.minutes, 0);

  // 7-day bar chart
  const days: { d: string; mins: number }[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now - (6 - i) * 86400000);
    const start = new Date(day); start.setHours(0,0,0,0);
    const end = new Date(day); end.setHours(23,59,59,999);
    const mins = sessions.filter(s => s.at >= start.getTime() && s.at <= end.getTime()).reduce((a, b) => a + b.minutes, 0);
    return { d: day.toLocaleDateString(undefined, { weekday: "short" }), mins };
  });
  const max = Math.max(60, ...days.map(d => d.mins));

  return (
    <Shell category="Calm · Mindful" title="Mindful Metrics" lead="A quiet record of your focus minutes this week.">
      <div className="max-w-3xl mx-auto px-6 pb-24 space-y-8">
        <div className="grid grid-cols-3 gap-4">
          <Stat label="This week" value={`${total}m`} />
          <Stat label="Sessions" value={String(week.length)} />
          <Stat label="Avg / session" value={week.length ? `${Math.round(total/week.length)}m` : "—"} />
        </div>
        <div className="border hairline rounded bg-card p-6">
          <div className="label-eyebrow mb-5">Last 7 days</div>
          <div className="flex items-end gap-3 h-40">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-foreground rounded-sm transition-all" style={{ height: `${(d.mins / max) * 100}%`, minHeight: d.mins > 0 ? "4px" : "1px", opacity: d.mins > 0 ? 1 : 0.15 }} />
                <span className="font-mono text-[0.65rem] tracking-[0.1em] uppercase text-muted-foreground">{d.d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border hairline rounded bg-card p-6">
          <div className="label-eyebrow mb-4">Recent sessions</div>
          {week.length === 0
            ? <p className="text-sm text-muted-foreground">No sessions yet. <Link to="/calm/focus" className="underline">Start a focus timer</Link>.</p>
            : <ul className="divide-y hairline -my-2">
                {week.slice().reverse().slice(0, 8).map((s, i) => (
                  <li key={i} className="py-3 flex justify-between text-sm">
                    <span className="truncate pr-4">{s.objective || <em className="text-muted-foreground">untitled</em>}</span>
                    <span className="font-mono text-muted-foreground tabular-nums">{s.minutes}m · {new Date(s.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </li>
                ))}
              </ul>}
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border hairline rounded bg-card p-5">
      <div className="label-eyebrow mb-2">{label}</div>
      <div className="font-mono text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
