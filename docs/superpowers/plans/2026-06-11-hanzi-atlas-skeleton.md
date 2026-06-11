# Hanzi Atlas Skeleton + Full Page UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a Next.js + TS + Tailwind static site for Hanzi Atlas with all 5 pages rendering end-to-end against placeholder data (~10 characters, 1 topic). No real fonts/SVGs/etymology — those land later.

**Architecture:** Next.js App Router with SSG. Data lives as JSON in `data/`. A build-time script generates `search-index.json` for client-side MiniSearch. Reusable components handle script switching, evolution playback, char cards, topic sections, search. All real assets (oracle/bronze/seal fonts, hand-drawn SVGs, etymology text) are replaced with clearly-marked placeholders so the layout/animations are demoable.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, MiniSearch, Vitest, Zod (data schema), Node 20+.

**Working dir:** `F:\Java_project\hanzi_atlas\` (sibling to existing `docs/`).

---

## File Structure

```
hanzi_atlas/
├── app/
│   ├── layout.tsx                    # root layout: header, footer, font vars
│   ├── globals.css                   # Tailwind + theme tokens
│   ├── page.tsx                      # 首页 /
│   ├── zi/[char]/page.tsx            # 字详情
│   ├── topic/[slug]/page.tsx         # 专题
│   ├── search/page.tsx               # 搜索(client)
│   ├── about/page.tsx                # 关于
│   └── not-found.tsx                 # 404
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── SearchBox.tsx                 # client, used in header
│   ├── ScriptSwitcher.tsx            # client, 5 tabs
│   ├── EvolutionAnimation.tsx        # client, ▶ play button
│   ├── CharCard.tsx
│   ├── CharCardMorph.tsx             # SVG morph variant
│   ├── TopicSection.tsx
│   ├── TopicCoverCard.tsx            # for homepage
│   └── HomeTitle.tsx                 # client, animated 甲骨→楷 title
├── lib/
│   ├── types.ts                      # TS types + Zod schemas
│   ├── data.ts                       # readers for characters/topics
│   ├── pinyin.ts                     # tone-stripping for search
│   └── search.ts                     # MiniSearch loader
├── data/
│   ├── characters.json               # ~10 placeholder chars
│   ├── topics/water.json
│   ├── topics/human.json
│   └── search-index.json             # generated, git-ignored after task 8
├── scripts/
│   ├── validate-data.ts              # zod-validate + cross-refs
│   └── build-search-index.ts         # called by `next build` prebuild
├── tests/
│   ├── validate-data.test.ts
│   ├── pinyin.test.ts
│   └── search-index.test.ts
├── public/
│   ├── fonts/.gitkeep                # real fonts later
│   └── svg/.gitkeep
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts                # v4 uses CSS-first; this is optional
├── postcss.config.mjs
├── vitest.config.ts
├── .eslintrc.json
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `F:\Java_project\hanzi_atlas\package.json`
- Create: `F:\Java_project\hanzi_atlas\tsconfig.json`
- Create: `F:\Java_project\hanzi_atlas\next.config.mjs`
- Create: `F:\Java_project\hanzi_atlas\.gitignore`
- Create: `F:\Java_project\hanzi_atlas\postcss.config.mjs`
- Create: `F:\Java_project\hanzi_atlas\app/globals.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "hanzi-atlas",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "npm run build:search-index && next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "validate-data": "tsx scripts/validate-data.ts",
    "build:search-index": "tsx scripts/build-search-index.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "framer-motion": "^11.11.0",
    "minisearch": "^7.1.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "tsx": "^4.19.0",
    "vitest": "^2.1.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.mjs**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
```

- [ ] **Step 4: Create postcss.config.mjs**

```js
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
```

- [ ] **Step 5: Create app/globals.css**

```css
@import "tailwindcss";

@theme {
  --color-paper: #FAF7F2;
  --color-ink: #1A1A1A;
  --color-vermilion: #A23B2D;
  --font-serif: "Source Han Serif SC", "Noto Serif SC", ui-serif, Georgia, serif;
  --font-sans: "Source Han Sans SC", "Noto Sans SC", ui-sans-serif, system-ui, sans-serif;
}

html { background: var(--color-paper); color: var(--color-ink); }
body { font-family: var(--font-serif); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

- [ ] **Step 6: Create .gitignore**

```
node_modules
.next
out
.env*.local
*.tsbuildinfo
next-env.d.ts
data/search-index.json
```

- [ ] **Step 7: Install dependencies**

Run: `cd F:/Java_project/hanzi_atlas && npm install`
Expected: Installs without errors. Creates `node_modules/` and `package-lock.json`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs postcss.config.mjs app/globals.css .gitignore
git commit -m "chore: init Next.js + Tailwind v4 scaffold"
```

---

## Task 2: Data Types & Zod Schemas

**Files:**
- Create: `F:\Java_project\hanzi_atlas\lib/types.ts`

- [ ] **Step 1: Write lib/types.ts**

