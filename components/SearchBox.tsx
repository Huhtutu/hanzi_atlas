"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ compact = false, initial = "" }: { compact?: boolean; initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder={compact ? "搜字、拼音、释义…" : "输入汉字、拼音或释义关键词"}
        className={`flex-1 bg-paper border border-ink/20 rounded px-3 outline-none focus:border-[var(--color-vermilion)] ${compact ? "py-1 text-sm" : "py-2 text-base"}`}
        aria-label="搜索"
      />
      <button type="submit" className={`bg-[var(--color-vermilion)] text-paper rounded ${compact ? "px-3 py-1 text-sm" : "px-5 py-2"}`}>搜索</button>
    </form>
  );
}
