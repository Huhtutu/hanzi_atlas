import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import MiniSearch from "minisearch";
import { Character, SearchDoc } from "../lib/types";
import { stripTone } from "../lib/pinyin";
import { z } from "zod";

export function buildDocs(chars: Character[]): SearchDoc[] {
  return chars.map(c => ({
    char: c.char,
    pinyinToned: c.pinyin.join(" "),
    pinyinPlain: c.pinyin.map(stripTone).join(" "),
    meanings: c.meanings.join(" / "),
    radical: c.radical,
  }));
}

export function buildIndex(docs: SearchDoc[]) {
  const ms = new MiniSearch<SearchDoc>({
    idField: "char",
    fields: ["char", "pinyinToned", "pinyinPlain", "meanings", "radical"],
    storeFields: ["char", "pinyinToned", "meanings"],
    searchOptions: { prefix: true, fuzzy: 0.2 },
  });
  ms.addAll(docs);
  return ms;
}

async function main() {
  const raw = JSON.parse(await readFile(join(process.cwd(), "data/characters.json"), "utf8"));
  const chars = z.array(Character).parse(raw);
  const docs = buildDocs(chars);
  const ms = buildIndex(docs);
  const out = { docs, index: ms.toJSON() };
  await writeFile(join(process.cwd(), "data/search-index.json"), JSON.stringify(out));
  console.log(`✓ wrote search-index.json (${docs.length} docs)`);
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
    import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
