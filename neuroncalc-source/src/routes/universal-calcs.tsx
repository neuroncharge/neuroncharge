import { createFileRoute } from "@tanstack/react-router";
import { Shell, ItemCard } from "@/components/shell";

export const Route = createFileRoute("/universal-calcs")({
  head: () => ({ meta: [{ title: "Universal Calcs — neuroncalc" }, { name: "description", content: "Health, accounts, mathematics and physics calculators." }] }),
  component: () => (
    <Shell category="02 / Universal Calcs" title="Universal Calcs" lead="Clean, focused calculators for daily numbers. Each opens on its own page.">
      <div className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-4">
        <ItemCard to="/calcs/health" eyebrow="Health & Vitals" title="BMI & BMR" desc="Body mass index and basal metabolic rate from height, weight, age and activity." />
        <ItemCard to="/calcs/accounts" eyebrow="Accounts" title="Compound Interest" desc="Project savings growth with principal, rate, time and compounding frequency." />
        <ItemCard to="/calcs/mathematics" eyebrow="Mathematics" title="Scientific Calculator" desc="A clean scientific calculator with trig, logs, powers and constants." />
        <ItemCard to="/calcs/physics" eyebrow="Physics" title="Kinematics" desc="Solve for displacement, velocity, acceleration and time using the four equations of motion." />
      </div>
    </Shell>
  ),
});
