# 诗词拾萃与成语典故模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将诗词模块展示为“诗词拾萃”，支持用户提供的诗词配图，并新增“成语典故”数据与页面入口。

**Architecture:** 继续复用当前静态 JSON + Zod schema + App Router 页面模式。诗词路由保持 `/poems` 不变，只扩展 `Poem` 可选图片字段并优化卡片/详情排版；成语典故作为独立 `Idiom` 数据源，新增 `/idioms` 与 `/idioms/[slug]` 静态页面。

**Tech Stack:** Next.js 15 App Router、React 19、TypeScript、Zod、Vitest、Tailwind CSS v4。

---

## File Structure

- Modify: `lib/types.ts`
  - `Poem` 增加可选 `imageSrc` / `imageAlt`。
  - 新增 `Idiom` schema 与类型。
- Modify: `scripts/validate-data.ts`
  - 校验 `data/idioms.json`。
- Modify: `tests/validate-data.test.ts`
  - 增加诗词图片字段与成语数据校验测试。
- Create: `data/idioms.json`
  - 收录画龙点睛、守株待兔、亡羊补牢、刻舟求剑。
- Modify: `lib/data.ts`
  - 新增 `getAllIdioms()` / `getIdiom(slug)`。
- Modify: `components/Header.tsx`
  - 删除“水”“人”；“诗词”改为“诗词拾萃”；新增“成语典故”。
- Modify: `app/poems/page.tsx`
  - 页面标题改为“诗词拾萃”；优化为诗笺式卡片；有图时显示图片。
- Modify: `app/poems/[slug]/page.tsx`
  - 返回链接与小标题改名；有图时展示图片。
- Create: `app/idioms/page.tsx`
  - 成语典故列表页。
- Create: `app/idioms/[slug]/page.tsx`
  - 成语典故详情页。

Do not modify `public/glyphs` in any task.

---

### Task 1: Extend schemas and data validation

**Files:**
- Modify: `lib/types.ts`
- Modify: `scripts/validate-data.ts`
- Modify: `tests/validate-data.test.ts`

- [ ] **Step 1: Add failing validation tests**

Append these tests inside `describe("validateAll", () => { ... })` in `tests/validate-data.test.ts`:

```ts
  it("passes for poems with optional image fields", async () => {
    const result = await validateAll({
      chars: [],
      topics: [],
      poems: [
        {
          slug: "jing-ye-si",
          title: "静夜思",
          author: "李白",
          dynasty: "唐",
          lines: ["床前明月光"],
          intro: "月夜思乡。",
          appreciation: "以月光写乡愁。",
          tags: ["思乡"],
          imageSrc: "/poems/jing-ye-si.jpg",
          imageAlt: "月夜窗前的清冷光影",
        },
      ],
      idioms: [],
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("passes for valid idioms input", async () => {
    const result = await validateAll({
      chars: [],
      topics: [],
      poems: [],
      idioms: [
        {
          slug: "hua-long-dian-jing",
          title: "画龙点睛",
          source: "唐·张彦远《历代名画记》",
          story: "张僧繇画龙不点睛,点睛后龙破壁飞去。",
          meaning: "比喻在关键处加上一笔,使内容生动有力。",
          usage: "文章结尾一句点明主旨,正有画龙点睛之妙。",
          tags: ["艺术", "关键"],
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("reports invalid idioms as an error", async () => {
    const result = await validateAll({
      chars: [],
      topics: [],
      poems: [],
      idioms: [
        {
          slug: "broken",
          title: "缺字段成语",
          source: "佚名",
          story: "缺少寓意和今用。",
          tags: [],
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/idioms\.json schema/);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm --prefix /f/Java_project/hanzi_atlas run test -- tests/validate-data.test.ts
```

Expected: FAIL because `ValidateInput` does not include `idioms`, `Poem` does not accept image fields, and `Idiom` does not exist.

- [ ] **Step 3: Extend `Poem` and add `Idiom`**

