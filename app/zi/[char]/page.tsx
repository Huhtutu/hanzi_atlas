import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCharacters, getCharacter, getAllTopics, getCharacterGlyphs } from "@/lib/data";
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
  const glyphs = await getCharacterGlyphs(c.char);
  const related = c.related.map(r => all.find(x => x.char === r)).filter((x): x is NonNullable<typeof x> => !!x);
  const charTopics = topics.filter(t => c.topics.includes(t.slug));

  return (
    <article className="relative max-w-5xl mx-auto px-4 py-12">
      {/* 山水画背景 — 若隐若现,贴在字形演变区背后 */}
      <div
        className="absolute left-0 right-0 top-[18rem] h-[28rem] pointer-events-none -z-10"
        style={{
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: "contain",
          backgroundPosition: "left bottom",
          backgroundRepeat: "no-repeat",
          opacity: 0.22,
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

      {/* === 字形演变区 — 顶部箭头时间轴 + 5列内容 === */}
      <section className="relative mb-14">
        {/* 顶部贯通时间轴：SVG 横线 + 末尾箭头 + 5圆点对齐列中心 */}
        <div className="relative h-4 mb-4">
          {/* SVG 横线 + 箭头 */}
          <svg
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-3 overflow-visible"
            viewBox="0 0 100 6"
            preserveAspectRatio="none"
            aria-hidden
          >
            <line
              x1="0" y1="3" x2="98" y2="3"
              stroke="var(--color-vermilion)"
              strokeWidth="0.4"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points="96,1 100,3 96,5"
              fill="none"
              stroke="var(--color-vermilion)"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* 5 个圆点(对齐 5 列中心) */}
          <div className="absolute inset-0 grid grid-cols-5">
            {SCRIPT_ORDER.map(k => (
              <div key={k} className="flex justify-center items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-vermilion)]" />
              </div>
            ))}
          </div>
        </div>

        {/* 5列内容：标签 → 字形堆叠 → 文字说明 */}
        <div className="grid grid-cols-5 gap-4 md:gap-6">
          {SCRIPT_ORDER.map((k: ScriptKey) => {
            const imgs = glyphs[k];
            const stageText = c.etymology.stages.find(s => s.script === k)?.text ?? "";
            const hasImg = imgs.length > 0;
            return (
              <div key={k} className="flex flex-col items-center text-center">
                {/* 顶部标签 — 朱砂色 */}
                <span className="text-sm md:text-base text-[var(--color-vermilion)] tracking-wider mb-5">
                  {SCRIPT_LABELS[k]}
                </span>

                {/* 字形展示 — 竖向堆叠,无卡片边框 */}
                <div className="flex flex-col items-center gap-3 mb-5 min-h-[5rem]">
                  {hasImg ? (
                    imgs.map(img => (
                      <img
                        key={img.src}
                        src={img.src}
                        alt={img.alt}
                        className="max-h-24 w-auto object-contain mix-blend-multiply"
                      />
                    ))
                  ) : (
                    <span className="text-ink/20 text-xs mt-6">暂缺</span>
                  )}
                </div>

                {/* 演变文字说明 */}
                <p className="text-[11px] md:text-xs text-ink/70 leading-relaxed">{stageText}</p>
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
