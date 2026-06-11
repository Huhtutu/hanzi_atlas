import Link from "next/link";
import type { Topic } from "@/lib/types";

export default function TopicCoverCard({ t }: { t: Topic }) {
  return (
    <Link href={`/topic/${t.slug}`} className="block border border-ink/10 rounded-lg p-6 hover:border-[var(--color-vermilion)] transition group bg-white/40">
      <div className="text-xs text-[var(--color-vermilion)] tracking-widest mb-2">专题</div>
      <h3 className="font-serif text-2xl mb-1 group-hover:text-[var(--color-vermilion)]">{t.title}</h3>
      <p className="text-sm text-ink/60">{t.subtitle}</p>
    </Link>
  );
}
