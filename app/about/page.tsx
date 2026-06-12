import Link from "next/link";

export default function AboutPage() {
  return (
    <article className="prose-like max-w-2xl">
      <h1 className="font-serif text-3xl mb-6">关于</h1>
      <section className="space-y-4 text-ink/85 leading-relaxed">
        <p>(占位)汉字图志是一个开源项目,目标是让任何对汉字感兴趣的人都能查到一个常用字从甲骨文到楷书的演化全程,并配以可读的字源故事。</p>
        <h2 className="font-serif text-xl mt-8">字体来源</h2>
        <p>(占位)甲骨文 / 金文 / 小篆字体待选型与许可证审查(优先 SIL OFL)。</p>
        <h2 className="font-serif text-xl mt-8">如何贡献</h2>
        <p>欢迎通过 GitHub 提交 PR 添加新字、新专题或修订字源故事。详见 <Link href="/" className="underline">CONTRIBUTING.md</Link>。</p>
      </section>
    </article>
  );
}
