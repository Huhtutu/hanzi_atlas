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

  const inputSize = compact ? "h-9 text-sm px-3" : "h-12 text-base px-4";
  const btnSize = compact ? "h-9 text-sm px-4" : "h-12 text-base px-6";

  return (
    <form onSubmit={submit} className="flex gap-2 items-stretch">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder={compact ? "搜字、拼音、释义…" : "输入汉字、拼音或释义关键词"}
        className={`flex-1 bg-paper border border-[var(--color-rule-strong)] rounded-sm outline-none transition-colors focus:border-[var(--color-vermilion)] placeholder:text-ink/40 ${inputSize}`}
        aria-label="搜索"
      />
      <button
        type="submit"
        className={`bg-[var(--color-vermilion)] hover:bg-[var(--color-vermilion-soft)] text-paper rounded-sm tracking-widest transition-colors ${btnSize}`}
      >
        搜索
      </button>
    </form>
  );
}
