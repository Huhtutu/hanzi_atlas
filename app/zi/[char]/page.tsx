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
    <article className="grid md:grid-cols-[1fr_280px] gap-12">
      <div>
        <EvolutionSection c={c} />
        <dl className="grid grid-cols-3 gap-4 mt-10 text-sm">
          <div><dt className="text-ink/50">拼音</dt><dd>{c.pinyin.join(" / ")}</dd></div>
          <div><dt className="text-ink/50">部首</dt><dd>{c.radical}</dd></div>
          <div><dt className="text-ink/50">笔画</dt><dd>{c.strokes}</dd></div>
        </dl>
        <section className="mt-10">
          <h2 className="font-serif text-xl mb-2">释义</h2>
          <ol className="list-decimal list-inside space-y-1 text-ink/85">
            {c.meanings.map((m, i) => <li key={i}>{m}</li>)}
          </ol>
        </section>
      </div>

      <aside className="space-y-8">
        {charTopics.length > 0 && (
          <div>
            <h3 className="font-serif text-base mb-2 text-ink/70">收录于专题</h3>
            <ul className="space-y-1">
              {charTopics.map(t => (
                <li key={t.slug}><Link href={`/topic/${t.slug}`} className="underline">{t.title}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {related.length > 0 && (
          <div>
            <h3 className="font-serif text-base mb-2 text-ink/70">相关字</h3>
            <div className="grid grid-cols-2 gap-2">
              {related.map(r => <CharCard key={r.char} c={r} />)}
            </div>
          </div>
        )}
      </aside>
    </article>
  );
}
