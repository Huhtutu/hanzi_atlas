import { notFound } from "next/navigation";
import { getAllTopics, getTopic, getAllCharacters } from "@/lib/data";
import TopicSection from "@/components/TopicSection";

export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map(t => ({ slug: t.slug }));
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();
  const chars = await getAllCharacters();
  const byChar = new Map(chars.map(c => [c.char, c]));

  return (
    <article>
      <header className="border-b border-[var(--color-rule)] pb-10 mb-4 text-center">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
          <span>专 题</span>
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
        </div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-3">{topic.title}</h1>
        <p className="text-ink/55 tracking-wider text-sm">{topic.subtitle}</p>
        <p className="mt-8 text-ink/80 leading-loose max-w-2xl mx-auto text-left">{topic.intro}</p>
      </header>
      {topic.sections.map((s, i) => (
        <TopicSection key={i} section={s} charsById={byChar} />
      ))}
    </article>
  );
}
