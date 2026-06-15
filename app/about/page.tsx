import Link from "next/link";

export default function AboutPage() {
  return (
    <article className="max-w-2xl mx-auto">
      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
          <span>序</span>
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
        </div>
        <h1 className="font-serif text-4xl text-ink tracking-wider">关于本志</h1>
      </header>
      <section className="space-y-8 text-ink/85 leading-loose">
        <p>
          汉字图志是一个开源项目,目标是让任何对汉字感兴趣的人都能查到一个常用字从甲骨文到楷书的演化全程,并配以可读的字源故事。
        </p>
        <div>
          <h2 className="chapter-mark font-serif text-xl text-ink mb-3 tracking-wider">字体来源</h2>
          <p>
            甲骨文 / 金文 / 小篆 字形由项目自带的手工 SVG 与开源字体共同提供;隶书与楷书阶段使用思源宋体系列(SIL OFL 许可)。
          </p>
        </div>
        <div>
          <h2 className="chapter-mark font-serif text-xl text-ink mb-3 tracking-wider">如何贡献</h2>
          <p>
            欢迎通过 GitHub 提交 PR 添加新字、新专题或修订字源故事。详见{" "}
            <Link href="/" className="link-cinnabar">CONTRIBUTING.md</Link>。
          </p>
        </div>
      </section>
    </article>
  );
}
