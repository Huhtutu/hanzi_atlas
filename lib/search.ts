"use client";
import MiniSearch from "minisearch";
import type { SearchDoc } from "./types";

let cached: { ms: MiniSearch<SearchDoc>; docs: SearchDoc[] } | null = null;

export async function loadSearch(): Promise<{ ms: MiniSearch<SearchDoc>; docs: SearchDoc[] }> {
  if (cached) return cached;
  const res = await fetch("/search-index.json");
  if (!res.ok) throw new Error("failed to load search index");
  const { docs, index } = await res.json();
  const ms = MiniSearch.loadJS<SearchDoc>(index, {
    idField: "char",
    fields: ["char", "pinyinToned", "pinyinPlain", "meanings", "radical"],
    storeFields: ["char", "pinyinToned", "meanings"],
    searchOptions: { prefix: true, fuzzy: 0.2 },
  });
  cached = { ms, docs };
  return cached;
}
