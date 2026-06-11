import type { Character, Topic } from "@/lib/types";
import CharCardMorph from "./CharCardMorph";

export default function TopicSection({
  section, charsById,
}: { section: Topic["sections"][number]; charsById: Map<string, Character> }) {
  return (
    <section className="my-12">
      <h2 className="font-serif text-2xl mb-3">{section.heading}</h2>
      <p className="text-ink/80 leading-relaxed mb-6 max-w-2xl">{section.narrative}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {section.chars.map(ch => {
          const c = charsById.get(ch);
          return c ? <CharCardMorph key={ch} c={c} /> : null;
        })}
      </div>
    </section>
  );
}
