"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey } from "@/lib/types";

export default function HomeTitle() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % SCRIPT_ORDER.length), 1600);
    return () => clearInterval(id);
  }, []);
  const k: ScriptKey = SCRIPT_ORDER[idx];
  return (
    <div className="text-center my-12">
      <div className="h-40 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-8xl font-serif"
          >
            汉字图志
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="text-sm text-ink/60 mt-2">当前字形:{SCRIPT_LABELS[k]}(占位)</p>
    </div>
  );
}