```ts
import { z } from "zod";

export const ScriptKey = z.enum(["oracle", "bronze", "seal", "clerical", "regular"]);
export type ScriptKey = z.infer<typeof ScriptKey>;

export const ScriptInfo = z.object({
  available: z.boolean(),
  font: z.string().nullable(),
});

export const Character = z.object({
  char: z.string().length(1),
  pinyin: z.array(z.string()).min(1),
  radical: z.string(),
  strokes: z.number().int().positive(),
  meanings: z.array(z.string()).min(1),
  etymology: z.string(),
  scripts: z.object({
    oracle: ScriptInfo,
    bronze: ScriptInfo,
    seal: ScriptInfo,
    clerical: ScriptInfo,
    regular: ScriptInfo,
  }),
  morph: z.object({
    enabled: z.boolean(),
    svgDir: z.string().nullable(),
  }),
  topics: z.array(z.string()),
  related: z.array(z.string()),
});
export type Character = z.infer<typeof Character>;

export const TopicSection = z.object({
  heading: z.string(),
  narrative: z.string(),
  chars: z.array(z.string()),
});

export const Topic = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  cover: z.string(),
  intro: z.string(),
  sections: z.array(TopicSection),
});
export type Topic = z.infer<typeof Topic>;

export const SearchDoc = z.object({
  char: z.string(),
  pinyinPlain: z.string(),
  pinyinToned: z.string(),
  meanings: z.string(),
  radical: z.string(),
});
export type SearchDoc = z.infer<typeof SearchDoc>;

export const SCRIPT_LABELS: Record<ScriptKey, string> = {
  oracle: "甲骨文",
  bronze: "金文",
  seal: "小篆",
  clerical: "隶书",
  regular: "楷书",
};
export const SCRIPT_ORDER: ScriptKey[] = ["oracle", "bronze", "seal", "clerical", "regular"];
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat(data): add zod schemas and shared types"
```

---

## Task 3: Placeholder Data

**Files:**
- Create: `F:\Java_project\hanzi_atlas\data/characters.json`
- Create: `F:\Java_project\hanzi_atlas\data/topics/water.json`
- Create: `F:\Java_project\hanzi_atlas\data/topics/human.json`

- [ ] **Step 1: Create data/characters.json**

```json
[
  {
    "char": "水",
    "pinyin": ["shuǐ"],
    "radical": "水",
    "strokes": 4,
    "meanings": ["无色无味的液体", "江河湖海的总称"],
    "etymology": "(占位)甲骨文像水流的形状,中间一道主流,两侧点为水花。",
    "scripts": {
      "oracle":   { "available": true,  "font": "oracle" },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": ["water"],
    "related": ["川", "河", "雨"]
  },
  {
    "char": "川",
    "pinyin": ["chuān"],
    "radical": "川",
    "strokes": 3,
    "meanings": ["河流"],
    "etymology": "(占位)甲骨文像两岸夹一水的形状。",
    "scripts": {
      "oracle":   { "available": true,  "font": "oracle" },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": ["water"],
    "related": ["水", "河"]
  },
  {
    "char": "河",
    "pinyin": ["hé"],
    "radical": "氵",
    "strokes": 8,
    "meanings": ["天然或人工的水道", "特指黄河"],
    "etymology": "(占位)形声字,水形可声。",
    "scripts": {
      "oracle":   { "available": false, "font": null },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": ["water"],
    "related": ["水", "川", "江"]
  },
  {
    "char": "雨",
    "pinyin": ["yǔ"],
    "radical": "雨",
    "strokes": 8,
    "meanings": ["从云层降落的水滴"],
    "etymology": "(占位)甲骨文上为天,下数点为水滴。",
    "scripts": {
      "oracle":   { "available": true,  "font": "oracle" },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": ["water"],
    "related": ["水"]
  },
  {
    "char": "人",
    "pinyin": ["rén"],
    "radical": "人",
    "strokes": 2,
    "meanings": ["能制造工具进行劳动的高等动物"],
    "etymology": "(占位)甲骨文像人侧身站立之形。",
    "scripts": {
      "oracle":   { "available": true,  "font": "oracle" },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": ["human"],
    "related": ["大", "立", "从"]
  },
  {
    "char": "大",
    "pinyin": ["dà", "dài"],
    "radical": "大",
    "strokes": 3,
    "meanings": ["在面积、体积、容量、数量等方面超过一般"],
    "etymology": "(占位)甲骨文像人正面张开手脚之形。",
    "scripts": {
      "oracle":   { "available": true,  "font": "oracle" },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": ["human"],
    "related": ["人", "立"]
  },
  {
    "char": "立",
    "pinyin": ["lì"],
    "radical": "立",
    "strokes": 5,
    "meanings": ["站立", "直立"],
    "etymology": "(占位)甲骨文像人站在地上之形。",
    "scripts": {
      "oracle":   { "available": true,  "font": "oracle" },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": ["human"],
    "related": ["人", "大"]
  },
  {
    "char": "从",
    "pinyin": ["cóng"],
    "radical": "人",
    "strokes": 4,
    "meanings": ["跟随", "顺从"],
    "etymology": "(占位)甲骨文为两人一前一后,会跟随之意。",
    "scripts": {
      "oracle":   { "available": true,  "font": "oracle" },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": ["human"],
    "related": ["人"]
  },
  {
    "char": "山",
    "pinyin": ["shān"],
    "radical": "山",
    "strokes": 3,
    "meanings": ["地面形成的高耸部分"],
    "etymology": "(占位)甲骨文象三峰并立之形。",
    "scripts": {
      "oracle":   { "available": true,  "font": "oracle" },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": [],
    "related": []
  },
  {
    "char": "日",
    "pinyin": ["rì"],
    "radical": "日",
    "strokes": 4,
    "meanings": ["太阳", "白天"],
    "etymology": "(占位)甲骨文象太阳之形,中一点表示太阳的实体。",
    "scripts": {
      "oracle":   { "available": true,  "font": "oracle" },
      "bronze":   { "available": true,  "font": "bronze" },
      "seal":     { "available": true,  "font": "seal" },
      "clerical": { "available": true,  "font": "clerical" },
      "regular":  { "available": true,  "font": null }
    },
    "morph": { "enabled": false, "svgDir": null },
    "topics": [],
    "related": []
  }
]
```

