"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey, type Character } from "@/lib/types";
import ScriptSwitcher from "./ScriptSwitcher";

export default function EvolutionAnimation({ c }: { c: Character }) {
  const firstAvailable = SCRIPT_ORDER.find(k => c.scripts[k].available) ?? "regular";
  const [active, setActive] = useState<ScriptKey>(firstAvailable);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const playable = SCRIPT_ORDER.filter(k => c.scripts[k].available);
    let i = 0;
    setActive(playable[0]);
    const id = setInterval(() => {
      i++;
      if (i >= playable.length) { setPlaying(false); clearInterval(id); return; }
      setActive(playable[i]);
    }, 1000);
    return () => clearInterval(id);
  }, [playing, c]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="h-48 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-[10rem] leading-none font-serif"
            aria-label={`${SCRIPT_LABELS[active]}写法`}
          >
            {c.char}
          </motion.div>
        </AnimatePresence>
      </div>
      <ScriptSwitcher c={c} active={active} onChange={k => { setPlaying(false); setActive(k); }} />
      <button
        onClick={() => setPlaying(true)}
        disabled={playing}
        className="text-sm px-4 py-2 border border-ink/20 rounded hover:bg-ink/5 disabled:opacity-50"
      >
        {playing ? "正在播放…" : "▶ 播放演化动画"}
      </button>
      <p className="text-xs text-ink/40">(占位:目前所有字体都用衬线楷书渲染,真实字体待接入)</p>
    </div>
  );
}
