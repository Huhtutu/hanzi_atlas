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
        return SCRIPT_ORDER[(idx + 1) % SCRIPT_ORDER.length];
      });
    };
    const delay = active === "regular" ? REGULAR_HOLD_MS : STEP_MS;
    timer.current = setTimeout(tick, delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [active, playing, reduced]);

  const current = c.scripts[active];
  const src = current.glyphSrc;

  return (
    <div className="flex flex-col items-center gap-8 select-none">
      {/* 时间轴 */}
      <ol className="flex items-center">
        {SCRIPT_ORDER.map((k, i) => {
          const isActive = k === active;
          const info = c.scripts[k];
          return (
            <li key={k} className="flex items-center">
              <div className="flex flex-col items-center gap-2 w-16">
                <button
                  onClick={() => { setPlaying(false); setActive(k); }}
                  aria-label={`切换到${SCRIPT_LABELS[k]}`}
                  className={`h-2.5 w-2.5 rounded-full border transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-vermilion)] border-[var(--color-vermilion)] scale-125"
                      : info.available
                      ? "border-ink/40 hover:border-[var(--color-vermilion)]"
                      : "border-ink/20"
                  }`}
                />
                <span className={`text-[11px] tracking-wider transition-colors ${
                  isActive ? "text-[var(--color-vermilion)]" : "text-ink/60"
                }`}>
                  {SCRIPT_LABELS[k]}
                </span>
                {!info.available && (
                  <span className="text-[9px] text-ink/35 tracking-wider">暂缺</span>
                )}
              </div>
              {i < SCRIPT_ORDER.length - 1 && (
                <span aria-hidden className="w-6 h-px bg-[var(--color-rule-strong)] -mt-5" />
              )}
            </li>
          );
        })}
      </ol>

      {/* 字形画布 */}
      <button
        onClick={() => setPlaying(p => !p)}
        aria-label={playing ? "暂停演变" : "播放演变"}
        className="relative w-72 h-72 flex items-center justify-center rounded-sm border border-[var(--color-rule)] bg-[var(--color-paper-2)]/40 hover:border-[var(--color-rule-strong)] transition-colors group"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={src ?? `/glyphs/${c.char}/${active}.svg`}
            alt={`${c.char} ${SCRIPT_LABELS[active]}`}
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            transition={{ duration: reduced ? 0 : 0.28, ease: "easeOut" }}
            className="w-[78%] h-[78%] text-ink"
          />
        </AnimatePresence>
        <span className="absolute bottom-3 right-3 text-[10px] tracking-widest text-ink/35 opacity-0 group-hover:opacity-100 transition-opacity">
          {playing ? "点击暂停" : "点击继续"}
        </span>
      </button>

      <p className="text-[11px] text-ink/45 tracking-widest">
        甲骨 · 金 · 篆 · 隶 · 楷
      </p>
    </div>
  );
}
