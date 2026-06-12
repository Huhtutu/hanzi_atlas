"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey, type Character } from "@/lib/types";

const STEP_MS = 1600;
const REGULAR_HOLD_MS = 2400;

interface Props {
  c: Character;
  onStageChange?: (s: ScriptKey) => void;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function EvolutionAnimation({ c, onStageChange }: Props) {
  const firstReal = SCRIPT_ORDER.find(k => c.scripts[k].available) ?? "regular";
  const [active, setActive] = useState<ScriptKey>(firstReal);
  const [playing, setPlaying] = useState(true);
  const reduced = usePrefersReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { onStageChange?.(active); }, [active, onStageChange]);

  useEffect(() => {
    if (reduced || !playing) return;
    const tick = () => {
      setActive(prev => {
        const idx = SCRIPT_ORDER.indexOf(prev);
        const next = SCRIPT_ORDER[(idx + 1) % SCRIPT_ORDER.length];
        return next;
      });
    };
    const delay = active === "regular" ? REGULAR_HOLD_MS : STEP_MS;
    timer.current = setTimeout(tick, delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [active, playing, reduced]);

  const current = c.scripts[active];
  const src = current.glyphSrc;

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <ol className="flex items-center gap-2">
        {SCRIPT_ORDER.map(k => {
          const isActive = k === active;
          const info = c.scripts[k];
          return (
            <li key={k} className="flex flex-col items-center gap-1">
              <button
                onClick={() => { setPlaying(false); setActive(k); }}
                aria-label={`切换到${SCRIPT_LABELS[k]}`}
                className={`h-3 w-3 rounded-full border transition-colors ${isActive ? "bg-vermilion border-vermilion" : "border-ink/40"}`}
              />
              <span className={`text-xs ${isActive ? "text-vermilion" : "text-ink/60"}`}>{SCRIPT_LABELS[k]}</span>
              {!info.available && <span className="text-[10px] text-ink/40">暂缺</span>}
            </li>
          );
        }).reduce<React.ReactNode[]>((acc, node, i, arr) => {
          acc.push(node);
          if (i < arr.length - 1) acc.push(<li key={`sep-${i}`} aria-hidden className="w-8 h-px bg-ink/20 mt-1.5" />);
          return acc;
        }, [])}
      </ol>

      <button
        onClick={() => setPlaying(p => !p)}
        aria-label={playing ? "暂停演变" : "播放演变"}
        className="relative w-64 h-64 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={src ?? `/glyphs/${c.char}/${active}.svg`}
            alt={`${c.char} ${SCRIPT_LABELS[active]}`}
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
            className="w-full h-full text-ink"
          />
        </AnimatePresence>
      </button>

      <p className="text-xs text-ink/50">{playing ? "点击画面暂停" : "点击画面继续"}</p>
    </div>
  );
}
