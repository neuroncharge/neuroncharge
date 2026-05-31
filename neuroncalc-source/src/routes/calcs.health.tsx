import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/calcs/health")({
  head: () => ({ meta: [{ title: "BMI & BMR — neuroncalc" }] }),
  component: Health,
});

function Health() {
  const [sex, setSex] = useState<"m" | "f">("m");
  const [age, setAge] = useState("28");
  const [h, setH] = useState("175");
  const [w, setW] = useState("70");
  const [act, setAct] = useState("1.55");

  const r = useMemo(() => {
    const H = parseFloat(h), W = parseFloat(w), A = parseFloat(age), AC = parseFloat(act);
    if (!H || !W || !A) return null;
    const bmi = W / Math.pow(H / 100, 2);
    const bmr = sex === "m" ? 10*W + 6.25*H - 5*A + 5 : 10*W + 6.25*H - 5*A - 161;
    const tdee = bmr * AC;
    const cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
    return { bmi, bmr, tdee, cat };
  }, [h, w, age, sex, act]);

  return (
    <Shell category="Health & Vitals" title="BMI & BMR" lead="Body composition and metabolic rate using the Mifflin-St Jeor equation.">
      <div className="max-w-3xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <Field label="Sex">
            <div className="flex gap-2">
              {(["m", "f"] as const).map(s => (
                <button key={s} onClick={() => setSex(s)} className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border rounded ${sex===s ? "bg-foreground text-background border-foreground" : "hairline hover:border-foreground"}`}>{s === "m" ? "Male" : "Female"}</button>
              ))}
            </div>
          </Field>
          <Field label="Age (years)"><Input v={age} onV={setAge} /></Field>
          <Field label="Height (cm)"><Input v={h} onV={setH} /></Field>
          <Field label="Weight (kg)"><Input v={w} onV={setW} /></Field>
          <Field label="Activity level">
            <select value={act} onChange={e=>setAct(e.target.value)} className="w-full bg-transparent border hairline rounded px-3 py-2.5 text-sm hover:border-foreground focus:outline-none focus:border-foreground">
              <option value="1.2">Sedentary (little exercise)</option>
              <option value="1.375">Light (1–3 days/wk)</option>
              <option value="1.55">Moderate (3–5 days/wk)</option>
              <option value="1.725">Active (6–7 days/wk)</option>
              <option value="1.9">Very active (athlete)</option>
            </select>
          </Field>
        </div>
        <div className="border hairline rounded p-6 bg-card h-fit space-y-5">
          <Out label="BMI" value={r ? r.bmi.toFixed(1) : "—"} sub={r?.cat} />
          <Out label="BMR (kcal/day)" value={r ? Math.round(r.bmr).toString() : "—"} sub="At-rest energy" />
          <Out label="TDEE (kcal/day)" value={r ? Math.round(r.tdee).toString() : "—"} sub="With activity" />
        </div>
      </div>
    </Shell>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="label-eyebrow mb-2">{label}</div>
      {children}
    </label>
  );
}
export function Input({ v, onV, type="number" }: { v: string; onV: (s: string) => void; type?: string }) {
  return <input type={type} value={v} onChange={e=>onV(e.target.value)} className="w-full bg-transparent border hairline rounded px-3 py-2.5 text-sm font-mono hover:border-foreground focus:outline-none focus:border-foreground" />;
}
export function Out({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-b hairline last:border-0 pb-4 last:pb-0">
      <div className="label-eyebrow mb-2">{label}</div>
      <div className="text-3xl font-mono font-semibold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
