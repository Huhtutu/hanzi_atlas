import bgImage from "@/assets/img/home.png";

export default function HomeTitle() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 渐变遮罩 — 右下侧淡入底色区 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-paper)]/70 via-[var(--color-paper)]/10 to-[var(--color-paper)]/85" />

      {/* 内容 — 右下侧对齐 */}
      <div className="relative z-10 min-h-[75vh] max-w-6xl mx-auto flex flex-col justify-center px-6 md:pl-16 md:pr-12">
        <div className="self-end md:self-auto md:max-w-lg lg:max-w-xl">
          {/* 朱砂装饰 */}
          <div className="flex items-center gap-4 mb-5">
            <span className="w-10 h-px bg-[var(--color-vermilion)]/60" />
            <span className="text-[var(--color-vermilion)] tracking-[0.3em] text-xs">序</span>
            <span className="w-10 h-px bg-[var(--color-vermilion)]/60" />
          </div>

          {/* 标题 — 左侧朱砂竖线 */}
          <h1 className="chapter-mark font-serif text-3xl md:text-4xl lg:text-5xl text-ink tracking-wider mb-6">
            关于汉字图志
          </h1>

          {/* 序文 */}
          <div className="text-ink/80 text-sm md:text-base leading-[2.2] tracking-wider indent-8">
            <p>
              收录常用汉字三千余字，每字依次列出甲骨文、金文、小篆、隶书、楷书五种字体，以简明易懂的方式展示汉字形体的演变过程，清晰呈现汉字发展的历史脉络。读者可从中直观了解字形源流与演变规律，深入理解汉字背后蕴含的文化逻辑。旨在帮助中小学生及外国汉语学习者更真切地认识汉字、感知中华文化，推动汉字的传播与中文文化的交流。
            </p>
          </div>

          {/* 底部装饰 */}
          <div className="flex items-center gap-3 mt-8">
            <span className="w-8 h-px bg-[var(--color-rule-strong)]" />
            <span className="w-1.5 h-1.5 rotate-45 border border-[var(--color-vermilion)]/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
