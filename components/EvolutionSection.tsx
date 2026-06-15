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
    <section className="space-y-10">
      <p className="text-ink/85 leading-loose first-letter:text-[var(--color-vermilion)] first-letter:font-serif first-letter:text-2xl first-letter:mr-1">
        {c.etymology.intro}
      </p>

      <div className="border-y border-[var(--color-rule)] py-10">
        <EvolutionAnimation c={c} onStageChange={setStage} />
      </div>

      <div className="bg-[var(--color-paper-2)] border-l-2 border-[var(--color-vermilion)] px-6 py-5">
        <h3 className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-2">
          {SCRIPT_LABELS[stage]}
        </h3>
        <p className="text-ink/85 leading-loose">{stageText}</p>
      </div>

      <p className="text-ink/85 leading-loose">{c.etymology.modern}</p>
    </section>
  );
}
