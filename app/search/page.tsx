"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loadSearch } from "@/lib/search";
import type { SearchDoc } from "@/lib/types";

export const dynamic = "force-static";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<SearchDoc[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => { loadSearch().then(() => setReady(true)); }, []);

  useEffect(() => {
    if (!ready) return;
    const term = q.trim();
    if (!term) { setResults([]); return; }
    loadSearch().then(({ ms }) => {
      const hits = ms.search(term).slice(0, 50);
      setResults(hits as unknown as SearchDoc[]);
    });
  }, [q, ready]);

  function update(v: string) {
    setQ(v);
    const next = new URLSearchParams();
    if (v) next.set("q", v);
    router.replace(`/search?${next.toString()}`);
  }

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">搜索</h1>
      <input
        autoFocus
        value={q}
        onChange={e => update(e.target.value)}
        placeholder="汉字、拼音(带或不带声调)、释义关键词、部首"
        className="w-full bg-paper border border-ink/20 rounded px-4 py-3 outline-none focus:border-[var(--color-vermilion)]"
        aria-label="搜索输入"
      />
      {!ready && <p className="text-sm text-ink/50 mt-4">索引加载中…</p>}
      {ready && q && results.length === 0 && (
        <p className="text-sm text-ink/60 mt-6">未找到「{q}」。</p>
      )}
      <ul className="mt-6 divide-y divide-ink/10">
        {results.map(r => (
          <li key={r.char}>
            <Link href={`/zi/${encodeURIComponent(r.char)}`} className="flex items-baseline gap-4 py-3 hover:bg-ink/5 px-2 rounded">
              <span className="text-3xl font-serif">{r.char}</span>
              <span className="text-sm text-ink/60">{r.pinyinToned}</span>
              <span className="text-sm text-ink/70 truncate">{r.meanings}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
