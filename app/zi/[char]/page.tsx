import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCharacters, getCharacter, getAllTopics } from "@/lib/data";
import EvolutionSection from "@/components/EvolutionSection";
import CharCard from "@/components/CharCard";

export async function generateStaticParams() {
  const chars = await getAllCharacters();
  return chars.map(c => ({ char: c.char }));
}

export default async function CharPage({ params }: { params: Promise<{ char: string }> }) {
  const { char } = await params;
  const decoded = decodeURIComponent(char);
  const c = await getCharacter(decoded);
  if (!c) notFound();

  const all = await getAllCharacters();
  const topics = await getAllTopics();
  const related = c.related.map(r => all.find(x => x.char === r)).filter((x): x is NonNullable<typeof x> => !!x);
  const charTopics = topics.filter(t => c.topics.includes(t.slug));

  return (
    <article className="grid md:grid-cols-[1fr_280px] gap-14">
      <div>
        <header className="mb-8 text-center md:text-left">
          <div className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-2">本 卷 字</div>
          <h1 className="font-serif text-4xl text-ink tracking-wider inline-block">{c.char}</h1>
        </header>

        <EvolutionSection c={c} />

        <dl className="grid grid-cols-3 gap-6 mt-12 border-y border-[var(--color-rule)] py-5 text-sm">
          <div>
            <dt className="text-xs text-ink/50 tracking-widest mb-1">拼音</dt>
            <dd className="text-ink/85 tracking-wider">{c.pinyin.join(" / ")}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50 tracking-widest mb-1">部首</dt>
            <dd className="text-ink/85">{c.radical}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50 tracking-widest mb-1">笔画</dt>
            <dd className="text-ink/85">{c.strokes}</dd>
          </div>
        </dl>

        <section className="mt-12">
          <h2 className="chapter-mark font-serif text-xl text-ink mb-4 tracking-wider">释义</h2>
          <ol className="space-y-2 text-ink/85 leading-relaxed">
            {c.meanings.map((m, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--color-vermilion)] text-sm mt-0.5">{i + 1}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <aside className="space-y-10 md:pt-1">
        {charTopics.length > 0 && (
          <div>
            <h3 className="text-[10px] tracking-[0.35em] text-ink/50 mb-3">收录于专题</h3>
            <ul className="space-y-2">
              {charTopics.map(t => (
                <li key={t.slug}>
                  <Link href={`/topic/${t.slug}`} className="link-cinnabar font-serif text-base text-ink">
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {related.length > 0 && (
          <div>
            <h3 className="text-[10px] tracking-[0.35em] text-ink/50 mb-3">相关字</h3>
            <div className="grid grid-cols-2 gap-3">
              {related.map(r => <CharCard key={r.char} c={r} />)}
            </div>
          </div>
        )}
      </aside>
    </article>
  );
}
