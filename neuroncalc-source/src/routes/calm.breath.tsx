import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/calm/breath")({
  head: () => ({ meta: [{ title: "Breath — neuroncalc" }] }),
  component: Breath,
});

const phases = [
  { label: "Inhale", sec: 4, scale: 1 },
  { label: "Hold",   sec: 4, scale: 1 },
  { label: "Exhale", sec: 4, scale: 0.5 },
  { label: "Hold",   sec: 4, scale: 0.5 },
];

function Breath() {
  const [running, setRunning] = useState(false);
  const [i, setI] = useState(0);
  const [t, setT] = useState(4);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      setT(prev => {
        if (prev <= 1) { setI(x => (x + 1) % phases.length); return phases[(i + 1) % phases.length].sec; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [running, i]);

  const p = phases[i];

  return (
    <Shell category="Calm · Breath" title="Breath Regulation Node" lead="A smooth 4-4-4-4 box-breathing visualizer. Follow the circle.">
      <div className="max-w-md mx-auto px-6 pb-24">
        <div className="border hairline rounded bg-card p-10 flex flex-col items-center">
          <div className="relative w-64 h-64 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border hairline" />
            <div
              className="rounded-full bg-foreground/90 transition-all ease-in-out"
              style={{ width: `${p.scale * 100}%`, height: `${p.scale * 100}%`, transitionDuration: running ? `${p.sec}s` : "0.3s" }}
            />
            <div className="absolute font-mono text-xs uppercase tracking-[0.2em] text-background mix-blend-difference">{running ? p.label : "Ready"}</div>
          </div>
          <div className="font-mono text-3xl font-semibold tabular-nums mb-6">{running ? t : "·"}</div>
          <button onClick={() => { setRunning(!running); setI(0); setT(4); }}
            className="px-6 py-3 bg-foreground text-background text-xs font-semibold tracking-[0.18em] uppercase rounded hover:opacity-90 transition">
            {running ? "Stop" : "Begin"}
          </button>
        </div>
      </div>
    </Shell>
  );
}
