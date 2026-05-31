import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { Field, Input, Out } from "./calcs.health";

export const Route = createFileRoute("/calcs/accounts")({
  head: () => ({ meta: [{ title: "Compound Interest — neuroncalc" }] }),
  component: Compound,
});

function Compound() {
  const [p, setP] = useState("10000");
  const [r, setR] = useState("7");
  const [t, setT] = useState("10");
  const [n, setN] = useState("12");
  const [c, setC] = useState("200");

  const out = useMemo(() => {
    const P = parseFloat(p), R = parseFloat(r)/100, T = parseFloat(t), N = parseFloat(n), C = parseFloat(c);
    if ([P,R,T,N].some(isNaN)) return null;
    const base = P * Math.pow(1 + R/N, N*T);
    const contribFV = C ? C * ((Math.pow(1 + R/N, N*T) - 1) / (R/N)) * (N/12) : 0;
    const fv = base + contribFV;
    const contributed = (C || 0) * 12 * T;
    return { fv, contributed, principal: P, interest: fv - P - contributed };
  }, [p, r, t, n, c]);

  return (
    <Shell category="Accounts" title="Compound Interest" lead="Project savings growth with optional monthly contributions.">
      <div className="max-w-3xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <Field label="Principal (USD)"><Input v={p} onV={setP} /></Field>
          <Field label="Annual rate (%)"><Input v={r} onV={setR} /></Field>
          <Field label="Years"><Input v={t} onV={setT} /></Field>
          <Field label="Compounds / year">
            <select value={n} onChange={e=>setN(e.target.value)} className="w-full bg-transparent border hairline rounded px-3 py-2.5 text-sm hover:border-foreground focus:outline-none focus:border-foreground">
              <option value="1">Annually (1)</option>
              <option value="4">Quarterly (4)</option>
              <option value="12">Monthly (12)</option>
              <option value="365">Daily (365)</option>
            </select>
          </Field>
          <Field label="Monthly contribution (USD)"><Input v={c} onV={setC} /></Field>
        </div>
        <div className="border hairline rounded p-6 bg-card h-fit space-y-5">
          <Out label="Future value" value={out ? "$" + out.fv.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—"} />
          <Out label="Principal" value={out ? "$" + out.principal.toLocaleString() : "—"} />
          <Out label="Contributions" value={out ? "$" + out.contributed.toLocaleString() : "—"} />
          <Out label="Interest earned" value={out ? "$" + out.interest.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—"} />
        </div>
      </div>
    </Shell>
  );
}
