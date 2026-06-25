# 字形数据全量接入与古诗词赏析模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `public/glyphs` 中已有的单字目录全量补入 `data/characters.json`，并新增一个可访问的古诗词赏析模块。

**Architecture:** 先新增一个可测试的数据生成脚本，复用现有 `Character` schema 与 PNG 前缀映射规则，保证已有人工数据不被覆盖。诗词模块使用独立 `Poem` schema、`data/poems.json`、`lib/data.ts` 读取函数和两个 App Router 页面，导航只做最小入口改动。

**Tech Stack:** Next.js 15 App Router、React 19、TypeScript、Zod、Vitest、Node `fs/promises`、Tailwind CSS v4。

---

## File Structure

- Modify: `lib/types.ts`
  - 增加 `Poem` Zod schema 与 `Poem` 类型。
- Modify: `lib/data.ts`
  - 增加 `getAllPoems()` 与 `getPoem(slug)`。
- Create: `data/poems.json`
  - 首批古诗词赏析数据。
- Create: `app/poems/page.tsx`
  - 古诗词列表页。
- Create: `app/poems/[slug]/page.tsx`
  - 古诗词详情页与 `generateStaticParams()`。
- Modify: `components/Header.tsx`
  - 增加 `/poems` 导航入口。
- Create: `scripts/sync-glyph-characters.ts`
  - 从 `public/glyphs` 补齐 `data/characters.json` 缺失条目。
- Modify: `tests/validate-data.test.ts`
  - 增加诗词 schema 与生成脚本行为测试。
- Modify: `scripts/validate-data.ts`
  - 校验 `data/poems.json`。
- Modify generated data: `data/characters.json`
  - 通过脚本追加缺失 glyph 字符。

---

### Task 1: Add Poem schema and validation coverage

**Files:**
- Modify: `lib/types.ts`
- Modify: `scripts/validate-data.ts`
- Modify: `tests/validate-data.test.ts`

- [ ] **Step 1: Add failing tests for poem validation**

Append the following test cases inside the existing `describe("validateAll", () => { ... })` block in `tests/validate-data.test.ts`:

```ts
  it("passes when poems are valid", async () => {
    const result = await validateAll({
      chars: [],
      topics: [],
      poems: [
        {
          slug: "jing-ye-si",
          title: "静夜思",
          author: "李白",
          dynasty: "唐",
          lines: ["床前明月光", "疑是地上霜"],
          intro: "月夜思乡之作。",
          appreciation: "以白描写乡思,语浅情深。",
          tags: ["思乡", "月夜"],
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("reports invalid poems as an error", async () => {
    const result = await validateAll({
      chars: [],
      topics: [],
      poems: [
        {
          slug: "broken",
          title: "缺字段诗",
          author: "佚名",
          dynasty: "唐",
          lines: [],
          intro: "缺少赏析且诗句为空。",
          tags: [],
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/poems\.json schema/);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/validate-data.test.ts
```

Expected: TypeScript/Vitest fails because `ValidateInput` does not accept `poems`, or because poems are not validated yet.

- [ ] **Step 3: Add Poem type**

In `lib/types.ts`, insert after the `Topic` type:

```ts
export const Poem = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  dynasty: z.string().min(1),
  lines: z.array(z.string().min(1)).min(1),
  intro: z.string().min(1),
  appreciation: z.string().min(1),
  tags: z.array(z.string()),
});
export type Poem = z.infer<typeof Poem>;
```

- [ ] **Step 4: Validate poems in validate-data script**

Update imports in `scripts/validate-data.ts`:

```ts
import { Character, Poem, Topic } from "../lib/types";
```

Update `ValidateInput`:

```ts
export interface ValidateInput {
  chars: unknown[];
  topics: unknown[];
  poems?: unknown[];
}
```

Update `loadFromDisk()` so it reads `data/poems.json` if present:

```ts
async function loadFromDisk(): Promise<ValidateInput> {
  const chars = JSON.parse(await readFile(join(ROOT, "characters.json"), "utf8"));
  const topicDir = join(ROOT, "topics");
  const files = (await readdir(topicDir)).filter(f => f.endsWith(".json"));
  const topics = await Promise.all(
    files.map(async f => JSON.parse(await readFile(join(topicDir, f), "utf8")))
  );
  let poems: unknown[] = [];
  try {
    poems = JSON.parse(await readFile(join(ROOT, "poems.json"), "utf8"));
  } catch {
    poems = [];
  }
  return { chars, topics, poems };
}
```

