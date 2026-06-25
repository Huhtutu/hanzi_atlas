import Link from "next/link";
import { getAllPoems } from "@/lib/data";

export default async function PoemsPage() {
  const poems = await getAllPoems();

  return (
    <article className="max-w-4xl mx-auto">
      <header className="text-center mb-12 border-b border-[var(--color-rule)] pb-10">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
          <span>诗 词</span>
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
        </div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-3">古诗词赏析</h1>
        <p className="text-ink/60 leading-loose max-w-2xl mx-auto">
          选读古典诗词,在字句之间看见山河、时序与心事。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {poems.map(poem => (
          <Link key={poem.slug} href={`/poems/${poem.slug}`} className="book-card block rounded-sm p-6 group">
            <div className="text-[10px] tracking-[0.35em] text-[var(--color-vermilion)] mb-3">
              {poem.dynasty} · {poem.author}
            </div>
            <h2 className="font-serif text-2xl text-ink group-hover:text-[var(--color-vermilion)] transition-colors mb-4">
              {poem.title}
            </h2>
            <div className="space-y-1 text-ink/75 leading-relaxed mb-5">
              {poem.lines.map(line => <p key={line}>{line}</p>)}
            </div>
            <p className="text-sm text-ink/55 leading-relaxed line-clamp-2">{poem.intro}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
