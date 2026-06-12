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
      <header className="border-b border-ink/10 pb-10 mb-2">
        <div className="text-xs text-[var(--color-vermilion)] tracking-widest mb-2">专题</div>
        <h1 className="font-serif text-4xl mb-2">{topic.title}</h1>
        <p className="text-ink/60">{topic.subtitle}</p>
        <p className="mt-8 text-ink/85 leading-relaxed max-w-2xl">{topic.intro}</p>
      </header>
      {topic.sections.map((s, i) => (
        <TopicSection key={i} section={s} charsById={byChar} />
      ))}
    </article>
  );
}
