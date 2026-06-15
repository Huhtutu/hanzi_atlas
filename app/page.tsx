import { getAllCharacters, getAllTopics, pickRandom } from "@/lib/data";
import HomeTitle from "@/components/HomeTitle";
import SearchBox from "@/components/SearchBox";
import TopicCoverCard from "@/components/TopicCoverCard";
import CharCard from "@/components/CharCard";

export default async function HomePage() {
  const [chars, topics] = await Promise.all([getAllCharacters(), getAllTopics()]);
  const random = pickRandom(chars, 8);

  return (
    <>
      <HomeTitle />
      <p className="text-center text-ink/70 max-w-xl mx-auto mb-10 leading-relaxed tracking-wider">
        搜索任意常用汉字 · 看它从甲骨文一路演化到楷书
      </p>
      <div className="max-w-xl mx-auto mb-20">
        <SearchBox />
      </div>

      <section className="mb-20">
        <h2 className="chapter-mark font-serif text-2xl text-ink mb-6 tracking-wider">精选专题</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {topics.map(t => <TopicCoverCard key={t.slug} t={t} />)}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="chapter-mark font-serif text-2xl text-ink mb-6 tracking-wider">随机看几个字</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {random.map(c => <CharCard key={c.char} c={c} />)}
        </div>
      </section>
    </>
  );
}
