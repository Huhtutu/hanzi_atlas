"use client";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey, type Character } from "@/lib/types";

export default function ScriptSwitcher({
  c, active, onChange,
}: { c: Character; active: ScriptKey; onChange: (k: ScriptKey) => void }) {
  return (
    <div className="flex gap-2 flex-wrap" role="tablist" aria-label="字形切换">
      {SCRIPT_ORDER.map(k => {
        const info = c.scripts[k];
        const enabled = info.available;
        const isActive = k === active;
        return (
          <button
            key={k}
            role="tab"
            aria-selected={isActive}
            disabled={!enabled}
            onClick={() => onChange(k)}
            title={enabled ? "" : "暂无此字古文写法,欢迎贡献"}
            className={`px-3 py-1.5 rounded border text-sm transition
              ${isActive ? "bg-[var(--color-vermilion)] text-paper border-[var(--color-vermilion)]" : "border-ink/20"}
              ${enabled ? "" : "opacity-40 cursor-not-allowed"}`}
          >
            {SCRIPT_LABELS[k]}
          </button>
        );
      })}
    </div>
  );
}
