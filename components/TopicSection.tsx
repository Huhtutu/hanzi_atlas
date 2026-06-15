import type { Character, Topic } from "@/lib/types";
import CharCardMorph from "./CharCardMorph";

export default function TopicSection({
  section, charsById,
}: { section: Topic["sections"][number]; charsById: Map<string, Character> }) {
  return (
    <section className="my-16">
      <h2 className="chapter-mark font-serif text-2xl text-ink mb-4 tracking-wider">{section.heading}</h2>
      <p className="text-ink/80 leading-loose mb-8 max-w-2xl">{section.narrative}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {section.chars.map(ch => {
          const c = charsById.get(ch);
          return c ? <CharCardMorph key={ch} c={c} /> : null;
        })}
      </div>
    </section>
  );
}
