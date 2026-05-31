import { createFileRoute } from "@tanstack/react-router";
import { Shell, ItemCard } from "@/components/shell";

export const Route = createFileRoute("/neuron-metrics")({
  head: () => ({
    meta: [
      { title: "Neuron Metrics — neuroncalc" },
      { name: "description", content: "Nine cognitive tests for reaction, memory, focus and processing speed." },
    ],
  }),
  component: () => (
    <Shell category="01 / Neuron Metrics" title="Neuron Metrics" lead="Nine focused, single-purpose tests. Each opens in its own page so you can repeat without distraction.">
      <div className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map(t => (
          <ItemCard key={t.id} href={`/tests/${t.id}.html`} eyebrow={t.unit} title={t.name} desc={t.desc} />
        ))}
      </div>
    </Shell>
  ),
});

const tests = [
  { id: "reaction",   name: "Reaction Time",   unit: "ms",     desc: "Click the box the moment it turns green." },
  { id: "typing",     name: "Speed Typing",    unit: "WPM",    desc: "Type the passage as fast and accurately as you can." },
  { id: "chimp",      name: "Chimp Test",      unit: "Pts",    desc: "Click numbers in ascending order — they hide after the first click." },
  { id: "visual",     name: "Visual Memory",   unit: "Lvl",    desc: "Memorize the lit tiles, then click them after they vanish." },
  { id: "sequence",   name: "Sequence Memory", unit: "Lvl",    desc: "Repeat the flashing pattern. It grows each round." },
  { id: "number",     name: "Number Memory",   unit: "Digits", desc: "Memorize a number, then type it from memory." },
  { id: "stroop",     name: "Stroop Test",     unit: "Pts",    desc: "Match the ink color of the word, not what it spells." },
  { id: "cps",        name: "CPS Test",        unit: "CPS",    desc: "Click as many times as possible in five seconds." },
  { id: "estimation", name: "Time Estimation", unit: "ms",     desc: "Stop the timer when you think the target time has passed." },
];
