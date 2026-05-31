import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/calcs/mathematics")({
  head: () => ({ meta: [{ title: "Scientific Calculator — neuroncalc" }] }),
  component: Sci,
});

function Sci() {
  const [expr, setExpr] = useState("");
  const [out, setOut] = useState<string>("0");
  const [rad, setRad] = useState(true);

  const evalExpr = (s: string) => {
    try {
      let e = s
        .replace(/π/g, "Math.PI").replace(/e(?![a-zA-Z])/g, "Math.E")
        .replace(/√\(/g, "Math.sqrt(")
        .replace(/\^/g, "**")
        .replace(/(sin|cos|tan)\(/g, (_m, f) => `Math.${f}((${rad ? "1" : "Math.PI/180"})*`)
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(");
      // eslint-disable-next-line no-new-func
      const r = Function(`"use strict"; return (${e})`)();
      return String(+r.toFixed(10));
    } catch { return "Error"; }
  };

  const push = (t: string) => setExpr(expr + t);
  const calc = () => setOut(evalExpr(expr));
  const clear = () => { setExpr(""); setOut("0"); };

  const keys: { l: string; v?: string; act?: () => void; cls?: string }[] = [
    { l: "sin", v: "sin(" }, { l: "cos", v: "cos(" }, { l: "tan", v: "tan(" }, { l: rad ? "rad" : "deg", act: () => setRad(!rad), cls: "text-muted-foreground" },
    { l: "ln", v: "ln(" }, { l: "log", v: "log(" }, { l: "√", v: "√(" }, { l: "^", v: "^" },
    { l: "π", v: "π" }, { l: "e", v: "e" }, { l: "(", v: "(" }, { l: ")", v: ")" },
    { l: "7", v: "7" }, { l: "8", v: "8" }, { l: "9", v: "9" }, { l: "÷", v: "/" },
    { l: "4", v: "4" }, { l: "5", v: "5" }, { l: "6", v: "6" }, { l: "×", v: "*" },
    { l: "1", v: "1" }, { l: "2", v: "2" }, { l: "3", v: "3" }, { l: "−", v: "-" },
    { l: "0", v: "0" }, { l: ".", v: "." }, { l: "C", act: clear, cls: "text-destructive" }, { l: "+", v: "+" },
  ];

  return (
    <Shell category="Mathematics" title="Scientific Calculator">
      <div className="max-w-md mx-auto px-6 pb-24">
        <div className="border hairline rounded bg-card p-5">
          <div className="text-right font-mono text-sm text-muted-foreground min-h-5 truncate">{expr || " "}</div>
          <div className="text-right font-mono text-4xl font-semibold tracking-tight mt-2 mb-5 truncate">{out}</div>
          <div className="grid grid-cols-4 gap-1.5">
            {keys.map((k, i) => (
              <button key={i} onClick={() => k.act ? k.act() : push(k.v!)}
                className={`py-3 text-sm font-mono border hairline rounded hover:border-foreground hover:bg-accent transition-colors ${k.cls ?? ""}`}>
                {k.l}
              </button>
            ))}
            <button onClick={calc} className="col-span-4 py-3 text-xs uppercase tracking-[0.18em] font-semibold bg-foreground text-background rounded hover:opacity-90 transition">Equals</button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
