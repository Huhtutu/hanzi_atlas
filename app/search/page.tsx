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
    <div className="max-w-3xl mx-auto">
      <header className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-3">
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
          <span>检 索</span>
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
        </div>
        <h1 className="font-serif text-3xl text-ink tracking-wider">字海钩沉</h1>
      </header>

      <input
        autoFocus
        value={q}
        onChange={e => update(e.target.value)}
        placeholder="汉字 · 拼音 · 释义关键词 · 部首"
        className="w-full bg-paper border border-[var(--color-rule-strong)] rounded-sm px-5 py-4 outline-none transition-colors focus:border-[var(--color-vermilion)] text-base placeholder:text-ink/40"
        aria-label="搜索输入"
      />

      {!ready && <p className="text-sm text-ink/45 mt-6 tracking-wider text-center">索引加载中 …</p>}
      {ready && q && results.length === 0 && (
        <p className="text-sm text-ink/55 mt-10 text-center">未找到「{q}」相关结果</p>
      )}

      {results.length > 0 && (
        <ul className="mt-8 divide-y divide-[var(--color-rule)] border-y border-[var(--color-rule)]">
          {results.map(r => (
            <li key={r.char}>
              <Link
                href={`/zi/${encodeURIComponent(r.char)}`}
                className="flex items-baseline gap-5 py-4 px-2 hover:bg-[var(--color-paper-2)] transition-colors"
              >
                <span className="text-3xl font-serif text-ink w-12 text-center">{r.char}</span>
                <span className="text-sm text-[var(--color-vermilion)] tracking-wider w-20">{r.pinyinToned}</span>
                <span className="text-sm text-ink/70 truncate flex-1">{r.meanings}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
