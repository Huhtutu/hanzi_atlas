import Link from "next/link";
import type { Topic } from "@/lib/types";

export default function TopicCoverCard({ t }: { t: Topic }) {
  return (
    <Link href={`/topic/${t.slug}`} className="book-card group block rounded-sm p-7">
      <div className="text-[10px] text-[var(--color-vermilion)] tracking-[0.35em] mb-3">专 · 题</div>
      <h3 className="font-serif text-2xl text-ink group-hover:text-[var(--color-vermilion)] transition-colors mb-2">
        {t.title}
      </h3>
      <p className="text-sm text-ink/60 leading-relaxed">{t.subtitle}</p>
    </Link>
  );
}
