import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPoems, getPoem } from "@/lib/data";

export async function generateStaticParams() {
  const poems = await getAllPoems();
  return poems.map(p => ({ slug: p.slug }));
}

export default async function PoemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const poem = await getPoem(slug);
  if (!poem) notFound();

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/poems" className="link-cinnabar text-sm text-ink/65 hover:text-[var(--color-vermilion)]">
        返回诗词
      </Link>

      <header className="text-center my-12 border-b border-[var(--color-rule)] pb-10">
        <div className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">诗 词 赏 析</div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-4">{poem.title}</h1>
        <p className="text-ink/55 tracking-wider text-sm">{poem.dynasty} · {poem.author}</p>
      </header>

      <section className="text-center font-serif text-2xl leading-loose text-ink mb-12">
        {poem.lines.map(line => <p key={line}>{line}</p>)}
      </section>

      <section className="mb-10">
        <h2 className="chapter-mark font-serif text-xl text-ink mb-4 tracking-wider">诗意导读</h2>
        <p className="text-ink/80 leading-loose indent-8">{poem.intro}</p>
      </section>

      <section className="mb-10 bg-[var(--color-paper-2)]/70 border-l-2 border-[var(--color-vermilion)] px-6 py-5">
        <h2 className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-3">赏析</h2>
        <p className="text-ink/80 leading-loose indent-8">{poem.appreciation}</p>
      </section>

      <div className="flex flex-wrap gap-2 pt-6 border-t border-[var(--color-rule)]">
        {poem.tags.map(tag => (
          <span key={tag} className="text-xs tracking-wider text-ink/55 border border-[var(--color-rule)] px-3 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
