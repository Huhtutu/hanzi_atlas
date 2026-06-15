import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCharacters, getCharacter, getAllTopics } from "@/lib/data";
import CharCard from "@/components/CharCard";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey } from "@/lib/types";

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
    <article className="max-w-4xl mx-auto">
      {/* 页头：田字格 + 字符信息 */}
      <header className="text-center mb-10">
        <div className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-5">本 卷 字</div>
        <div className="flex justify-center mb-5">
          <div className="tian-zi-ge" style={{ width: "7rem", height: "7rem" }}>
            <span className="font-serif text-5xl text-ink">{c.char}</span>
          </div>
        </div>
        <dl className="flex justify-center gap-6 text-sm text-ink/65">
          <div>
            <dt className="text-[10px] tracking-widest text-ink/40 mb-0.5 text-center">拼音</dt>
            <dd className="tracking-wider">{c.pinyin.join(" / ")}</dd>
          </div>
          <div className="w-px bg-[var(--color-rule)]" />
          <div>
            <dt className="text-[10px] tracking-widest text-ink/40 mb-0.5 text-center">部首</dt>
            <dd>{c.radical}</dd>
          </div>
          <div className="w-px bg-[var(--color-rule)]" />
          <div>
            <dt className="text-[10px] tracking-widest text-ink/40 mb-0.5 text-center">笔画</dt>
            <dd className="text-center">{c.strokes}</dd>
          </div>
        </dl>
      </header>

      {/* 字源总述 */}
      <p className="text-ink/85 leading-loose mb-12 first-letter:text-[var(--color-vermilion)] first-letter:font-serif first-letter:text-2xl first-letter:mr-1">
        {c.etymology.intro}
      </p>

      {/* 字形演变画廊 — 从左到右横向排列 */}
      <section className="mb-12">
        <h2 className="chapter-mark font-serif text-lg text-ink mb-6 tracking-wider">字形演变</h2>
        <div className="grid grid-cols-5 gap-3">
          {SCRIPT_ORDER.map((k: ScriptKey) => {
            const info = c.scripts[k];
            const stageText = c.etymology.stages.find(s => s.script === k)?.text ?? "";
            return (
              <div key={k} className="text-center">
                <div className={`rounded-sm border ${info.available ? "border-[var(--color-rule)] bg-[var(--color-paper-2)]/40" : "border-dashed border-[var(--color-rule)] bg-[var(--color-paper)]/20"} p-3 mb-2`}>
                  {info.available ? (
                    <img
                      src={info.glyphSrc ?? `/glyphs/${c.char}/${k}.svg`}
                      alt={`${c.char} ${SCRIPT_LABELS[k]}`}
                      className="w-full h-auto text-ink"
                    />
                  ) : (
                    <div className="text-ink/20 text-sm">暂缺</div>
                  )}
                </div>
                <div className="text-[10px] tracking-[0.2em] text-[var(--color-vermilion)] mb-1">
                  {SCRIPT_LABELS[k]}
                </div>
                <p className="text-[11px] text-ink/55 leading-relaxed line-clamp-4">{stageText}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 释义 */}
      <section className="mb-12">
        <h2 className="chapter-mark font-serif text-lg text-ink mb-4 tracking-wider">释义</h2>
        <ol className="space-y-2 text-ink/85 leading-relaxed">
          {c.meanings.map((m, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[var(--color-vermilion)] text-sm mt-0.5">{i + 1}</span>
              <span>{m}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 现代用法 */}
      <section className="mb-12 bg-[var(--color-paper-2)] border-l-2 border-[var(--color-vermilion)] px-6 py-5">
        <h3 className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-2">现代用法</h3>
        <p className="text-ink/85 leading-loose">{c.etymology.modern}</p>
      </section>

      {/* 底部：专题与相关字 */}
      {(charTopics.length > 0 || related.length > 0) && (
        <div className="border-t border-[var(--color-rule)] pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </div>
      )}
    </article>
  );
}
