import Link from "next/link";
import { getAllPoems } from "@/lib/data";

export default async function PoemsPage() {
  const poems = await getAllPoems();

  return (
    <article className="max-w-5xl mx-auto">
      <header className="text-center mb-14 border-b border-[var(--color-rule)] pb-10">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
          <span>诗 词 拾 萃</span>
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
        </div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-3">诗词拾萃</h1>
        <p className="text-ink/60 leading-loose max-w-2xl mx-auto">
          摘取古典诗词中的月色、春声、江雪与登临,在短章里照见山河与心事。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {poems.map(poem => (
          <Link key={poem.slug} href={`/poems/${poem.slug}`} className="book-card block rounded-sm overflow-hidden group">
            {poem.imageSrc && (
              <div className="aspect-[4/3] border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                <img src={poem.imageSrc} alt={poem.imageAlt ?? poem.title} className="h-full w-full object-cover mix-blend-multiply" />
              </div>
            )}
            <div className="p-7 text-center">
              <div className="text-[10px] tracking-[0.35em] text-[var(--color-vermilion)] mb-3">
                {poem.dynasty} · {poem.author}
              </div>
              <h2 className="font-serif text-2xl text-ink group-hover:text-[var(--color-vermilion)] transition-colors mb-5">
                {poem.title}
              </h2>
              <div className="space-y-1.5 text-lg font-serif text-ink/80 leading-loose mb-6">
                {poem.lines.map(line => <p key={line}>{line}</p>)}
              </div>
              <div className="mx-auto w-8 h-px bg-[var(--color-rule-strong)] mb-4" />
              <p className="text-sm text-ink/55 leading-loose text-left">{poem.intro}</p>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