- [ ] **Step 2: Create data/topics/water.json**

```json
{
  "slug": "water",
  "title": "水的故事",
  "subtitle": "汉字里的流动与浩瀚",
  "cover": "/covers/water-placeholder.svg",
  "intro": "(占位)上古先民临水而居,水在汉字里留下了无数足迹。从一滴水到江河湖海,每一个字都是一段流动的记忆。",
  "sections": [
    {
      "heading": "源头",
      "narrative": "(占位)一滴水如何成形,先民如何用三笔勾勒出流动。",
      "chars": ["水", "雨"]
    },
    {
      "heading": "奔流",
      "narrative": "(占位)水汇成川,川汇成河。",
      "chars": ["川", "河"]
    }
  ]
}
```

- [ ] **Step 3: Create data/topics/human.json**

```json
{
  "slug": "human",
  "title": "人的姿态",
  "subtitle": "汉字里的身体语言",
  "cover": "/covers/human-placeholder.svg",
  "intro": "(占位)人是汉字最古老的主题之一。立、大、从——每一个姿态都是一个故事。",
  "sections": [
    {
      "heading": "直立",
      "narrative": "(占位)人站起来,文字也站了起来。",
      "chars": ["人", "大", "立"]
    },
    {
      "heading": "相随",
      "narrative": "(占位)从一个人到一群人。",
      "chars": ["从"]
    }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add data/
git commit -m "feat(data): add 10 placeholder characters and 2 placeholder topics"
```

---

## Task 4: Data Validation Script + Test

**Files:**
- Create: `F:\Java_project\hanzi_atlas\scripts/validate-data.ts`
- Create: `F:\Java_project\hanzi_atlas\tests/validate-data.test.ts`
- Create: `F:\Java_project\hanzi_atlas\vitest.config.ts`

- [ ] **Step 1: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
```

- [ ] **Step 2: Write failing test tests/validate-data.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { validateAll } from "../scripts/validate-data";

describe("validateAll", () => {
  it("passes for the shipped placeholder dataset", async () => {
    const result = await validateAll();
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("reports a missing related char as an error", async () => {
    const chars = [
      { char: "水", pinyin: ["shuǐ"], radical: "水", strokes: 4,
        meanings: ["x"], etymology: "x",
        scripts: { oracle:{available:true,font:"o"}, bronze:{available:true,font:"b"}, seal:{available:true,font:"s"}, clerical:{available:true,font:"c"}, regular:{available:true,font:null} },
        morph: { enabled:false, svgDir:null }, topics: [], related: ["不存在"] }
    ];
    const topics: any[] = [];
    const result = await validateAll({ chars, topics });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/related.*不存在/);
  });

  it("reports an unknown topic slug as an error", async () => {
    const chars = [
      { char: "水", pinyin: ["shuǐ"], radical: "水", strokes: 4,
        meanings: ["x"], etymology: "x",
        scripts: { oracle:{available:true,font:"o"}, bronze:{available:true,font:"b"}, seal:{available:true,font:"s"}, clerical:{available:true,font:"c"}, regular:{available:true,font:null} },
        morph: { enabled:false, svgDir:null }, topics: ["ghost"], related: [] }
    ];
    const result = await validateAll({ chars, topics: [] });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/topic.*ghost/);
  });
});
```

- [ ] **Step 3: Run test — expect failure**

Run: `npx vitest run tests/validate-data.test.ts`
Expected: FAIL (module `../scripts/validate-data` not found).

- [ ] **Step 4: Implement scripts/validate-data.ts**

```ts
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { Character, Topic } from "../lib/types";
import { z } from "zod";

const ROOT = join(process.cwd(), "data");

export interface ValidateInput {
  chars: unknown[];
  topics: unknown[];
}

export interface ValidateResult {
  ok: boolean;
  errors: string[];
}

async function loadFromDisk(): Promise<ValidateInput> {
  const chars = JSON.parse(await readFile(join(ROOT, "characters.json"), "utf8"));
  const topicDir = join(ROOT, "topics");
  const files = (await readdir(topicDir)).filter(f => f.endsWith(".json"));
  const topics = await Promise.all(
    files.map(async f => JSON.parse(await readFile(join(topicDir, f), "utf8")))
  );
  return { chars, topics };
}

export async function validateAll(input?: ValidateInput): Promise<ValidateResult> {
  const errors: string[] = [];
  const { chars: rawChars, topics: rawTopics } = input ?? (await loadFromDisk());

  const charsParsed = z.array(Character).safeParse(rawChars);
  const topicsParsed = z.array(Topic).safeParse(rawTopics);

  if (!charsParsed.success) errors.push("characters.json schema: " + charsParsed.error.message);
  if (!topicsParsed.success) errors.push("topics schema: " + topicsParsed.error.message);
  if (!charsParsed.success || !topicsParsed.success) return { ok: false, errors };

  const chars = charsParsed.data;
  const topics = topicsParsed.data;
  const charSet = new Set(chars.map(c => c.char));
  const topicSet = new Set(topics.map(t => t.slug));

  for (const c of chars) {
    for (const r of c.related) {
      if (!charSet.has(r)) errors.push(`char ${c.char}: related char "${r}" not in dataset`);
    }
    for (const t of c.topics) {
      if (!topicSet.has(t)) errors.push(`char ${c.char}: topic "${t}" not defined`);
    }
  }
  for (const t of topics) {
    for (const s of t.sections) {
      for (const ch of s.chars) {
        if (!charSet.has(ch)) errors.push(`topic ${t.slug}: section char "${ch}" not in dataset`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  validateAll().then(r => {
    if (r.ok) { console.log("✓ data ok"); process.exit(0); }
    console.error("✗ data invalid:\n" + r.errors.map(e => "  - " + e).join("\n"));
    process.exit(1);
  });
}
```

