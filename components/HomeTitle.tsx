export default function HomeTitle() {
  return (
    <div className="text-center py-16 max-w-2xl mx-auto">
      {/* 朱砂装饰 */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="w-16 h-px bg-[var(--color-vermilion)]/40" />
        <span className="text-[var(--color-vermilion)] tracking-[0.3em] text-xs">序</span>
        <span className="w-16 h-px bg-[var(--color-vermilion)]/40" />
      </div>

      {/* 标题 */}
      <h1 className="font-serif text-4xl text-ink tracking-wider mb-8">
        关于汉字图志
      </h1>

      {/* 序文 — 古籍疏行风格 */}
      <div className="text-ink/75 text-sm leading-[2.2] tracking-wider text-left indent-8">
        <p>
            收录常用汉字三千余字，每字依次列出甲骨文、金文、小篆、隶书、楷书五种字体，以简明易懂的方式展示汉字形体的演变过程，清晰呈现汉字发展的历史脉络。读者可从中直观了解字形源流与演变规律，深入理解汉字背后蕴含的文化逻辑。旨在帮助中小学生及外国汉语学习者更真切地认识汉字、感知中华文化，推动汉字的传播与中文文化的交流。
        </p>
      </div>

      {/* 底部装饰 */}
      <div className="mx-auto w-12 h-px bg-[var(--color-rule-strong)] mt-8" />
    </div>
  );
}
