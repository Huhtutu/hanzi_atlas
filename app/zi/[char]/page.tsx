import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCharacters, getCharacter, getAllTopics } from "@/lib/data";
import CharCard from "@/components/CharCard";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey } from "@/lib/types";
import bgImage from "@/assets/img/hanzi.png";

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
    <article className="relative max-w-5xl mx-auto px-4 py-12">
      {/* 左侧山水画背景 — 若隐若现 */}
      <div
        className="fixed left-0 top-0 bottom-0 w-1/3 pointer-events-none -z-10 hidden lg:block"
        style={{
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: "contain",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
          opacity: 0.25,
        }}
      />

      {/* 页头：田字格 + 字符信息 */}
      <header className="text-center mb-10">
        <div className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">本 卷 字</div>
        <div className="flex justify-center mb-5">
          <div className="tian-zi-ge" style={{ width: "7rem", height: "7rem" }}>
            <span className="font-serif text-5xl text-ink">{c.char}</span>
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

      {/* === 上方：箭头 + 圆点时间线 === */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center gap-0">
          {/* 圆点 */}
          <div className="w-3 h-3 rounded-full bg-[var(--color-vermilion)] shrink-0" />
          {/* 向右箭头线 */}
          <div className="relative h-px w-24 md:w-48 bg-[var(--color-vermilion)]/60">
            <div className="absolute -right-1 -top-[3px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[8px] border-l-[var(--color-vermilion)]/60" />
          </div>
        </div>
      </div>

      {/* === 中部：字形演变 — 5列从左向右 === */}
      <section className="mb-12">
        <div className="grid grid-cols-5 gap-4 md:gap-6">
          {SCRIPT_ORDER.map((k: ScriptKey) => {
            const info = c.scripts[k];
            const stageText = c.etymology.stages.find(s => s.script === k)?.text ?? "";
            return (
              <div key={k} className="flex flex-col items-center text-center">
                {/* 圆点标记 */}
                <div className="w-2 h-2 rounded-full bg-[var(--color-vermilion)]/50 mb-3" />

                {/* SVG 字形 */}
                <div className={`w-full aspect-square flex items-center justify-center rounded-sm border ${
                  info.available
                    ? "border-[var(--color-rule)] bg-[var(--color-paper-2)]/70"
                    : "border-dashed border-[var(--color-rule)] bg-[var(--color-paper)]/30"
                } p-3 mb-3`}>
                  {info.available ? (
                    <img
                      src={info.glyphSrc ?? `/glyphs/${c.char}/${k}.svg`}
                      alt={`${c.char} ${SCRIPT_LABELS[k]}`}
                      className="w-full h-auto"
                    />
                  ) : (
                    <span className="text-ink/20 text-xs">暂缺</span>
                  )}
                </div>

                {/* 阶段标签 */}
                <span className="text-[10px] tracking-[0.2em] text-[var(--color-vermilion)] mb-2">
                  {SCRIPT_LABELS[k]}
                </span>

                {/* 演变文字说明 */}
                <p className="text-[11px] text-ink/60 leading-relaxed">{stageText}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* === 下方：文字介绍 === */}
      <div className="border-t border-[var(--color-rule)] pt-10">
        {/* 字源解说 */}
        <section className="mb-10">
          <h2 className="chapter-mark font-serif text-lg text-ink mb-4 tracking-wider">字源解说</h2>
          <p className="text-ink/80 leading-loose indent-8 first-letter:text-[var(--color-vermilion)] first-letter:font-serif first-letter:text-2xl first-letter:mr-1">
            {c.etymology.intro}
          </p>
        </section>

        {/* 释义 */}
        <section className="mb-10">
          <h2 className="chapter-mark font-serif text-lg text-ink mb-4 tracking-wider">释义</h2>
          <ol className="space-y-2 text-ink/80 leading-relaxed">
            {c.meanings.map((m, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--color-vermilion)] font-serif text-sm mt-0.5 shrink-0">{i + 1}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 现代用法 */}
        <section className="mb-10 bg-[var(--color-paper-2)]/70 border-l-2 border-[var(--color-vermilion)] px-6 py-5">
          <h3 className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-2">现代用法</h3>
          <p className="text-ink/80 leading-loose">{c.etymology.modern}</p>
        </section>

        {/* 收录专题 / 相关字 */}
        {(charTopics.length > 0 || related.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[var(--color-rule)]">
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
      </div>
    </article>
  );
}
