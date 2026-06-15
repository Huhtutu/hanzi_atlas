import Link from "next/link";
import type { SpringAutumnChapter } from "@/lib/types";

export default function SpringAutumnGrid({
  chapters,
  stories,
}: {
  chapters: SpringAutumnChapter[];
  stories: Record<string, string>;
}) {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl text-ink tracking-wider mb-2">一字春秋</h2>
        <div className="mx-auto w-12 h-px bg-[var(--color-rule-strong)] mb-4" />
        <p className="text-ink/60 text-sm tracking-widest">一字一世界 · 一画一春秋</p>
      </div>

      <div className="space-y-16">
        {chapters.map(ch => (
          <article key={ch.slug}>
            {/* 章节头 */}
            <div className="mb-6">
              <h3 className="chapter-mark font-serif text-xl text-ink tracking-wider mb-1">
                {ch.title}
              </h3>
              <p className="text-ink/50 text-xs tracking-widest mb-3">{ch.subtitle}</p>
              <p className="text-ink/70 text-sm leading-relaxed max-w-2xl">{ch.intro}</p>
            </div>

            {/* 字符九宫格 */}
            <div className="grid grid-cols-3 gap-2">
              {ch.chars.slice(0, 9).map(chr => (
                <Link
                  key={chr}
                  href={`/zi/${encodeURIComponent(chr)}`}
                  className="book-card group block rounded-sm p-3 transition-colors"
                >
                  {/* 田字格 */}
                  <div className="flex justify-center mb-2">
                    <div className="tian-zi-ge">
                      <span className="text-2xl font-serif text-ink group-hover:text-[var(--color-vermilion)] transition-colors">
                        {chr}
                      </span>
                    </div>
                  </div>

                  {/* 字源故事 */}
                  <p className="text-ink/65 text-[11px] leading-relaxed text-center line-clamp-4">
                    {stories[chr] ?? ""}
                  </p>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
