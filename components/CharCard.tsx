import Link from "next/link";
import type { Character } from "@/lib/types";

export default function CharCard({ c }: { c: Character }) {
  return (
    <Link
      href={`/zi/${encodeURIComponent(c.char)}`}
      className="book-card group block rounded-sm p-5 text-center"
    >
      <div className="text-5xl font-serif text-ink group-hover:text-[var(--color-vermilion)] transition-colors mb-3">
        {c.char}
      </div>
      <div className="mx-auto w-8 h-px bg-[var(--color-rule-strong)] mb-3" />
      <div className="text-sm text-ink/70 tracking-wider">{c.pinyin.join(" / ")}</div>
      <div className="text-xs text-ink/50 mt-1 line-clamp-1">{c.meanings[0]}</div>
    </Link>
  );
}