- [ ] **Step 5: Run test — expect pass**

Run: `npx vitest run tests/validate-data.test.ts`
Expected: 3 tests pass.

- [ ] **Step 6: Run validation against real data**

Run: `npm run validate-data`
Expected: prints `✓ data ok`.

- [ ] **Step 7: Commit**

```bash
git add scripts/validate-data.ts tests/validate-data.test.ts vitest.config.ts
git commit -m "feat(data): zod-based validation script + tests"
```

---

## Task 5: Pinyin Utility + Test

**Files:**
- Create: `F:\Java_project\hanzi_atlas\lib/pinyin.ts`
- Create: `F:\Java_project\hanzi_atlas\tests/pinyin.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from "vitest";
import { stripTone } from "../lib/pinyin";

describe("stripTone", () => {
  it("removes diacritics", () => {
    expect(stripTone("shuǐ")).toBe("shui");
    expect(stripTone("hé")).toBe("he");
    expect(stripTone("dà")).toBe("da");
    expect(stripTone("cóng")).toBe("cong");
  });
  it("leaves plain ASCII alone", () => {
    expect(stripTone("shui")).toBe("shui");
  });
  it("handles ü-with-tone", () => {
    expect(stripTone("lǜ")).toBe("lü");
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `npx vitest run tests/pinyin.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement lib/pinyin.ts**

```ts
const TONE_MAP: Record<string, string> = {
  "ā":"a","á":"a","ǎ":"a","à":"a",
  "ē":"e","é":"e","ě":"e","è":"e",
  "ī":"i","í":"i","ǐ":"i","ì":"i",
  "ō":"o","ó":"o","ǒ":"o","ò":"o",
  "ū":"u","ú":"u","ǔ":"u","ù":"u",
  "ǖ":"ü","ǘ":"ü","ǚ":"ü","ǜ":"ü",
};

export function stripTone(syllable: string): string {
  let out = "";
  for (const ch of syllable) out += TONE_MAP[ch] ?? ch;
  return out;
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `npx vitest run tests/pinyin.test.ts`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/pinyin.ts tests/pinyin.test.ts
git commit -m "feat(search): pinyin tone-stripping utility"
```

---

## Task 6: Search Index Build Script + Test

**Files:**
- Create: `F:\Java_project\hanzi_atlas\scripts/build-search-index.ts`
- Create: `F:\Java_project\hanzi_atlas\tests/search-index.test.ts`

- [ ] **Step 1: Write failing test tests/search-index.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { buildDocs } from "../scripts/build-search-index";
import type { Character } from "../lib/types";

const fixture: Character[] = [
  {
    char: "水", pinyin: ["shuǐ"], radical: "水", strokes: 4,
    meanings: ["液体", "江河湖海"], etymology: "x",
    scripts: { oracle:{available:true,font:"o"}, bronze:{available:true,font:"b"}, seal:{available:true,font:"s"}, clerical:{available:true,font:"c"}, regular:{available:true,font:null} },
    morph: { enabled:false, svgDir:null }, topics: [], related: [],
  },
];

