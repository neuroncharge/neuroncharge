import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { Field, Input, Out } from "./calcs.health";

export const Route = createFileRoute("/calcs/physics")({
  head: () => ({ meta: [{ title: "Kinematics — neuroncalc" }] }),
  component: Phys,
});

// Solve any 3-of-5 from {u, v, a, t, s} using v=u+at and s=ut+½at²
function solve(u?: number, v?: number, a?: number, t?: number, s?: number) {
  const known = { u, v, a, t, s };
  let changed = true; let i = 0;
  while (changed && i++ < 8) {
    changed = false;
    const { u, v, a, t, s } = known;
    if (v == null && u != null && a != null && t != null) { known.v = u + a * t; changed = true; }
    if (u == null && v != null && a != null && t != null) { known.u = v - a * t; changed = true; }
    if (a == null && u != null && v != null && t != null && t !== 0) { known.a = (v - u) / t; changed = true; }
    if (t == null && u != null && v != null && a != null && a !== 0) { known.t = (v - u) / a; changed = true; }
    if (s == null && u != null && a != null && t != null) { known.s = u * t + 0.5 * a * t * t; changed = true; }
    if (s == null && u != null && v != null && t != null) { known.s = 0.5 * (u + v) * t; changed = true; }
    if (v == null && u != null && a != null && s != null) { const sq = u*u + 2*a*s; if (sq >= 0) { known.v = Math.sqrt(sq); changed = true; } }
  }
  return known;
}

function Phys() {
  const [vals, setVals] = useState<Record<string, string>>({ u: "0", a: "9.8", t: "3", v: "", s: "" });
  const upd = (k: string, val: string) => setVals(p => ({ ...p, [k]: val }));
  const num = (k: string) => vals[k] === "" ? undefined : parseFloat(vals[k]);
  const r = solve(num("u"), num("v"), num("a"), num("t"), num("s"));

  return (
    <Shell category="Physics" title="Kinematics" lead="Enter any three of: initial velocity (u), final velocity (v), acceleration (a), time (t), displacement (s).">
      <div className="max-w-3xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <Field label="u — initial velocity (m/s)"><Input v={vals.u} onV={v=>upd("u", v)} /></Field>
          <Field label="v — final velocity (m/s)"><Input v={vals.v} onV={v=>upd("v", v)} /></Field>
          <Field label="a — acceleration (m/s²)"><Input v={vals.a} onV={v=>upd("a", v)} /></Field>
          <Field label="t — time (s)"><Input v={vals.t} onV={v=>upd("t", v)} /></Field>
          <Field label="s — displacement (m)"><Input v={vals.s} onV={v=>upd("s", v)} /></Field>
        </div>
        <div className="border hairline rounded p-6 bg-card h-fit space-y-5">
          {(["u","v","a","t","s"] as const).map(k => (
            <Out key={k} label={k.toUpperCase()} value={r[k] != null ? r[k]!.toFixed(3) : "—"} sub={vals[k] === "" ? "Solved" : "Given"} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
