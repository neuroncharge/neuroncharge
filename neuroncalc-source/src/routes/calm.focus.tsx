import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/calm/focus")({
  head: () => ({ meta: [{ title: "Focus Timer — neuroncalc" }] }),
  component: Focus,
});

function Focus() {
  const [obj, setObj] = useState("");
  const [mins, setMins] = useState(25);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft(l => {
        if (l <= 1) {
          clearInterval(ref.current!); setRunning(false);
          const log = JSON.parse(localStorage.getItem("nc_focus") || "[]");
          log.push({ at: Date.now(), minutes: mins, objective: obj });
          localStorage.setItem("nc_focus", JSON.stringify(log));
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, mins, obj]);

  const start = () => { setLeft(mins * 60); setRunning(true); };
  const stop = () => { setRunning(false); setLeft(0); };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <Shell category="Calm · Focus" title="Intentional Focus Timer" lead="Name your objective, set a countdown, and let the page hold you accountable.">
      <div className="max-w-xl mx-auto px-6 pb-24">
        <div className="border hairline rounded bg-card p-8 text-center">
          <input value={obj} onChange={e=>setObj(e.target.value)} placeholder="What are you focusing on?" disabled={running}
            className="w-full text-center bg-transparent border-b hairline pb-3 text-base focus:outline-none focus:border-foreground placeholder:text-muted-foreground/60 disabled:opacity-60" />
          <div className="font-mono text-7xl font-semibold tracking-tight mt-10 mb-2 tabular-nums">{running || left > 0 ? `${mm}:${ss}` : `${String(mins).padStart(2,"0")}:00`}</div>
          {obj && <div className="label-eyebrow mb-8">→ {obj}</div>}
          {!running && (
            <div className="flex gap-2 justify-center mb-6 flex-wrap">
              {[15, 25, 45, 60, 90].map(m => (
                <button key={m} onClick={() => setMins(m)} className={`px-3 py-1.5 text-xs uppercase tracking-[0.15em] border rounded ${mins===m ? "bg-foreground text-background border-foreground" : "hairline hover:border-foreground"}`}>{m}m</button>
              ))}
            </div>
          )}
          {!running
            ? <button onClick={start} className="px-6 py-3 bg-foreground text-background text-xs font-semibold tracking-[0.18em] uppercase rounded hover:opacity-90 transition">Begin focus</button>
            : <button onClick={stop} className="px-6 py-3 border hairline text-xs font-semibold tracking-[0.18em] uppercase rounded hover:border-destructive hover:text-destructive transition">End early</button>
          }
        </div>
      </div>
    </Shell>
  );
}
