"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Character } from "@/lib/types";

export default function CharCardMorph({ c }: { c: Character }) {
  return (
    <Link
      href={`/zi/${encodeURIComponent(c.char)}`}
      className="book-card group block rounded-sm p-5 text-center"
    >
      <motion.div
        initial={{ opacity: 0.7, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-6xl font-serif text-ink group-hover:text-[var(--color-vermilion)] transition-colors mb-3"
      >
        {c.char}
      </motion.div>
      <div className="mx-auto w-8 h-px bg-[var(--color-rule-strong)] mb-3" />
      <div className="text-sm text-ink/70 tracking-wider">{c.pinyin.join(" / ")}</div>
    </Link>
  );
}
