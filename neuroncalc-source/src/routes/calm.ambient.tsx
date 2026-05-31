import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/calm/ambient")({
  head: () => ({ meta: [{ title: "Ambient — neuroncalc" }] }),
  component: Ambient,
});

type Layer = { id: string; label: string; build: (ctx: AudioContext, gain: GainNode) => () => void };

const layers: Layer[] = [
  {
    id: "brown", label: "Brown noise",
    build: (ctx, gain) => {
      const bs = 4096; const node = ctx.createScriptProcessor(bs, 1, 1);
      let last = 0;
      node.onaudioprocess = e => {
        const o = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bs; i++) { const w = Math.random()*2-1; o[i] = (last + 0.02*w)/1.02; last = o[i]; o[i] *= 3.5; }
      };
      node.connect(gain);
      return () => { node.disconnect(); };
    },
  },
  {
    id: "rain", label: "Rain (filtered noise)",
    build: (ctx, gain) => {
      const bs = 4096; const node = ctx.createScriptProcessor(bs, 1, 1);
      node.onaudioprocess = e => { const o = e.outputBuffer.getChannelData(0); for (let i = 0; i < bs; i++) o[i] = (Math.random()*2-1) * 0.6; };
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1200;
      node.connect(f).connect(gain);
      return () => { node.disconnect(); f.disconnect(); };
    },
  },
  {
    id: "waves", label: "Slow waves",
    build: (ctx, gain) => {
      const bs = 4096; const node = ctx.createScriptProcessor(bs, 1, 1);
      let t = 0;
      node.onaudioprocess = e => {
        const o = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bs; i++) { const env = 0.5 + 0.5*Math.sin(t * 0.0006); o[i] = (Math.random()*2-1) * env * 0.8; t++; }
      };
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 800;
      node.connect(f).connect(gain);
      return () => { node.disconnect(); f.disconnect(); };
    },
  },
];

function Ambient() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainsRef = useRef<Record<string, GainNode>>({});
  const stopRef = useRef<Record<string, () => void>>({});
  const [vol, setVol] = useState<Record<string, number>>({ brown: 0, rain: 0, waves: 0 });

  useEffect(() => () => {
    Object.values(stopRef.current).forEach(s => s());
    ctxRef.current?.close();
  }, []);

  const ensure = () => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;
      for (const l of layers) {
        const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
        gainsRef.current[l.id] = g;
        stopRef.current[l.id] = l.build(ctx, g);
      }
    }
    ctxRef.current!.resume();
  };

  const setLayerVol = (id: string, v: number) => {
    ensure();
    setVol(p => ({ ...p, [id]: v }));
    const g = gainsRef.current[id]; if (g) g.gain.value = v;
  };

  return (
    <Shell category="Calm · Ambient" title="Ambient Acoustic Console" lead="Layer textures to mask distraction. All sound is generated locally — nothing streams.">
      <div className="max-w-xl mx-auto px-6 pb-24">
        <div className="border hairline rounded bg-card p-8 space-y-7">
          {layers.map(l => (
            <div key={l.id}>
              <div className="flex justify-between mb-2">
                <span className="label-eyebrow">{l.label}</span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">{Math.round(vol[l.id] * 100)}</span>
              </div>
              <input type="range" min={0} max={1} step={0.01} value={vol[l.id]} onChange={e=>setLayerVol(l.id, parseFloat(e.target.value))}
                className="w-full accent-foreground" />
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2 border-t hairline">Tip — pin this tab. Audio keeps running while you work.</p>
        </div>
      </div>
    </Shell>
  );
}
