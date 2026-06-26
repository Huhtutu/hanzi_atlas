import Link from "next/link";
import { getAllIdioms } from "@/lib/data";

export default async function IdiomsPage() {
  const idioms = await getAllIdioms();

  return (
    <article className="max-w-4xl mx-auto">
      <header className="text-center mb-12 border-b border-[var(--color-rule)] pb-10">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
          <span>典 故</span>
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
        </div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-3">成语典故</h1>
        <p className="text-ink/60 leading-loose max-w-2xl mx-auto">
          从古人故事里读成语,在简短四字中看见经验、警醒与智慧。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {idioms.map(idiom => (
          <Link key={idiom.slug} href={`/idioms/${idiom.slug}`} className="book-card block rounded-sm p-6 group">
            <div className="text-[10px] tracking-[0.35em] text-[var(--color-vermilion)] mb-3">{idiom.source}</div>
            <h2 className="font-serif text-2xl text-ink group-hover:text-[var(--color-vermilion)] transition-colors mb-4">
              {idiom.title}
            </h2>
            <p className="text-ink/70 leading-loose mb-5">{idiom.meaning}</p>
            <div className="flex flex-wrap gap-2">
              {idiom.tags.map(tag => (
                <span key={tag} className="text-xs tracking-wider text-ink/45 border border-[var(--color-rule)] px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