In `lib/types.ts`, replace the current `Poem` schema with:

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
  imageSrc: z.string().min(1).optional(),
  imageAlt: z.string().min(1).optional(),
});
export type Poem = z.infer<typeof Poem>;
```

Immediately after `Poem`, add:

```ts
export const Idiom = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  source: z.string().min(1),
  story: z.string().min(1),
  meaning: z.string().min(1),
  usage: z.string().min(1),
  tags: z.array(z.string()),
});
export type Idiom = z.infer<typeof Idiom>;
```

- [ ] **Step 4: Validate idioms in `scripts/validate-data.ts`**

Update import:

```ts
import { Character, Idiom, Poem, Topic } from "../lib/types";
```

Update `ValidateInput`:

```ts
export interface ValidateInput {
  chars: unknown[];
  topics: unknown[];
  poems?: unknown[];
  idioms?: unknown[];
}
```

In `loadFromDisk()`, after the poems read block, add:

```ts
  let idioms: unknown[] = [];
  try {
    idioms = JSON.parse(await readFile(join(ROOT, "idioms.json"), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return { chars, topics, poems, idioms };
```

Replace the existing `return { chars, topics, poems };` with the return above.

In `validateAll()`, destructure idioms:

```ts
  const { chars: rawChars, topics: rawTopics, poems: rawPoems = [], idioms: rawIdioms = [] } = input ?? (await loadFromDisk());
```

After `poemsParsed`, add:

```ts
  const idiomsParsed = z.array(Idiom).safeParse(rawIdioms);
```

After poem error handling, add:

```ts
  if (!idiomsParsed.success) errors.push("idioms.json schema: " + idiomsParsed.error.message);
  if (!charsParsed.success || !topicsParsed.success || !poemsParsed.success || !idiomsParsed.success) return { ok: false, errors };
```

Remove or replace the old early-return line that only checked chars/topics/poems.

- [ ] **Step 5: Run validation tests**

Run:

```bash
npm --prefix /f/Java_project/hanzi_atlas run test -- tests/validate-data.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git -C /f/Java_project/hanzi_atlas add lib/types.ts scripts/validate-data.ts tests/validate-data.test.ts
git -C /f/Java_project/hanzi_atlas commit -m "test(data): 增加成语数据校验"
```

---

### Task 2: Add idiom data and readers

**Files:**
- Create: `data/idioms.json`
- Modify: `lib/data.ts`

- [ ] **Step 1: Create idiom data**

Create `data/idioms.json`:

```json
[
  {
    "slug": "hua-long-dian-jing",
    "title": "画龙点睛",
    "source": "唐·张彦远《历代名画记》",
    "story": "传说张僧繇在金陵安乐寺墙上画了四条龙,却不点眼睛。旁人问其缘故,他说点睛之后龙会飞走。众人不信,他便为其中两条龙点上眼睛,霎时雷电破壁,两龙腾空而去。",
    "meaning": "比喻在关键处加上一笔,使内容顿时生动有力,也指说话或写文章点明要旨。",
    "usage": "这篇文章最后一句点明主题,有画龙点睛之妙。",
    "tags": ["艺术", "关键", "表达"]
  },
  {
    "slug": "shou-zhu-dai-tu",
    "title": "守株待兔",
    "source": "《韩非子·五蠹》",
    "story": "宋国有个农夫看见一只兔子撞在树桩上死去,便放下农具守在树桩旁,希望再捡到兔子。结果兔子没有再来,田地也荒废了。",
    "meaning": "比喻死守偶然经验,不知变通,也讽刺妄想不劳而获。",
    "usage": "学习不能守株待兔,要主动积累和练习。",
    "tags": ["勤勉", "变通", "寓言"]
  },
  {
    "slug": "wang-yang-bu-lao",
    "title": "亡羊补牢",
    "source": "《战国策·楚策》",
    "story": "有人羊圈破了洞,夜里丢了羊。邻人劝他修补羊圈,他起初不听,又丢了羊后才赶紧补好。此后羊再也没有丢失。",
    "meaning": "比喻出了问题以后及时补救,可以防止继续受损。",
    "usage": "发现流程有漏洞后立刻修正,正是亡羊补牢。",
    "tags": ["补救", "反省", "行动"]
  },
  {
    "slug": "ke-zhou-qiu-jian",
    "title": "刻舟求剑",
    "source": "《吕氏春秋·察今》",
    "story": "楚人乘船过江时剑落入水中,他在船边刻下记号,说等船停后从刻记号的地方下水找剑。船已前行,而剑留在原处,自然找不到。",
    "meaning": "比喻拘泥成法,不懂得情况已经变化。",
    "usage": "市场环境变了还照旧经营,无异于刻舟求剑。",
    "tags": ["变化", "方法", "寓言"]
  }
]
```

- [ ] **Step 2: Add idiom readers**

In `lib/data.ts`, update import:

```ts
import { Character, SCRIPT_LABELS, ScriptKey, SpringAutumnChapter, Topic, Poem, Idiom } from "./types";
```

After `_poems`, add:

```ts
let _idioms: Idiom[] | null = null;
```

After `getPoem()`, add:

```ts
export async function getAllIdioms(): Promise<Idiom[]> {
  if (_idioms) return _idioms;
  const raw = JSON.parse(await readFile(join(DATA, "idioms.json"), "utf8"));
  _idioms = z.array(Idiom).parse(raw);
  return _idioms;
}

export async function getIdiom(slug: string): Promise<Idiom | null> {
  const all = await getAllIdioms();
  return all.find(i => i.slug === slug) ?? null;
}
```

- [ ] **Step 3: Validate data**

Run:

```bash
npm --prefix /f/Java_project/hanzi_atlas run validate-data
```

Expected: `✓ data ok`.

- [ ] **Step 4: Commit Task 2**

```bash
git -C /f/Java_project/hanzi_atlas add data/idioms.json lib/data.ts
git -C /f/Java_project/hanzi_atlas commit -m "feat(idioms): 增加成语典故数据读取"
```

---

### Task 3: Update navigation and poem presentation

**Files:**
- Modify: `components/Header.tsx`
- Modify: `app/poems/page.tsx`
- Modify: `app/poems/[slug]/page.tsx`

- [ ] **Step 1: Update Header navigation**

In `components/Header.tsx`, replace the current `<nav>` block with:

```tsx
        <nav className="hidden sm:flex items-center gap-5 text-sm tracking-wider text-ink/75">
          <Link href="/poems" className="hover:text-[var(--color-vermilion)] transition-colors">诗词拾萃</Link>
          <Link href="/idioms" className="hover:text-[var(--color-vermilion)] transition-colors">成语典故</Link>
          <Link href="/about" className="hover:text-[var(--color-vermilion)] transition-colors">关于</Link>
        </nav>
```

- [ ] **Step 2: Replace poem list page with poem-paper layout**

Replace `app/poems/page.tsx` with:

```tsx
import Link from "next/link";
import { getAllPoems } from "@/lib/data";

export default async function PoemsPage() {
  const poems = await getAllPoems();

  return (
    <article className="max-w-5xl mx-auto">
      <header className="text-center mb-14 border-b border-[var(--color-rule)] pb-10">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
          <span>诗 词 拾 萃</span>
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
        </div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-3">诗词拾萃</h1>
        <p className="text-ink/60 leading-loose max-w-2xl mx-auto">
          摘取古典诗词中的月色、春声、江雪与登临,在短章里照见山河与心事。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {poems.map(poem => (
          <Link key={poem.slug} href={`/poems/${poem.slug}`} className="book-card block rounded-sm overflow-hidden group">
            {poem.imageSrc && (
              <div className="aspect-[4/3] border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                <img src={poem.imageSrc} alt={poem.imageAlt ?? poem.title} className="h-full w-full object-cover mix-blend-multiply" />
              </div>
            )}
            <div className="p-7 text-center">
              <div className="text-[10px] tracking-[0.35em] text-[var(--color-vermilion)] mb-3">
                {poem.dynasty} · {poem.author}
              </div>
              <h2 className="font-serif text-2xl text-ink group-hover:text-[var(--color-vermilion)] transition-colors mb-5">
                {poem.title}
              </h2>
              <div className="space-y-1.5 text-lg font-serif text-ink/80 leading-loose mb-6">
                {poem.lines.map(line => <p key={line}>{line}</p>)}
              </div>
              <div className="mx-auto w-8 h-px bg-[var(--color-rule-strong)] mb-4" />
              <p className="text-sm text-ink/55 leading-loose text-left">{poem.intro}</p>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Replace poem detail page labels and optional image**

Replace `app/poems/[slug]/page.tsx` with:

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
        返回诗词拾萃
      </Link>

      <header className="text-center my-12 border-b border-[var(--color-rule)] pb-10">
        <div className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">诗 词 拾 萃</div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-4">{poem.title}</h1>
        <p className="text-ink/55 tracking-wider text-sm">{poem.dynasty} · {poem.author}</p>
      </header>

      {poem.imageSrc && (
        <div className="mb-10 overflow-hidden rounded-sm border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
          <img src={poem.imageSrc} alt={poem.imageAlt ?? poem.title} className="w-full max-h-[28rem] object-cover mix-blend-multiply" />
        </div>
      )}

      <section className="text-center font-serif text-2xl leading-[2.4] text-ink mb-12">
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

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm --prefix /f/Java_project/hanzi_atlas run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit Task 3**

```bash
git -C /f/Java_project/hanzi_atlas add components/Header.tsx app/poems/page.tsx app/poems/[slug]/page.tsx
git -C /f/Java_project/hanzi_atlas commit -m "feat(poems): 优化诗词拾萃展示"
```

---

### Task 4: Add idiom pages

**Files:**
- Create: `app/idioms/page.tsx`
- Create: `app/idioms/[slug]/page.tsx`

- [ ] **Step 1: Create idiom list page**

Create `app/idioms/page.tsx`:

```tsx
import Link from "next/link";
import { getAllIdioms } from "@/lib/data";

export default async function IdiomsPage() {
  const idioms = await getAllIdioms();

  return (
    <article className="max-w-4xl mx-auto">
      <header className="text-center mb-12 border-b border-[var(--color-rule)] pb-10">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
          <span>典 故</span>
          <span className="w-8 h-px bg-[var(--color-vermilion)]/40" />
        </div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-3">成语典故</h1>
        <p className="text-ink/60 leading-loose max-w-2xl mx-auto">
          从古人故事里读成语,在简短四字中看见经验、警醒与智慧。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {idioms.map(idiom => (
          <Link key={idiom.slug} href={`/idioms/${idiom.slug}`} className="book-card block rounded-sm p-6 group">
            <div className="text-[10px] tracking-[0.35em] text-[var(--color-vermilion)] mb-3">{idiom.source}</div>
            <h2 className="font-serif text-2xl text-ink group-hover:text-[var(--color-vermilion)] transition-colors mb-4">
              {idiom.title}
            </h2>
            <p className="text-ink/70 leading-loose mb-5">{idiom.meaning}</p>
            <div className="flex flex-wrap gap-2">
              {idiom.tags.map(tag => (
                <span key={tag} className="text-xs tracking-wider text-ink/45 border border-[var(--color-rule)] px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Create idiom detail page**

Create directory `app/idioms/[slug]` and file `app/idioms/[slug]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllIdioms, getIdiom } from "@/lib/data";

export async function generateStaticParams() {
  const idioms = await getAllIdioms();
  return idioms.map(i => ({ slug: i.slug }));
}

export default async function IdiomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idiom = await getIdiom(slug);
  if (!idiom) notFound();

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/idioms" className="link-cinnabar text-sm text-ink/65 hover:text-[var(--color-vermilion)]">
        返回成语典故
      </Link>

      <header className="text-center my-12 border-b border-[var(--color-rule)] pb-10">
        <div className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-4">成 语 典 故</div>
        <h1 className="font-serif text-4xl text-ink tracking-wider mb-4">{idiom.title}</h1>
        <p className="text-ink/55 tracking-wider text-sm">{idiom.source}</p>
      </header>

      <section className="mb-10">
        <h2 className="chapter-mark font-serif text-xl text-ink mb-4 tracking-wider">典故故事</h2>
        <p className="text-ink/80 leading-loose indent-8">{idiom.story}</p>
      </section>

      <section className="mb-10 bg-[var(--color-paper-2)]/70 border-l-2 border-[var(--color-vermilion)] px-6 py-5">
        <h2 className="text-[10px] tracking-[0.4em] text-[var(--color-vermilion)] mb-3">寓意</h2>
        <p className="text-ink/80 leading-loose indent-8">{idiom.meaning}</p>
      </section>

      <section className="mb-10">
        <h2 className="chapter-mark font-serif text-xl text-ink mb-4 tracking-wider">今用</h2>
        <p className="text-ink/80 leading-loose indent-8">{idiom.usage}</p>
      </section>

      <div className="flex flex-wrap gap-2 pt-6 border-t border-[var(--color-rule)]">
        {idiom.tags.map(tag => (
          <span key={tag} className="text-xs tracking-wider text-ink/55 border border-[var(--color-rule)] px-3 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm --prefix /f/Java_project/hanzi_atlas run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 4: Commit Task 4**

```bash
git -C /f/Java_project/hanzi_atlas add app/idioms/page.tsx app/idioms/[slug]/page.tsx
git -C /f/Java_project/hanzi_atlas commit -m "feat(idioms): 新增成语典故页面"
```

---

### Task 5: Final verification

**Files:**
- No expected code changes.

- [ ] **Step 1: Run data validation**

Run:

```bash
npm --prefix /f/Java_project/hanzi_atlas run validate-data
```

Expected: `✓ data ok`.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm --prefix /f/Java_project/hanzi_atlas run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 3: Run tests**

Run:

```bash
npm --prefix /f/Java_project/hanzi_atlas run test
```

Expected: all Vitest tests pass.

- [ ] **Step 4: Run production build**

Run:

```bash
npm --prefix /f/Java_project/hanzi_atlas run build
```

Expected: Next build passes and lists `/idioms` plus four `/idioms/[slug]` pages.

- [ ] **Step 5: Browser verify pages**

Start or reuse the local dev server and verify:

```text
/
/poems
/poems/jing-ye-si
/idioms
/idioms/hua-long-dian-jing
```

Expected:

- `/` header nav shows `诗词拾萃 / 成语典故 / 关于`, with no `水` or `人` links.
- `/poems` title is `诗词拾萃`; poem cards use centered verse layout.
- `/poems/jing-ye-si` backlink says `返回诗词拾萃`; header label says `诗 词 拾 萃`.
- `/idioms` shows four idiom cards.
- `/idioms/hua-long-dian-jing` shows `典故故事`、`寓意`、`今用`.

- [ ] **Step 6: Check git status**

Run:

```bash
git -C /f/Java_project/hanzi_atlas status --short
```

Expected: no uncommitted files outside intentional implementation changes. Do not stage or commit `public/glyphs`.

---

## Self-Review

- Spec coverage: Task 1 covers `Poem` image fields and `Idiom` schema/validation. Task 2 covers idiom data and readers. Task 3 covers navigation cleanup, poem rename, image support, and poem-card layout. Task 4 covers idiom list/detail pages. Task 5 covers validation, typecheck, tests, build, and browser verification.
- Placeholder scan: This plan contains no unfinished placeholders; example image paths are schema support examples and no image files are created.
- Type consistency: `Idiom`, `getAllIdioms`, `getIdiom`, `imageSrc`, and `imageAlt` are consistently named across schema, data, readers, pages, and tests.