Update `validateAll()` after topic parsing:

```ts
  const poemsParsed = z.array(Poem).safeParse(input?.poems ?? ("poems" in (input ?? {}) ? input?.poems : []));
```

Then replace the parsing block with this clearer version:

```ts
  const source = input ?? (await loadFromDisk());
  const { chars: rawChars, topics: rawTopics } = source;
  const rawPoems = source.poems ?? [];

  const charsParsed = z.array(Character).safeParse(rawChars);
  const topicsParsed = z.array(Topic).safeParse(rawTopics);
  const poemsParsed = z.array(Poem).safeParse(rawPoems);

  if (!charsParsed.success) errors.push("characters.json schema: " + charsParsed.error.message);
  if (!topicsParsed.success) errors.push("topics schema: " + topicsParsed.error.message);
  if (!poemsParsed.success) errors.push("poems.json schema: " + poemsParsed.error.message);
  if (!charsParsed.success || !topicsParsed.success || !poemsParsed.success) return { ok: false, errors };
```

Keep the existing character/topic cross-reference checks unchanged.

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm run test -- tests/validate-data.test.ts
```

Expected: PASS for all tests in `tests/validate-data.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts scripts/validate-data.ts tests/validate-data.test.ts
git commit -m "test(data): 增加诗词数据校验"
```

---

### Task 2: Add poem data and data readers

**Files:**
- Create: `data/poems.json`
- Modify: `lib/data.ts`

- [ ] **Step 1: Create poem data**

Create `data/poems.json` with:

```json
[
  {
    "slug": "jing-ye-si",
    "title": "静夜思",
    "author": "李白",
    "dynasty": "唐",
    "lines": ["床前明月光", "疑是地上霜", "举头望明月", "低头思故乡"],
    "intro": "这是一首以月夜触发乡思的小诗。诗人从眼前月光写起,转入抬头望月与低头怀乡,语句明白而情感深长。",
    "appreciation": "全诗几乎不用典故,只取月光、霜色、举头、低头四个日常画面。它的力量来自极简的动作变化:由疑到望,由望到思,把漂泊者的乡愁写得含蓄而普遍。",
    "tags": ["思乡", "月夜", "唐诗"]
  },
  {
    "slug": "chun-xiao",
    "title": "春晓",
    "author": "孟浩然",
    "dynasty": "唐",
    "lines": ["春眠不觉晓", "处处闻啼鸟", "夜来风雨声", "花落知多少"],
    "intro": "这首诗写春晨醒来时的听觉与想象。眼前未写花,却由风雨声推想落花,春意因此更显悠远。",
    "appreciation": "诗中先写安眠,再写鸟声,最后回想夜雨。末句不作确定判断,只问“知多少”,让读者在惜春情绪里自行补足画面。",
    "tags": ["春天", "惜春", "唐诗"]
  },
  {
    "slug": "deng-guan-que-lou",
    "title": "登鹳雀楼",
    "author": "王之涣",
    "dynasty": "唐",
    "lines": ["白日依山尽", "黄河入海流", "欲穷千里目", "更上一层楼"],
    "intro": "诗人登楼远望,由落日与黄河写出阔大的空间,再以登高望远收束为人生进取的格言。",
    "appreciation": "前两句是景,后两句是理。景象开阔而不铺陈,道理明白而不说教,使“更上一层楼”成为超出登楼场景的精神象征。",
    "tags": ["登临", "黄河", "唐诗"]
  },
  {
    "slug": "jiang-xue",
    "title": "江雪",
    "author": "柳宗元",
    "dynasty": "唐",
    "lines": ["千山鸟飞绝", "万径人踪灭", "孤舟蓑笠翁", "独钓寒江雪"],
    "intro": "这首诗以极寒雪景写孤独境界。天地寂静无声,只剩江上一叶孤舟与独钓老人。",
    "appreciation": "“千山”“万径”极写空阔,“孤舟”“独钓”极写孤绝。诗中人物并不直接抒情,却在寒江雪景里呈现出清峻坚忍的精神姿态。",
    "tags": ["雪景", "孤高", "唐诗"]
  }
]
```

- [ ] **Step 2: Add poem readers**

In `lib/data.ts`, update import:

```ts
import { Character, SCRIPT_LABELS, ScriptKey, SpringAutumnChapter, Topic, Poem } from "./types";
```

Remove `SCRIPT_ORDER` from the import if it is still unused.

After `_topics`, add:

```ts
let _poems: Poem[] | null = null;
```

After `getTopic()`, add:

```ts
export async function getAllPoems(): Promise<Poem[]> {
  if (_poems) return _poems;
  const raw = JSON.parse(await readFile(join(DATA, "poems.json"), "utf8"));
  _poems = z.array(Poem).parse(raw);
  return _poems;
}

