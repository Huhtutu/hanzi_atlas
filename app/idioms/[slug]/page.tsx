import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllIdioms, getIdiom } from "@/lib/data";

export async function generateStaticParams() {
  const idioms = await getAllIdioms();
  return idioms.map(i => ({ slug: i.slug }));
}

export default async function IdiomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idiom = await getIdiom(slug);
  if (!idiom) notFound();

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/idioms" className="link-cinnabar text-sm text-ink/65 hover:text-[var(--color-vermilion)]">
        返回成语典故
      </Link>

      <header className="text-center my-12 border-b border-[var(--color-rule)] pb-10">
        <div className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">成 语 典 故</div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-4">{idiom.title}</h1>
        <p className="text-ink/55 tracking-wider text-sm">{idiom.source}</p>
      </header>

      <section className="mb-10">
        <h2 className="chapter-mark font-serif text-xl text-ink mb-4 tracking-wider">典故故事</h2>
        <p className="text-ink/80 leading-loose indent-8">{idiom.story}</p>
      </section>

      <section className="mb-10 bg-[var(--color-paper-2)]/70 border-l-2 border-[var(--color-vermilion)] px-6 py-5">
        <h2 className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-3">寓意</h2>
        <p className="text-ink/80 leading-loose indent-8">{idiom.meaning}</p>
      </section>

      <section className="mb-10">
        <h2 className="chapter-mark font-serif text-xl text-ink mb-4 tracking-wider">今用</h2>
        <p className="text-ink/80 leading-loose indent-8">{idiom.usage}</p>
      </section>

      <div className="flex flex-wrap gap-2 pt-6 border-t border-[var(--color-rule)]">
        {idiom.tags.map(tag => (
          <span key={tag} className="text-xs tracking-wider text-ink/55 border border-[var(--color-rule)] px-3 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
