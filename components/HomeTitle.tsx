"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey } from "@/lib/types";

export default function HomeTitle() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % SCRIPT_ORDER.length), 1800);
    return () => clearInterval(id);
  }, []);
  const k: ScriptKey = SCRIPT_ORDER[idx];
  return (
    <div className="text-center mt-20 mb-8">
      <div className="flex items-center justify-center gap-4 text-[var(--color-vermilion)] mb-6 tracking-[0.4em] text-xs">
        <span className="w-12 h-px bg-[var(--color-vermilion)]/40" />
        <span>汉 字 图 志</span>
        <span className="w-12 h-px bg-[var(--color-vermilion)]/40" />
      </div>
      <div className="h-44 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-[7rem] leading-none font-serif text-ink tracking-[0.05em]"
          >
            汉字图志
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="text-sm text-ink/55 mt-4 tracking-wider">
        当前字形 · <span className="text-ink/75">{SCRIPT_LABELS[k]}</span>
      </p>
    </div>
  );
}
