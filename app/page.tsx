import { getSpringAutumnChapters, getCharacterStories } from "@/lib/data";
import HomeTitle from "@/components/HomeTitle";
import SearchBox from "@/components/SearchBox";
import SpringAutumnGrid from "@/components/SpringAutumnGrid";

export default async function HomePage() {
  const [chapters, stories] = await Promise.all([getSpringAutumnChapters(), getCharacterStories()]);

  return (
    <>
      <HomeTitle />
      <div className="max-w-xl mx-auto mb-20">
        <SearchBox />
      </div>

      <SpringAutumnGrid chapters={chapters} stories={stories} />

      <div className="text-center mt-16">
        <div className="mx-auto w-8 h-px bg-[var(--color-rule-strong)] mb-4" />
        <p className="text-ink/40 text-xs tracking-widest">
          凡73字 · 分6卷 · 以窥华夏之奥
        </p>
      </div>
    </>
  );
}
