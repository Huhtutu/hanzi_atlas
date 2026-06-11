"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Character } from "@/lib/types";

export default function CharCardMorph({ c }: { c: Character }) {
  return (
    <Link href={`/zi/${encodeURIComponent(c.char)}`} className="block border border-ink/10 rounded-lg p-4 hover:border-[var(--color-vermilion)] transition bg-white/40">
      <motion.div
        initial={{ opacity: 0.6, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-6xl font-serif text-center mb-2"
      >
        {c.char}
      </motion.div>
      <div className="text-center text-sm text-ink/70">{c.pinyin.join(" / ")}</div>
      <div className="text-center text-[10px] text-ink/40 mt-1">(占位形变动画)</div>
    </Link>
  );
}
