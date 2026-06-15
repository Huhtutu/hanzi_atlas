import bgImage from "@/assets/img/home.png";

export default function HomeTitle() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "70vh",
      }}
    >
      {/* 渐变遮罩 — 右下角区域保持可读性 */}
      <div className="absolute inset-0 bg-gradient-to-tl from-[var(--color-paper)]/85 via-transparent to-transparent" />

      {/* 内容 — 右下侧 */}
      <div className="relative z-10 flex flex-col justify-end min-h-[70vh] max-w-5xl mx-auto px-6 pb-12 md:pb-20">
        {/* 朱砂装饰 */}
        <div className="flex items-center gap-4 mb-6">
          <span className="w-12 h-px bg-[var(--color-vermilion)]/60" />
          <span className="text-[var(--color-vermilion)] tracking-[0.3em] text-xs">序</span>
          <span className="w-12 h-px bg-[var(--color-vermilion)]/60" />
        </div>

        {/* 标题 */}
        <h1 className="font-serif text-3xl md:text-4xl text-ink tracking-wider mb-6">
          关于汉字图志
        </h1>

        {/* 序文 */}
        <div className="max-w-xl text-ink/80 text-sm leading-[2.2] tracking-wider indent-8">
          <p>
            收录常用汉字三千余字，每字依次列出甲骨文、金文、小篆、隶书、楷书五种字体，以简明易懂的方式展示汉字形体的演变过程，清晰呈现汉字发展的历史脉络。读者可从中直观了解字形源流与演变规律，深入理解汉字背后蕴含的文化逻辑。旨在帮助中小学生及外国汉语学习者更真切地认识汉字、感知中华文化，推动汉字的传播与中文文化的交流。
          </p>
        </div>

        {/* 底部装饰 */}
        <div className="w-12 h-px bg-[var(--color-rule-strong)] mt-8" />
      </div>
    </section>
  );
}
