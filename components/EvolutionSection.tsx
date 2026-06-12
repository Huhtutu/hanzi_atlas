"use client";
import { useState } from "react";
import EvolutionAnimation from "./EvolutionAnimation";
import { SCRIPT_ORDER, SCRIPT_LABELS, type Character, type ScriptKey } from "@/lib/types";

export default function EvolutionSection({ c }: { c: Character }) {
  const first = SCRIPT_ORDER.find(k => c.scripts[k].available) ?? "regular";
  const [stage, setStage] = useState<ScriptKey>(first);
  const stageText = c.etymology.stages.find(s => s.script === stage)?.text
    ?? c.etymology.stages[c.etymology.stages.length - 1].text;

  return (
    <section className="space-y-6">
      <p className="text-ink/85 leading-relaxed">{c.etymology.intro}</p>
      <EvolutionAnimation c={c} onStageChange={setStage} />
      <div>
        <h3 className="font-serif text-base text-ink/70 mb-1">{SCRIPT_LABELS[stage]}阶段</h3>
        <p className="text-ink/85 leading-relaxed">{stageText}</p>
      </div>
      <p className="text-ink/85 leading-relaxed">{c.etymology.modern}</p>
    </section>
  );
}
