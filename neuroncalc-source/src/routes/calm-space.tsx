import { createFileRoute } from "@tanstack/react-router";
import { Shell, ItemCard } from "@/components/shell";

export const Route = createFileRoute("/calm-space")({
  head: () => ({ meta: [{ title: "Calm Space — neuroncalc" }, { name: "description", content: "A zero-distraction focus sanctuary." }] }),
  component: () => (
    <Shell category="03 / Calm Space" title="Calm Space" lead="A zero-distraction sanctuary. Leave it open in a background tab to keep your focus warm.">
      <div className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-4">
        <ItemCard to="/calm/focus" eyebrow="Focus" title="Intentional Focus Timer" desc="Type your current objective and set a countdown clock." />
        <ItemCard to="/calm/breath" eyebrow="Breath" title="Breath Regulation Node" desc="A smooth 4-4-4-4 box breathing visualizer." />
        <ItemCard to="/calm/ambient" eyebrow="Ambient" title="Ambient Acoustic Console" desc="Layer rain, brown noise, and waves to mask distractions." />
        <ItemCard to="/calm/mindful" eyebrow="Mindful" title="Mindful Metrics" desc="A quiet display of your accumulated focus minutes for the week." />
      </div>
    </Shell>
  ),
});