describe("buildDocs", () => {
  it("emits both toned and untoned pinyin", () => {
    const docs = buildDocs(fixture);
    expect(docs[0].char).toBe("水");
    expect(docs[0].pinyinToned).toBe("shuǐ");
    expect(docs[0].pinyinPlain).toBe("shui");
  });
  it("joins all meanings into one searchable field", () => {
    const docs = buildDocs(fixture);
    expect(docs[0].meanings).toMatch(/液体/);
    expect(docs[0].meanings).toMatch(/江河湖海/);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `npx vitest run tests/search-index.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement scripts/build-search-index.ts**

```ts
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

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `npx vitest run tests/search-index.test.ts`
Expected: 2 tests pass.

- [ ] **Step 5: Generate the index once**

Run: `npm run build:search-index`
Expected: prints `✓ wrote search-index.json (10 docs)`. File appears at `data/search-index.json` (gitignored).

- [ ] **Step 6: Commit**

```bash
git add scripts/build-search-index.ts tests/search-index.test.ts
git commit -m "feat(search): MiniSearch index build script + tests"
```

---

## Task 7: Data Reader Lib

**Files:**
- Create: `F:\Java_project\hanzi_atlas\lib/data.ts`

- [ ] **Step 1: Write lib/data.ts**

```ts
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { Character, Topic } from "./types";
import { z } from "zod";

const DATA = join(process.cwd(), "data");

let _chars: Character[] | null = null;
let _topics: Topic[] | null = null;

export async function getAllCharacters(): Promise<Character[]> {
  if (_chars) return _chars;
  const raw = JSON.parse(await readFile(join(DATA, "characters.json"), "utf8"));
  _chars = z.array(Character).parse(raw);
  return _chars;
}

export async function getCharacter(ch: string): Promise<Character | null> {
  const all = await getAllCharacters();
  return all.find(c => c.char === ch) ?? null;
}

export async function getAllTopics(): Promise<Topic[]> {
  if (_topics) return _topics;
  const dir = join(DATA, "topics");
  const files = (await readdir(dir)).filter(f => f.endsWith(".json"));
  const parsed = await Promise.all(
    files.map(async f => Topic.parse(JSON.parse(await readFile(join(dir, f), "utf8"))))
  );
  _topics = parsed;
  return _topics;
}

export async function getTopic(slug: string): Promise<Topic | null> {
  const all = await getAllTopics();
  return all.find(t => t.slug === slug) ?? null;
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/data.ts
git commit -m "feat(data): server-side readers for characters and topics"
```

---

## Task 8: Root Layout, Header, Footer

**Files:**
- Create: `F:\Java_project\hanzi_atlas\app/layout.tsx`
- Create: `F:\Java_project\hanzi_atlas\components/Header.tsx`
- Create: `F:\Java_project\hanzi_atlas\components/Footer.tsx`

- [ ] **Step 1: app/layout.tsx**

```tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "汉字图志 Hanzi Atlas",
  description: "搜索任意常用汉字,查看从甲骨文到楷书的字形演化。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: components/Header.tsx**

```tsx
import Link from "next/link";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
        <Link href="/" className="font-serif text-lg tracking-wide">汉字图志</Link>
        <div className="flex-1 max-w-sm"><SearchBox compact /></div>
        <nav className="text-sm text-ink/70 flex gap-4">
          <Link href="/topic/water">水</Link>
          <Link href="/topic/human">人</Link>
          <Link href="/about">关于</Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: components/Footer.tsx**

```tsx
export default function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-16">
      <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-ink/60 flex justify-between">
        <span>© Hanzi Atlas · 开源汉字图志</span>
        <a href="https://github.com" className="underline">GitHub</a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx components/Header.tsx components/Footer.tsx
git commit -m "feat(ui): root layout, header, footer"
```

---

## Task 9: SearchBox Component (Client)

**Files:**
- Create: `F:\Java_project\hanzi_atlas\components/SearchBox.tsx`

- [ ] **Step 1: components/SearchBox.tsx**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/SearchBox.tsx
git commit -m "feat(ui): SearchBox client component"
```

---

## Task 10: CharCard + ScriptSwitcher + EvolutionAnimation

**Files:**
- Create: `F:\Java_project\hanzi_atlas\components/CharCard.tsx`
- Create: `F:\Java_project\hanzi_atlas\components/ScriptSwitcher.tsx`
- Create: `F:\Java_project\hanzi_atlas\components/EvolutionAnimation.tsx`

- [ ] **Step 1: components/CharCard.tsx**

```tsx
import Link from "next/link";
import type { Character } from "@/lib/types";

export default function CharCard({ c }: { c: Character }) {
  return (
    <Link href={`/zi/${encodeURIComponent(c.char)}`} className="group block border border-ink/10 rounded-lg p-4 hover:border-[var(--color-vermilion)] transition bg-white/40">
      <div className="text-5xl font-serif text-center mb-2 group-hover:text-[var(--color-vermilion)]">{c.char}</div>
      <div className="text-center text-sm text-ink/70">{c.pinyin.join(" / ")}</div>
      <div className="text-center text-xs text-ink/50 mt-1 line-clamp-1">{c.meanings[0]}</div>
    </Link>
  );
}
```

- [ ] **Step 2: components/ScriptSwitcher.tsx**

```tsx
"use client";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey, type Character } from "@/lib/types";

export default function ScriptSwitcher({
  c, active, onChange,
}: { c: Character; active: ScriptKey; onChange: (k: ScriptKey) => void }) {
  return (
    <div className="flex gap-2 flex-wrap" role="tablist" aria-label="字形切换">
      {SCRIPT_ORDER.map(k => {
        const info = c.scripts[k];
        const enabled = info.available;
        const isActive = k === active;
        return (
          <button
            key={k}
            role="tab"
            aria-selected={isActive}
            disabled={!enabled}
            onClick={() => onChange(k)}
            title={enabled ? "" : "暂无此字古文写法,欢迎贡献"}
            className={`px-3 py-1.5 rounded border text-sm transition
              ${isActive ? "bg-[var(--color-vermilion)] text-paper border-[var(--color-vermilion)]" : "border-ink/20"}
              ${enabled ? "" : "opacity-40 cursor-not-allowed"}`}
          >
            {SCRIPT_LABELS[k]}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: components/EvolutionAnimation.tsx**

```tsx
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey, type Character } from "@/lib/types";
import ScriptSwitcher from "./ScriptSwitcher";

export default function EvolutionAnimation({ c }: { c: Character }) {
  const firstAvailable = SCRIPT_ORDER.find(k => c.scripts[k].available) ?? "regular";
  const [active, setActive] = useState<ScriptKey>(firstAvailable);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const playable = SCRIPT_ORDER.filter(k => c.scripts[k].available);
    let i = 0;
    setActive(playable[0]);
    const id = setInterval(() => {
      i++;
      if (i >= playable.length) { setPlaying(false); clearInterval(id); return; }
      setActive(playable[i]);
    }, 1000);
    return () => clearInterval(id);
  }, [playing, c]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="h-48 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-[10rem] leading-none font-serif"
            aria-label={`${SCRIPT_LABELS[active]}写法`}
          >
            {c.char}
          </motion.div>
        </AnimatePresence>
      </div>
      <ScriptSwitcher c={c} active={active} onChange={k => { setPlaying(false); setActive(k); }} />
      <button
        onClick={() => setPlaying(true)}
        disabled={playing}
        className="text-sm px-4 py-2 border border-ink/20 rounded hover:bg-ink/5 disabled:opacity-50"
      >
        {playing ? "正在播放…" : "▶ 播放演化动画"}
      </button>
      <p className="text-xs text-ink/40">(占位:目前所有字体都用衬线楷书渲染,真实字体待接入)</p>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/CharCard.tsx components/ScriptSwitcher.tsx components/EvolutionAnimation.tsx
git commit -m "feat(ui): char card, script switcher, evolution animation"
```

---

## Task 11: TopicSection + TopicCoverCard + HomeTitle

**Files:**
- Create: `F:\Java_project\hanzi_atlas\components/TopicSection.tsx`
- Create: `F:\Java_project\hanzi_atlas\components/TopicCoverCard.tsx`
- Create: `F:\Java_project\hanzi_atlas\components/HomeTitle.tsx`
- Create: `F:\Java_project\hanzi_atlas\components/CharCardMorph.tsx`

- [ ] **Step 1: components/CharCardMorph.tsx** (placeholder = same as CharCard with hover hint)

```tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Character } from "@/lib/types";

export default function CharCardMorph({ c }: { c: Character }) {
  return (
    <Link href={`/zi/${encodeURIComponent(c.char)}`} className="block border border-ink/10 rounded-lg p-4 hover:border-[var(--color-vermilion)] transition bg-white/40">
      <motion.div
        initial={{ opacity: 0.6, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-6xl font-serif text-center mb-2"
      >
        {c.char}
      </motion.div>
      <div className="text-center text-sm text-ink/70">{c.pinyin.join(" / ")}</div>
      <div className="text-center text-[10px] text-ink/40 mt-1">(占位形变动画)</div>
    </Link>
  );
}
```

- [ ] **Step 2: components/TopicSection.tsx**

```tsx
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
```

- [ ] **Step 3: components/TopicCoverCard.tsx**

```tsx
import Link from "next/link";
import type { Topic } from "@/lib/types";

export default function TopicCoverCard({ t }: { t: Topic }) {
  return (
    <Link href={`/topic/${t.slug}`} className="block border border-ink/10 rounded-lg p-6 hover:border-[var(--color-vermilion)] transition group bg-white/40">
      <div className="text-xs text-[var(--color-vermilion)] tracking-widest mb-2">专题</div>
      <h3 className="font-serif text-2xl mb-1 group-hover:text-[var(--color-vermilion)]">{t.title}</h3>
      <p className="text-sm text-ink/60">{t.subtitle}</p>
    </Link>
  );
}
```

- [ ] **Step 4: components/HomeTitle.tsx**

```tsx
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey } from "@/lib/types";

export default function HomeTitle() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % SCRIPT_ORDER.length), 1600);
    return () => clearInterval(id);
  }, []);
  const k: ScriptKey = SCRIPT_ORDER[idx];
  return (
    <div className="text-center my-12">
      <div className="h-40 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-8xl font-serif"
          >
            汉字图志
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="text-sm text-ink/60 mt-2">当前字形:{SCRIPT_LABELS[k]}(占位)</p>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/TopicSection.tsx components/TopicCoverCard.tsx components/HomeTitle.tsx components/CharCardMorph.tsx
git commit -m "feat(ui): topic section, topic cover card, home title, morph card"
```

---

## Task 12: Home Page

**Files:**
- Create: `F:\Java_project\hanzi_atlas\app/page.tsx`

- [ ] **Step 1: app/page.tsx**

```tsx
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
      <p className="text-center text-ink/70 max-w-xl mx-auto -mt-6 mb-8">
        搜索任意常用汉字,看它从甲骨文一路演化到楷书。
      </p>
      <div className="max-w-xl mx-auto mb-16"><SearchBox /></div>

      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">精选专题</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map(t => <TopicCoverCard key={t.slug} t={t} />)}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-4">随机看几个字</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {random.map(c => <CharCard key={c.char} c={c} />)}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat(page): home page with title, search, topics, random chars"
```

---

## Task 13: Char Detail Page + 404

**Files:**
- Create: `F:\Java_project\hanzi_atlas\app/zi/[char]/page.tsx`
- Create: `F:\Java_project\hanzi_atlas\app/not-found.tsx`

- [ ] **Step 1: app/zi/[char]/page.tsx**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCharacters, getCharacter, getAllTopics } from "@/lib/data";
import EvolutionAnimation from "@/components/EvolutionAnimation";
import CharCard from "@/components/CharCard";

export async function generateStaticParams() {
  const chars = await getAllCharacters();
  return chars.map(c => ({ char: c.char }));
}

export default async function CharPage({ params }: { params: Promise<{ char: string }> }) {
  const { char } = await params;
  const decoded = decodeURIComponent(char);
  const c = await getCharacter(decoded);
  if (!c) notFound();

  const all = await getAllCharacters();
  const topics = await getAllTopics();
  const related = c.related.map(r => all.find(x => x.char === r)).filter((x): x is NonNullable<typeof x> => !!x);
  const charTopics = topics.filter(t => c.topics.includes(t.slug));

  return (
    <article className="grid md:grid-cols-[1fr_280px] gap-12">
      <div>
        <EvolutionAnimation c={c} />
        <dl className="grid grid-cols-3 gap-4 mt-10 text-sm">
          <div><dt className="text-ink/50">拼音</dt><dd>{c.pinyin.join(" / ")}</dd></div>
          <div><dt className="text-ink/50">部首</dt><dd>{c.radical}</dd></div>
          <div><dt className="text-ink/50">笔画</dt><dd>{c.strokes}</dd></div>
        </dl>
        <section className="mt-10">
          <h2 className="font-serif text-xl mb-2">字源</h2>
          <p className="text-ink/85 leading-relaxed">{c.etymology}</p>
        </section>
        <section className="mt-10">
          <h2 className="font-serif text-xl mb-2">释义</h2>
          <ol className="list-decimal list-inside space-y-1 text-ink/85">
            {c.meanings.map((m, i) => <li key={i}>{m}</li>)}
          </ol>
        </section>
      </div>

      <aside className="space-y-8">
        {charTopics.length > 0 && (
          <div>
            <h3 className="font-serif text-base mb-2 text-ink/70">收录于专题</h3>
            <ul className="space-y-1">
              {charTopics.map(t => (
                <li key={t.slug}><Link href={`/topic/${t.slug}`} className="underline">{t.title}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {related.length > 0 && (
          <div>
            <h3 className="font-serif text-base mb-2 text-ink/70">相关字</h3>
            <div className="grid grid-cols-2 gap-2">
              {related.map(r => <CharCard key={r.char} c={r} />)}
            </div>
          </div>
        )}
      </aside>
    </article>
  );
}
```

- [ ] **Step 2: app/not-found.tsx**

```tsx
import Link from "next/link";
import SearchBox from "@/components/SearchBox";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="font-serif text-3xl mb-3">未找到</h1>
      <p className="text-ink/70 mb-8">该字暂未收录,欢迎在 GitHub 提交贡献。</p>
      <div className="max-w-md mx-auto mb-6"><SearchBox /></div>
      <Link href="/" className="text-sm underline">返回首页</Link>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/zi/[char]/page.tsx" app/not-found.tsx
git commit -m "feat(page): char detail page and shared 404"
```

---

## Task 14: Topic Page

**Files:**
- Create: `F:\Java_project\hanzi_atlas\app/topic/[slug]/page.tsx`

- [ ] **Step 1: app/topic/[slug]/page.tsx**

```tsx
import { notFound } from "next/navigation";
import { getAllTopics, getTopic, getAllCharacters } from "@/lib/data";
import TopicSection from "@/components/TopicSection";

export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map(t => ({ slug: t.slug }));
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();
  const chars = await getAllCharacters();
  const byChar = new Map(chars.map(c => [c.char, c]));

  return (
    <article>
      <header className="border-b border-ink/10 pb-10 mb-2">
        <div className="text-xs text-[var(--color-vermilion)] tracking-widest mb-2">专题</div>
        <h1 className="font-serif text-4xl mb-2">{topic.title}</h1>
        <p className="text-ink/60">{topic.subtitle}</p>
        <p className="mt-8 text-ink/85 leading-relaxed max-w-2xl">{topic.intro}</p>
      </header>
      {topic.sections.map((s, i) => (
        <TopicSection key={i} section={s} charsById={byChar} />
      ))}
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/topic/[slug]/page.tsx"
git commit -m "feat(page): topic page with section rendering"
```

---

## Task 15: Search Page (Client)

**Files:**
- Create: `F:\Java_project\hanzi_atlas\app/search/page.tsx`
- Create: `F:\Java_project\hanzi_atlas\lib/search.ts`

- [ ] **Step 1: lib/search.ts**

```ts
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
```

- [ ] **Step 2: app/search/page.tsx**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loadSearch } from "@/lib/search";
import type { SearchDoc } from "@/lib/types";

export const dynamic = "force-static";

export default function SearchPage() {
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
```

- [ ] **Step 3: Make search-index.json available to the client**

The search page fetches `/search-index.json`, so the build script must also copy the index into `public/`. Update `scripts/build-search-index.ts` so that after writing `data/search-index.json` it also writes `public/search-index.json`:

Replace the `main` function in `scripts/build-search-index.ts` with:

```ts
async function main() {
  const raw = JSON.parse(await readFile(join(process.cwd(), "data/characters.json"), "utf8"));
  const chars = z.array(Character).parse(raw);
  const docs = buildDocs(chars);
  const ms = buildIndex(docs);
  const payload = JSON.stringify({ docs, index: ms.toJSON() });
  await writeFile(join(process.cwd(), "data/search-index.json"), payload);
  await writeFile(join(process.cwd(), "public/search-index.json"), payload);
  console.log(`✓ wrote search-index.json (${docs.length} docs)`);
}
```

Add `public/search-index.json` to `.gitignore`:

```
public/search-index.json
```

Re-run: `npm run build:search-index`
Expected: prints `✓ wrote search-index.json (10 docs)`. Both `data/search-index.json` and `public/search-index.json` exist.

- [ ] **Step 4: Commit**

```bash
git add lib/search.ts app/search/page.tsx scripts/build-search-index.ts .gitignore
git commit -m "feat(page): client search page powered by MiniSearch"
```

---

## Task 16: About Page

**Files:**
- Create: `F:\Java_project\hanzi_atlas\app/about/page.tsx`

- [ ] **Step 1: app/about/page.tsx**

```tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <article className="prose-like max-w-2xl">
      <h1 className="font-serif text-3xl mb-6">关于</h1>
      <section className="space-y-4 text-ink/85 leading-relaxed">
        <p>(占位)汉字图志是一个开源项目,目标是让任何对汉字感兴趣的人都能查到一个常用字从甲骨文到楷书的演化全程,并配以可读的字源故事。</p>
        <h2 className="font-serif text-xl mt-8">字体来源</h2>
        <p>(占位)甲骨文 / 金文 / 小篆字体待选型与许可证审查(优先 SIL OFL)。</p>
        <h2 className="font-serif text-xl mt-8">如何贡献</h2>
        <p>欢迎通过 GitHub 提交 PR 添加新字、新专题或修订字源故事。详见 <Link href="/" className="underline">CONTRIBUTING.md</Link>。</p>
      </section>
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/about/page.tsx
git commit -m "feat(page): about page placeholder"
```

---

## Task 17: README + CONTRIBUTING

**Files:**
- Create: `F:\Java_project\hanzi_atlas\README.md`
- Create: `F:\Java_project\hanzi_atlas\CONTRIBUTING.md`

- [ ] **Step 1: README.md**

````markdown
# Hanzi Atlas 汉字图志

一个让用户能搜任意常用汉字并查看字形演化(甲骨文 → 金文 → 小篆 → 隶书 → 楷书)的开源汉字图志。

## 现状

v0.1-skeleton:UI 骨架已完成,数据为占位(10 字 + 2 专题),字体/SVG/字源文案未接入。

## 开发

```bash
npm install
npm run dev           # http://localhost:3000
npm run validate-data
npm run test
npm run build
```

## 设计文档

见 [`docs/specs/2026-06-11-hanzi-atlas-design.md`](docs/specs/2026-06-11-hanzi-atlas-design.md)。

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。
````

- [ ] **Step 2: CONTRIBUTING.md**

```markdown
# 贡献指南

## 添加新字

1. 在 `data/characters.json` 中追加一条记录(参考已有 `水`)。
2. 如果有手工 SVG,放到 `public/svg/<char>/` 下,并把 `morph.enabled` 设为 `true`、`svgDir` 指向该路径。
3. 跑 `npm run validate-data` 确认通过。
4. 跑 `npm run build:search-index` 重新生成索引。
5. 提 PR。

## 添加新专题

1. 复制 `data/topics/water.json` 改名,修改 `slug` / `title` / `sections`。
2. 让其中引用的字都已存在于 `characters.json`。
3. 同上跑校验、提 PR。

## 数据校验

CI 会跑 `npm run validate-data` + `npm run test`,失败将拦截合并。
```

- [ ] **Step 3: Commit**

```bash
git add README.md CONTRIBUTING.md
git commit -m "docs: README and CONTRIBUTING for v0.1 skeleton"
```

---

## Task 18: End-to-End Verification

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 2: All tests**

Run: `npm run test`
Expected: all 8+ tests pass.

- [ ] **Step 3: Data validation**

Run: `npm run validate-data`
Expected: `✓ data ok`.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: SSG renders /, /search, /about, /zi/[10 chars], /topic/water, /topic/human. No errors. `.next/` populated.

- [ ] **Step 5: Manual smoke (dev server)**

Run: `npm run dev`

Open `http://localhost:3000` and verify:
- Homepage: title animates through 5 scripts, 2 topic cards, 8 random chars, search box submits to `/search?q=...`
- Click `水` → detail page shows: animated big char, 5 script tabs (`河` has oracle disabled with tooltip), Play button cycles tabs, etymology + meanings + related + topic link present
- Click topic `水` → cover header + 2 sections, each with char cards
- `/search?q=shui` → finds 水; `/search?q=人` → finds 人; `/search?q=液体` → finds 水
- `/zi/龘` → 404 page with search box
- `/about` → renders

Report any visual issue you couldn't resolve rather than claiming success.

- [ ] **Step 6: Final commit if anything was tweaked during smoke**

```bash
git status
# if dirty:
git add -A
git commit -m "fix: smoke-test follow-ups"
```

---

## Self-Review Checklist

- All 5 pages in the spec (home, char, topic, search, about) have a task: ✓ (T12/T13/T14/T15/T16).
- Components from spec §7 covered: ScriptSwitcher (T10), EvolutionAnimation (T10), CharCard (T10), TopicSection (T11), SearchBox (T9).
- Data schema + validation + search-index from spec §3 + §6: T2/T4/T6.
- 404 + reduced-motion + disabled script tab edge cases from spec §5: T13, globals.css, T10 (ScriptSwitcher disabled+tooltip).
- All steps include actual code or exact commands. No `TBD` / `similar to above`.
- Type names consistent (`ScriptKey`, `Character`, `Topic`, `SearchDoc`) across all tasks.
- One unresolved real-world dependency by design: fonts/SVGs/etymology — surfaced as "(占位)" in data and in About page, per user instruction "全部用占位".