export async function getPoem(slug: string): Promise<Poem | null> {
  const all = await getAllPoems();
  return all.find(p => p.slug === slug) ?? null;
}
```

- [ ] **Step 3: Run validation**

Run:

```bash
npm run validate-data
```

Expected: `✓ data ok`.

- [ ] **Step 4: Commit**

```bash
git add data/poems.json lib/data.ts
git commit -m "feat(poems): 增加古诗词数据读取"
```

---

### Task 3: Add poem pages and navigation

**Files:**
- Create: `app/poems/page.tsx`
- Create: `app/poems/[slug]/page.tsx`
- Modify: `components/Header.tsx`

- [ ] **Step 1: Create poems list page**

Create `app/poems/page.tsx`:

```tsx
import Link from "next/link";
import { getAllPoems } from "@/lib/data";

export default async function PoemsPage() {
  const poems = await getAllPoems();

  return (
    <article className="max-w-4xl mx-auto">
      <header className="text-center mb-12 border-b border-[var(--color-rule)] pb-10">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
          <span>诗 词</span>
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
        </div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-3">古诗词赏析</h1>
        <p className="text-ink/60 leading-loose max-w-2xl mx-auto">
          选读古典诗词,在字句之间看见山河、时序与心事。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {poems.map(poem => (
          <Link key={poem.slug} href={`/poems/${poem.slug}`} className="book-card block rounded-sm p-6 group">
            <div className="text-[10px] tracking-[0.35em] text-[var(--color-vermilion)] mb-3">
              {poem.dynasty} · {poem.author}
            </div>
            <h2 className="font-serif text-2xl text-ink group-hover:text-[var(--color-vermilion)] transition-colors mb-4">
              {poem.title}
            </h2>
            <div className="space-y-1 text-ink/75 leading-relaxed mb-5">
              {poem.lines.map(line => <p key={line}>{line}</p>)}
            </div>
            <p className="text-sm text-ink/55 leading-relaxed line-clamp-2">{poem.intro}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Create poem detail page**

Create directory `app/poems/[slug]` and file `app/poems/[slug]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPoems, getPoem } from "@/lib/data";

export async function generateStaticParams() {
  const poems = await getAllPoems();
  return poems.map(p => ({ slug: p.slug }));
}

export default async function PoemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const poem = await getPoem(slug);
  if (!poem) notFound();

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/poems" className="link-cinnabar text-sm text-ink/65 hover:text-[var(--color-vermilion)]">
        返回诗词
      </Link>

      <header className="text-center my-12 border-b border-[var(--color-rule)] pb-10">
        <div className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">诗 词 赏 析</div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-4">{poem.title}</h1>
        <p className="text-ink/55 tracking-wider text-sm">{poem.dynasty} · {poem.author}</p>
      </header>

      <section className="text-center font-serif text-2xl leading-loose text-ink mb-12">
        {poem.lines.map(line => <p key={line}>{line}</p>)}
      </section>

      <section className="mb-10">
        <h2 className="chapter-mark font-serif text-xl text-ink mb-4 tracking-wider">诗意导读</h2>
        <p className="text-ink/80 leading-loose indent-8">{poem.intro}</p>
      </section>

      <section className="mb-10 bg-[var(--color-paper-2)]/70 border-l-2 border-[var(--color-vermilion)] px-6 py-5">
        <h2 className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-3">赏析</h2>
        <p className="text-ink/80 leading-loose indent-8">{poem.appreciation}</p>
      </section>

      <div className="flex flex-wrap gap-2 pt-6 border-t border-[var(--color-rule)]">
        {poem.tags.map(tag => (
          <span key={tag} className="text-xs tracking-wider text-ink/55 border border-[var(--color-rule)] px-3 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Add navigation link**

In `components/Header.tsx`, replace the `<nav>` block with:

```tsx
        <nav className="hidden sm:flex items-center gap-5 text-sm tracking-wider text-ink/75">
          <Link href="/topic/water" className="hover:text-[var(--color-vermilion)] transition-colors">水</Link>
          <Link href="/topic/human" className="hover:text-[var(--color-vermilion)] transition-colors">人</Link>
          <Link href="/poems" className="hover:text-[var(--color-vermilion)] transition-colors">诗词</Link>
          <Link href="/about" className="hover:text-[var(--color-vermilion)] transition-colors">关于</Link>
        </nav>
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add app/poems/page.tsx app/poems/[slug]/page.tsx components/Header.tsx
git commit -m "feat(poems): 新增古诗词赏析页面"
```

---

### Task 4: Add and test glyph-to-character sync script

**Files:**
- Create: `scripts/sync-glyph-characters.ts`
- Create or modify: `tests/sync-glyph-characters.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/sync-glyph-characters.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Character } from "../lib/types";
import { createPlaceholderCharacter, mergeGlyphCharacters, scriptsFromFiles } from "../scripts/sync-glyph-characters";

const existing: Character = {
  char: "水",
  pinyin: ["shuǐ"],
  radical: "水",
  strokes: 4,
  meanings: ["无色无味的液体"],
  etymology: {
    intro: "已有字源说明",
    stages: [
      { script: "oracle", text: "已有甲骨说明" },
      { script: "bronze", text: "已有金文说明" },
      { script: "seal", text: "已有小篆说明" },
      { script: "clerical", text: "已有隶书说明" },
      { script: "regular", text: "已有楷书说明" },
    ],
    modern: "已有现代说明",
  },
  scripts: {
    oracle: { available: false, glyphSrc: null },
    bronze: { available: false, glyphSrc: null },
    seal: { available: false, glyphSrc: null },
    clerical: { available: true, glyphSrc: "/glyphs/水/隸書_1.png" },
    regular: { available: true, glyphSrc: "/glyphs/水/楷書_1.png" },
  },
  morph: { enabled: false, svgDir: null },
  topics: ["water"],
  related: ["河"],
};

describe("sync-glyph-characters", () => {
  it("detects script availability from PNG prefixes", () => {
    const scripts = scriptsFromFiles("安", ["甲骨文_1.png", "金文_1.png", "戰國文字_1.png", "篆文_1.png", "隸書_1.png", "楷書_1.png"]);

    expect(scripts.oracle).toEqual({ available: true, glyphSrc: "/glyphs/%E5%AE%89/%E7%94%B2%E9%AA%A8%E6%96%87_1.png" });
    expect(scripts.bronze.available).toBe(true);
    expect(scripts.seal.available).toBe(true);
    expect(scripts.clerical.available).toBe(true);
    expect(scripts.regular.available).toBe(true);
  });

  it("creates a schema-valid placeholder character", () => {
    const c = createPlaceholderCharacter("安", ["篆文_1.png", "楷書_1.png"]);

    expect(c.char).toBe("安");
    expect(c.pinyin).toEqual(["待补"]);
    expect(c.radical).toBe("安");
    expect(c.strokes).toBe(1);
    expect(c.etymology.stages.map(s => s.script)).toEqual(["oracle", "bronze", "seal", "clerical", "regular"]);
    expect(c.scripts.seal.available).toBe(true);
    expect(c.scripts.regular.available).toBe(true);
    expect(c.related).toEqual([]);
  });

  it("preserves existing characters and appends missing glyph characters", () => {
    const merged = mergeGlyphCharacters([existing], [
      { char: "水", files: ["楷書_1.png"] },
      { char: "安", files: ["篆文_1.png", "楷書_1.png"] },
    ]);

    expect(merged).toHaveLength(2);
    expect(merged[0]).toBe(existing);
    expect(merged[1].char).toBe("安");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/sync-glyph-characters.test.ts
```

Expected: FAIL because `scripts/sync-glyph-characters.ts` does not exist.

- [ ] **Step 3: Implement script module**

Create `scripts/sync-glyph-characters.ts`:

```ts
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Character, SCRIPT_ORDER, type ScriptKey } from "../lib/types";
import { z } from "zod";

const PNG_PREFIX_MAP: Array<[string, ScriptKey]> = [
  ["甲骨文", "oracle"],
  ["金文", "bronze"],
  ["小篆", "seal"],
  ["篆文", "seal"],
  ["戰國文字", "seal"],
  ["战国文字", "seal"],
  ["隸書", "clerical"],
  ["隶书", "clerical"],
  ["楷書", "regular"],
  ["楷书", "regular"],
];

export type GlyphCharacterFiles = { char: string; files: string[] };

function emptyScripts(): Character["scripts"] {
  return {
    oracle: { available: false, glyphSrc: null },
    bronze: { available: false, glyphSrc: null },
    seal: { available: false, glyphSrc: null },
    clerical: { available: false, glyphSrc: null },
    regular: { available: false, glyphSrc: null },
  };
}

function scriptKeyForFile(file: string): ScriptKey | null {
  for (const [prefix, key] of PNG_PREFIX_MAP) {
    if (file.startsWith(prefix + "_") || file.startsWith(prefix + ".")) return key;
  }
  return null;
}

export function scriptsFromFiles(ch: string, files: string[]): Character["scripts"] {
  const scripts = emptyScripts();
  const pngs = files.filter(f => f.toLowerCase().endsWith(".png")).sort();

  for (const file of pngs) {
    const key = scriptKeyForFile(file);
    if (!key || scripts[key].available) continue;
    scripts[key] = {
      available: true,
      glyphSrc: `/glyphs/${encodeURIComponent(ch)}/${encodeURIComponent(file)}`,
    };
  }

  return scripts;
}

export function createPlaceholderCharacter(ch: string, files: string[]): Character {
  return {
    char: ch,
    pinyin: ["待补"],
    radical: ch,
    strokes: 1,
    meanings: ["待补充释义"],
    etymology: {
      intro: `${ch}的字源信息待补充。`,
      stages: SCRIPT_ORDER.map(script => ({ script, text: `${ch}的该阶段字形说明待补充。` })),
      modern: `${ch}的现代用法待补充。`,
    },
    scripts: scriptsFromFiles(ch, files),
    morph: { enabled: false, svgDir: null },
    topics: [],
    related: [],
  };
}

export function mergeGlyphCharacters(existing: Character[], glyphs: GlyphCharacterFiles[]): Character[] {
  const seen = new Set(existing.map(c => c.char));
  const additions = glyphs
    .filter(g => g.char.length === 1 && !seen.has(g.char))
    .sort((a, b) => a.char.localeCompare(b.char, "zh-Hans"))
    .map(g => createPlaceholderCharacter(g.char, g.files));

  return [...existing, ...additions];
}

async function readGlyphCharacters(root: string): Promise<GlyphCharacterFiles[]> {
  const glyphRoot = join(root, "public", "glyphs");
  const entries = await readdir(glyphRoot, { withFileTypes: true });
  const dirs = entries.filter(entry => entry.isDirectory() && entry.name.length === 1);

  return Promise.all(
    dirs.map(async dir => ({
      char: dir.name,
      files: await readdir(join(glyphRoot, dir.name)),
    }))
  );
}

async function main() {
  const root = process.cwd();
  const charactersPath = join(root, "data", "characters.json");
  const raw = JSON.parse(await readFile(charactersPath, "utf8"));
  const existing = z.array(Character).parse(raw);
  const glyphs = await readGlyphCharacters(root);
  const merged = mergeGlyphCharacters(existing, glyphs);

  await writeFile(charactersPath, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`✓ characters.json: ${existing.length} → ${merged.length}`);
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
    import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
```

- [ ] **Step 4: Run script tests**

Run:

```bash
npm run test -- tests/sync-glyph-characters.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run full tests**

Run:

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/sync-glyph-characters.ts tests/sync-glyph-characters.test.ts
git commit -m "feat(data): 增加字形目录同步脚本"
```

---

### Task 5: Generate full character data from glyphs

**Files:**
- Modify: `data/characters.json`

- [ ] **Step 1: Run sync script**

Run:

```bash
npx tsx scripts/sync-glyph-characters.ts
```

Expected output should look like:

```text
✓ characters.json: 81 → 1028
```

The final number may differ if glyph directory count changes, but it must be at least the previous `characters.json` count and should cover all single-character glyph directories.

- [ ] **Step 2: Verify coverage count**

Run:

```bash
python - <<'PY'
import json
from pathlib import Path
root = Path('F:/Java_project/hanzi_atlas')
glyph_chars = {p.name for p in (root/'public'/'glyphs').iterdir() if p.is_dir() and len(p.name) == 1}
data_chars = {c['char'] for c in json.loads((root/'data'/'characters.json').read_text(encoding='utf-8'))}
missing = sorted(glyph_chars - data_chars)
print('glyph_chars', len(glyph_chars))
print('data_chars', len(data_chars))
print('missing', ''.join(missing[:50]))
raise SystemExit(1 if missing else 0)
PY
```

Expected: `missing` line is empty and exit code is 0.

- [ ] **Step 3: Validate data**

Run:

```bash
npm run validate-data
```

Expected: `✓ data ok`.

- [ ] **Step 4: Build search index**

Run:

```bash
npm run build:search-index
```

Expected: output reports the new document count, e.g. `✓ wrote search-index.json (1028 docs)`.

- [ ] **Step 5: Commit generated data**

```bash
git add data/characters.json
git commit -m "feat(data): 接入已有字形目录汉字"
```

Do not stage `data/search-index.json` or `public/search-index.json` unless they are already tracked and intentionally changed.

---

### Task 6: Final verification and browser check

**Files:**
- No code changes expected unless verification finds a bug.

- [ ] **Step 1: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 2: Run tests**

Run:

```bash
npm run test
```

Expected: all Vitest tests pass.

- [ ] **Step 3: Run full build**

Run:

```bash
npm run build
```

Expected: Next build completes and includes generated `/zi/[char]` pages plus `/poems` pages.

- [ ] **Step 4: Start preview server**

Use the preview tool if `.claude/launch.json` exists. If not, create `.claude/launch.json` with:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "hanzi-atlas-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 3000
    }
  ]
}
```

Then start `hanzi-atlas-dev` using the preview server tool.

- [ ] **Step 5: Manually verify pages**

Check these paths in the browser:

```text
/
/poems
/poems/jing-ye-si
/zi/安
```

Expected:

- Home page loads.
- Header contains “诗词”.
- `/poems` shows four poem cards.
- `/poems/jing-ye-si` shows title, author, original poem, intro, appreciation, and tags.
- `/zi/安` loads and shows available PNG glyphs from `public/glyphs/安`.

- [ ] **Step 6: Check git status**

Run:

```bash
git status --short
```

Expected: only intentional user glyph file changes remain unstaged, or working tree is clean if glyphs were already staged/committed by user. Do not delete or restore glyph files.

- [ ] **Step 7: Commit any verification fixes**

If verification required small code fixes, commit only those files:

```bash
git add <fixed-files>
git commit -m "fix: 修正字形接入与诗词页面验证问题"
```

If no fixes were needed, do not create an empty commit.

---

## Self-Review

- Spec coverage: Task 4 and Task 5 cover glyph directory import, preserving existing character data, PNG prefix-to-script mapping, placeholder fields, and data validation. Task 1 through Task 3 cover poem schema, data, readers, pages, and navigation. Task 6 covers typecheck, tests, build, and manual browser verification.
- Placeholder scan: The plan uses “待补” only as intentional generated app content required by the spec, not as an unfinished plan placeholder. There are no TBD/TODO implementation gaps.
- Type consistency: `Poem`, `getAllPoems`, `getPoem`, `scriptsFromFiles`, `createPlaceholderCharacter`, and `mergeGlyphCharacters` are defined before use, with matching property names across tests and implementation.
