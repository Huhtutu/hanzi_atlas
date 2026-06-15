import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCharacters, getCharacter, getAllTopics } from "@/lib/data";
import CharCard from "@/components/CharCard";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey } from "@/lib/types";
import headerBg from "@/assets/img/hanzi.png";

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
    <div className="relative min-h-screen">
      {/* 顶部装饰卷轴 — 古塔远景 */}
      <div
        className="relative w-full h-48 md:h-64 overflow-hidden"
        style={{
          backgroundImage: `url(${headerBg.src})`,
          backgroundSize: "contain",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          opacity: 0.9,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-paper)]" />
      </div>

      {/* 顶部装饰边框 — 古籍书眉 */}
      <div className="max-w-4xl mx-auto pt-6 px-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px flex-1 bg-[var(--color-rule)]" />
          <span className="w-2 h-2 rotate-45 border border-[var(--color-vermilion)]/40" />
          <span className="h-px flex-1 bg-[var(--color-rule)]" />
        </div>
      </div>

      <article className="relative max-w-4xl mx-auto px-4">
        {/* 页头：田字格 + 字符信息 */}
        <header className="text-center mb-12">
          <div className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-5">本 卷 字</div>
          <div className="flex justify-center mb-6">
            <div className="tian-zi-ge" style={{ width: "8rem", height: "8rem" }}>
              <span className="font-serif text-6xl text-ink">{c.char}</span>
            </div>
          </div>
          <dl className="flex justify-center gap-8 text-sm text-ink/65">
            <div>
              <dt className="text-[10px] tracking-widest text-ink/40 mb-1 text-center">拼音</dt>
              <dd className="tracking-wider">{c.pinyin.join(" / ")}</dd>
            </div>
            <div className="w-px bg-[var(--color-rule)]" />
            <div>
              <dt className="text-[10px] tracking-widest text-ink/40 mb-1 text-center">部首</dt>
              <dd>{c.radical}</dd>
            </div>
            <div className="w-px bg-[var(--color-rule)]" />
            <div>
              <dt className="text-[10px] tracking-widest text-ink/40 mb-1 text-center">笔画</dt>
              <dd className="text-center">{c.strokes}</dd>
            </div>
          </dl>
        </header>

        {/* 字源总述 */}
        <section className="mb-14">
          <h2 className="chapter-mark font-serif text-lg text-ink mb-5 tracking-wider">字源解说</h2>
          <p className="text-ink/85 leading-loose indent-8 first-letter:text-[var(--color-vermilion)] first-letter:font-serif first-letter:text-2xl first-letter:mr-1">
            {c.etymology.intro}
          </p>
        </section>

        {/* 字形演变画廊 — 从左到右横向排列 */}
        <section className="mb-14">
          <h2 className="chapter-mark font-serif text-lg text-ink mb-6 tracking-wider">字形演变</h2>
          <div className="grid grid-cols-5 gap-4">
            {SCRIPT_ORDER.map((k: ScriptKey) => {
              const info = c.scripts[k];
              const stageText = c.etymology.stages.find(s => s.script === k)?.text ?? "";
              return (
                <div key={k} className="text-center">
                  <div
                    className={`rounded-sm border ${
                      info.available
                        ? "border-[var(--color-rule)] bg-[var(--color-paper-2)]/60"
                        : "border-dashed border-[var(--color-rule)] bg-[var(--color-paper)]/20"
                    } p-4 mb-2 transition-shadow hover:shadow-sm`}
                  >
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
        <section className="mb-14">
          <h2 className="chapter-mark font-serif text-lg text-ink mb-5 tracking-wider">释义</h2>
          <ol className="space-y-3 text-ink/85 leading-relaxed">
            {c.meanings.map((m, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--color-vermilion)] font-serif text-sm mt-0.5 shrink-0">{i + 1}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 现代用法 */}
        <section className="mb-14 bg-[var(--color-paper-2)]/80 border-l-2 border-[var(--color-vermilion)] px-7 py-6">
          <h3 className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-3">现代用法</h3>
          <p className="text-ink/85 leading-loose">{c.etymology.modern}</p>
        </section>

        {/* 底部：专题与相关字 */}
        {(charTopics.length > 0 || related.length > 0) && (
          <div className="border-t border-[var(--color-rule)] pt-10 pb-16 grid grid-cols-1 md:grid-cols-2 gap-10">
            {charTopics.length > 0 && (
              <div>
                <h3 className="text-[10px] tracking-[0.35em] text-ink/50 mb-4">收录于专题</h3>
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
                <h3 className="text-[10px] tracking-[0.35em] text-ink/50 mb-4">相关字</h3>
                <div className="grid grid-cols-2 gap-3">
                  {related.map(r => <CharCard key={r.char} c={r} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </article>

      {/* 底部装饰边框 */}
      <div className="max-w-4xl mx-auto pb-8 px-4">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--color-rule)]" />
          <span className="w-2 h-2 rotate-45 border border-[var(--color-vermilion)]/40" />
          <span className="h-px flex-1 bg-[var(--color-rule)]" />
        </div>
      </div>
    </div>
  );
}
