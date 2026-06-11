import Link from "next/link";
import type { Character } from "@/lib/types";

export default function CharCard({ c }: { c: Character }) {
  return (
    <Link href={`/zi/${encodeURIComponent(c.char)}`} className="group block border border-ink/10 rounded-lg p-4 hover:border-[var(--color-vermilion)] transition bg-white/40">
      <div className="text-5xl font-serif text-center mb-2 group-hover:text-[var(--color-vermilion)]">{c.char}</div>
      <div className="text-center text-sm text-ink/70">{c.pinyin.join(" / ")}</div>
      <div className="text-center text-xs text-ink/50 mt-1 line-clamp-1">{c.meanings[0]}</div>
    </Link>
  );
}
