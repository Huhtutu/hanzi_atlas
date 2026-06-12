# 字形演变(日月车马) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 4 个汉字(日 / 月 / 车 / 马)接入真实字形演变动画与结构化字源叙述,字形 SVG 在构建期由开源中文字体自动生成。

**Architecture:** 数据层把 `ScriptInfo.font` 字段改为 `glyphSrc`,`etymology` 由单段 string 升级为 `{intro, stages[5], modern}` 结构;新增 `scripts/build-glyphs.ts` 通过 `opentype.js` 从 `assets/fonts/` 下的开源字体读字形 path,写入 `public/glyphs/<char>/<script>.svg`,缺字回退占位;`EvolutionAnimation` 改为 SVG `<img>` 切换 + 时间轴 + 自动循环;字详情页抽出 `EvolutionSection` 客户端组件承载动画与字源叙述的联动。

**Tech Stack:** Next.js 15 / React 19 / TypeScript / Zod / opentype.js / Framer Motion / Vitest / tsx

**Reference spec:** `docs/superpowers/specs/2026-06-12-glyph-evolution-design.md`

---

## File Structure

新增:

- `lib/glyph.ts` — 字形渲染纯函数:`renderGlyphSvg(font, char)`、`renderPlaceholderSvg(char, scriptKey)`;字体阶段到字体文件名的映射常量
- `scripts/build-glyphs.ts` — 构建脚本,读 `data/characters.json` × 5 字体阶段 → 写 `public/glyphs/<char>/<script>.svg`
- `tests/build-glyphs.test.ts` — 测 `lib/glyph.ts` 的两个纯函数
- `components/EvolutionSection.tsx` — 客户端组件,内部 `useState` 当前阶段,组合 `EvolutionAnimation` + 字源叙述
- `assets/fonts/` — 开源字体源文件(构建输入)
- `assets/fonts/LICENSES/` — 各字体的 OFL 文本
- `docs/superpowers/specs/2026-06-12-glyph-evolution-design.md` — 已存在(spec)

修改:

- `lib/types.ts` — Zod schema:`ScriptInfo.font → glyphSrc`;`Character.etymology` 改结构化
- `data/characters.json` — 全部 10 条按新 schema 改写;日月车马补真实字源
- `tests/validate-data.test.ts` — fixture 跟新 schema 同步
- `components/EvolutionAnimation.tsx` — 改 SVG 切换 + 时间轴 + 自动循环
- `app/zi/[char]/page.tsx` — 用 `EvolutionSection` 替换原直挂的 `EvolutionAnimation`,字源段落改读结构化字段
- `components/CharCard.tsx` — 如果引用了旧 `etymology`,改读 `etymology.intro`
- `package.json` — 加 `build:glyphs` 脚本,改 `build` 串联;加 `opentype.js` 依赖
- `.gitignore` — 加 `public/glyphs/`
- `README.md` / `CLAUDE.md` — 标注新构建步骤

---

## Task 1: 数据类型与 schema 改造

**Files:**
- Modify: `lib/types.ts`
- Modify: `tests/validate-data.test.ts`
- Modify: `data/characters.json`
- Run: `npm run validate-data`, `npm run typecheck`, `npm run test`

- [ ] **Step 1: 更新 `lib/types.ts` 中的 Zod schema**

替换 `ScriptInfo` 与 `Character` 两个 schema(其他保持不变):

```ts
export const ScriptInfo = z.object({
  available: z.boolean(),
  glyphSrc: z.string().nullable(),
});

export const EtymologyStage = z.object({
  script: ScriptKey,
  text: z.string().min(1),
});

export const Etymology = z.object({
  intro: z.string().min(1),
  stages: z.array(EtymologyStage).length(5),
  modern: z.string().min(1),
});
export type Etymology = z.infer<typeof Etymology>;

export const Character = z.object({
  char: z.string().length(1),
  pinyin: z.array(z.string()).min(1),
  radical: z.string(),
  strokes: z.number().int().positive(),
  meanings: z.array(z.string()).min(1),
  etymology: Etymology,
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
```

- [ ] **Step 2: 改写 `tests/validate-data.test.ts` 的两个��联 fixture**

把第二个 / 第三个 `it(...)` 里的内联字符 `etymology: "x"` 改为合法的结构化对象,`font: "o"/...` 改为 `glyphSrc: null`。完整替换文件内容如下:

```ts
import { describe, it, expect } from "vitest";
import { validateAll } from "../scripts/validate-data";
import type { ScriptKey } from "../lib/types";

const SCRIPTS: ScriptKey[] = ["oracle", "bronze", "seal", "clerical", "regular"];

const sampleEtymology = {
  intro: "占位",
  stages: SCRIPTS.map(s => ({ script: s, text: "占位" })),
  modern: "占位",
};

const sampleScripts = {
  oracle:   { available: false, glyphSrc: null },
  bronze:   { available: false, glyphSrc: null },
  seal:     { available: false, glyphSrc: null },
  clerical: { available: false, glyphSrc: null },
  regular:  { available: true,  glyphSrc: null },
};

describe("validateAll", () => {
  it("passes for the shipped placeholder dataset", async () => {
    const result = await validateAll();
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("reports a missing related char as an error", async () => {
    const chars = [
      { char: "水", pinyin: ["shuǐ"], radical: "水", strokes: 4,
        meanings: ["x"], etymology: sampleEtymology,
        scripts: sampleScripts,
        morph: { enabled: false, svgDir: null }, topics: [], related: ["不存在"] }
    ];
    const result = await validateAll({ chars, topics: [] });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/related.*不存在/);
  });

  it("reports an unknown topic slug as an error", async () => {
    const chars = [
      { char: "水", pinyin: ["shuǐ"], radical: "水", strokes: 4,
        meanings: ["x"], etymology: sampleEtymology,
        scripts: sampleScripts,
        morph: { enabled: false, svgDir: null }, topics: ["ghost"], related: [] }
    ];
    const result = await validateAll({ chars, topics: [] });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/topic.*ghost/);
  });
});
```

- [ ] **Step 3: 改写 `data/characters.json` 的全部 10 条**

每条都按新 schema 重写。9 个非本期重点的字符(水 / 川 / 河 / 雨 / 人 / 大 / 立 / 从 / 山)使用**短占位 etymology** + 全部 `scripts.*.glyphSrc = null` + `regular.available: true`、其余 `available: false`。模板(以"水"为例)如下,把 `char/pinyin/radical/strokes/meanings/topics/related` 保持原值,只换字段结构:

```json
{
  "char": "水",
  "pinyin": ["shuǐ"],
  "radical": "水",
  "strokes": 4,
  "meanings": ["无色无味的液体", "江河湖海的总称"],
  "etymology": {
    "intro": "(占位)甲骨文像水流的形状,中间一道主流,两侧点为水花。",
    "stages": [
      { "script": "oracle",   "text": "(占位)甲骨阶段。" },
      { "script": "bronze",   "text": "(占位)金文阶段。" },
      { "script": "seal",     "text": "(占位)小篆阶段。" },
      { "script": "clerical", "text": "(占位)隶书阶段。" },
      { "script": "regular",  "text": "(占位)楷书阶段。" }
    ],
    "modern": "(占位)现代用法。"
  },
  "scripts": {
    "oracle":   { "available": false, "glyphSrc": null },
    "bronze":   { "available": false, "glyphSrc": null },
    "seal":     { "available": false, "glyphSrc": null },
    "clerical": { "available": false, "glyphSrc": null },
    "regular":  { "available": true,  "glyphSrc": null }
  },
  "morph": { "enabled": false, "svgDir": null },
  "topics": ["water"],
  "related": ["川", "河", "雨"]
}
```

按此模板把其余 8 个非本期字符(川 / 河 / 雨 / 人 / 大 / 立 / 从 / 山)也改写,字段值沿用原占位 etymology 字符串的语义,拆成 1 句 intro + 5 句 stages + 1 句 modern。

"日"也用此结构占位先放,真实字源在 Task 2 写实(避免本 task 体量过大)。

- [ ] **Step 4: 跑校验与测试**

```bash
npm run validate-data
npm run typecheck
npm run test
```

预期:全绿。`npm run test` 仍是 8/8 通过(测试数量不变,fixture 已对齐)。

- [ ] **Step 5: 提交**

```bash
git add lib/types.ts data/characters.json tests/validate-data.test.ts
git commit -m "refactor(data): 调整 ScriptInfo 与 etymology 数据结构"
```

---

## Task 2: 补齐日月车马的真实字源数据

**Files:**
- Modify: `data/characters.json`
- Run: `npm run validate-data`

仅改 4 条字符的 `pinyin / radical / strokes / meanings / etymology`,保持 `scripts.*` 仍为 Task 1 末态(`regular.available: true`,其余 `false`,所有 `glyphSrc: null`)——`glyphSrc` 由 Task 5 回填。

- [ ] **Step 1: 用以下完整 JSON 片段替换 `data/characters.json` 中"日"那一条**

```json
{
  "char": "日",
  "pinyin": ["rì"],
  "radical": "日",
  "strokes": 4,
  "meanings": ["太阳", "白天", "一昼夜", "时光、时日"],
  "etymology": {
    "intro": "「日」是独体象形字,本义为太阳。古人取太阳之圆形,并以中间一点表示日中之精,以与圆形的「囗」相区别。",
    "stages": [
      { "script": "oracle",   "text": "甲骨文阶段,「日」作圆形或近椭圆,内有一点或一短横,象太阳之轮廓,中点示其有质,以别于纯空圆。" },
      { "script": "bronze",   "text": "金文阶段,外廓由圆趋方,内部点画延长为短横,笔势已显规整,但仍保留象形意味。" },
      { "script": "seal",     "text": "小篆阶段,外廓定为方形,中间一短横居中,线条粗细均匀,书写规整,从象形过渡到符号。" },
      { "script": "clerical", "text": "隶书阶段,字形进一步方扁化,转折由弧改折,起收笔有蚕头雁尾意味,已接近今体。" },
      { "script": "regular",  "text": "楷书阶段,结构平正端方,横平竖直,「日」字最终定型为今日所见之形。" }
    ],
    "modern": "现代汉语中,「日」既指太阳,也表白天与昼夜之一日,亦用于「日记、日程、节日」等词;在地名国名中常缩写为「日」(如日本)。"
  },
  "scripts": {
    "oracle":   { "available": false, "glyphSrc": null },
    "bronze":   { "available": false, "glyphSrc": null },
    "seal":     { "available": false, "glyphSrc": null },
    "clerical": { "available": false, "glyphSrc": null },
    "regular":  { "available": true,  "glyphSrc": null }
  },
  "morph": { "enabled": false, "svgDir": null },
  "topics": [],
  "related": ["月", "山"]
}
```

注:"日"原 `topics` 与 `related` 沿用现有值;若原数据 `topics: []`、`related: ["月", "山"]`,与上方一致即可。如果原数据不同,以原数据为准、仅替换前面五个字段 + `etymology`。

- [ ] **Step 2: 新增"月"条目(如果不在 10 字内则追加,否则替换)**

`data/characters.json` 当前 10 字为 水 川 河 雨 人 大 立 从 山 日。"月"是**新增**第 11 个字符,追加到数组末尾(注意前一项末尾要有逗号):

```json
{
  "char": "月",
  "pinyin": ["yuè"],
  "radical": "月",
  "strokes": 4,
  "meanings": ["月亮", "时间单位「月」", "形如月之物"],
  "etymology": {
    "intro": "「月」是独体象形字,本义为月亮。古人见月常残缺不圆,故以弯钩之形表之,内加一点以别于「夕」。",
    "stages": [
      { "script": "oracle",   "text": "甲骨文阶段,「月」作弯钩状,开口向左或向右,内含一点,象残月之形,与「夕」(无点)同源而别。" },
      { "script": "bronze",   "text": "金文阶段,弯钩两端逐渐收拢,内部点画延长为短横,整体趋于稳定。" },
      { "script": "seal",     "text": "小篆阶段,字形规整化,外廓由弧线收为对称弯曲,内部两短横分明,书写已具笔顺。" },
      { "script": "clerical", "text": "隶书阶段,弧线方折,内部两横平直,整体由竖长改为略扁,接近今体。" },
      { "script": "regular",  "text": "楷书阶段,横折钩定型,内含两短横,结构匀称,作为部首与「肉」旁(月字旁)形近而义殊。" }
    ],
    "modern": "现代汉语中,「月」表月亮、月份,亦构词广泛,如「月光、月历、岁月、蜜月」等;作偏旁出现时,需注意区分「月(月亮)」与「肉月旁」。"
  },
  "scripts": {
    "oracle":   { "available": false, "glyphSrc": null },
    "bronze":   { "available": false, "glyphSrc": null },
    "seal":     { "available": false, "glyphSrc": null },
    "clerical": { "available": false, "glyphSrc": null },
    "regular":  { "available": true,  "glyphSrc": null }
  },
  "morph": { "enabled": false, "svgDir": null },
  "topics": [],
  "related": ["日"]
}
```

- [ ] **Step 3: 新增"车"条目**

```json
{
  "char": "车",
  "pinyin": ["chē", "jū"],
  "radical": "车",
  "strokes": 4,
  "meanings": ["陆地交通工具的总称", "带轮的器械", "象棋棋子(读 jū)"],
  "etymology": {
    "intro": "「车」是独体象形字,本义为车辆。甲骨文俯视取象,完整刻画车舆、车轴与两轮,字形繁复;后世逐步简省,只留中轴与轮形。",
    "stages": [
      { "script": "oracle",   "text": "甲骨文阶段,「车」作俯视全形,中央长横为车轴,两端各有车轮,有时连辕、衡、舆,笔画繁多。" },
      { "script": "bronze",   "text": "金文阶段,大体保留俯视形,但辕衡部分简省,轮形或简或繁,各家异形较多。" },
      { "script": "seal",     "text": "小篆阶段,字形线条化,只保留中轴一竖与上下轮形,左右对称,书写已具规范。" },
      { "script": "clerical", "text": "隶书阶段,轮形简化为横画,中竖贯穿,「車」(繁体)结构定型。" },
      { "script": "regular",  "text": "楷书阶段,繁体作「車」,简化字作「车」,以一横一竖一折一钩概括古文中的轮轴俯视图。" }
    ],
    "modern": "现代汉语中,「车」泛指各种陆地交通工具,如「汽车、火车、自行车」;在象棋中读 jū,为棋子名。"
  },
  "scripts": {
    "oracle":   { "available": false, "glyphSrc": null },
    "bronze":   { "available": false, "glyphSrc": null },
    "seal":     { "available": false, "glyphSrc": null },
    "clerical": { "available": false, "glyphSrc": null },
    "regular":  { "available": true,  "glyphSrc": null }
  },
  "morph": { "enabled": false, "svgDir": null },
  "topics": [],
  "related": []
}
```

- [ ] **Step 4: 新增"马"条目**

```json
{
  "char": "马",
  "pinyin": ["mǎ"],
  "radical": "马",
  "strokes": 3,
  "meanings": ["哺乳动物,可供乘骑、拉车", "象棋棋子", "姓"],
  "etymology": {
    "intro": "「马」是独体象形字,本义为马。古人侧面取象,突出马首、长鬃、四足与尾,字形随时代逐步抽象。",
    "stages": [
      { "script": "oracle",   "text": "甲骨文阶段,「马」作侧立马形,头颈高扬、鬃毛张举、四足分明、尾下垂,生动写实。" },
      { "script": "bronze",   "text": "金文阶段,鬃毛与马身合并,四足简化为两笔,但仍可辨识马形轮廓。" },
      { "script": "seal",     "text": "小篆阶段,线条化彻底完成,鬃尾以横竖排列示意,字形规整对称,已为符号。" },
      { "script": "clerical", "text": "隶书阶段,四足化为四点底「灬」(后世繁体「馬」),字形方折,结构定型。" },
      { "script": "regular",  "text": "楷书阶段,繁体作「馬」,简化字作「马」,以一横一竖折钩三笔概括,失象形之意而存音义。" }
    ],
    "modern": "现代汉语中,「马」既指马匹,也常作量词或喻词,如「人仰马翻、马到成功、一马当先」;在象棋中亦为棋子名,姓氏中亦常见。"
  },
  "scripts": {
    "oracle":   { "available": false, "glyphSrc": null },
    "bronze":   { "available": false, "glyphSrc": null },
    "seal":     { "available": false, "glyphSrc": null },
    "clerical": { "available": false, "glyphSrc": null },
    "regular":  { "available": true,  "glyphSrc": null }
  },
  "morph": { "enabled": false, "svgDir": null },
  "topics": [],
  "related": []
}
```

- [ ] **Step 5: 跑校验**

```bash
npm run validate-data
npm run test
```

预期:`✓ data ok`,测试 8/8 通过。

- [ ] **Step 6: 提交**

```bash
git add data/characters.json
git commit -m "feat(data): 补齐日月车马的真实字源数据"
```

---

## Task 3: 引入开源中文字体

**Files:**
- Create: `assets/fonts/<font files>`
- Create: `assets/fonts/LICENSES/*.txt`
- Modify: `.gitignore`(确保 `assets/fonts/` 不被忽略)

- [ ] **Step 1: 下载 Noto Serif CJK SC 与 Noto Sans CJK SC**

从 Google Fonts / GitHub 上的 notofonts/noto-cjk 仓库,获取以下 **OTF/OTC 单文件**(直接静态文件链接,无需打包整套):

- `NotoSerifCJKsc-Regular.otf`(用于 `regular` 阶段)
- `NotoSansCJKsc-Regular.otf`(用于 `clerical` 阶段,作为代用字体)

下载链接示例(实施时可改用 npm 包 `@fontsource-variable/noto-serif-sc` 等,只要拿到原始 otf):

- https://github.com/notofonts/noto-cjk/raw/main/Serif/OTF/SimplifiedChinese/NotoSerifCJKsc-Regular.otf
- https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf

保存为:
- `assets/fonts/NotoSerifCJKsc-Regular.otf`
- `assets/fonts/NotoSansCJKsc-Regular.otf`

如果网络受限,可以用 `curl -L -o <path> <url>`;如果两个 URL 均不可达,**停下来报告 BLOCKED**,不要私自换字体。

- [ ] **Step 2: 尝试为 oracle / bronze / seal 三个阶段找开源字体(尽力而为)**

候选(任选可下载到的,放到 `assets/fonts/`,文件名保持原名):

- 甲骨文(oracle):汉鼎甲骨文 / Jiaguwen 等社区字体
- 金文(bronze):汉鼎金文 等
- 小篆(seal):方正小篆体 / 上图东观体 / 仓耳渔阳体 等

若三者完全找不到合法开源版本,**接受现状,留空**,Task 4 的脚本会自动输出占位 SVG。**不要**用未授权字体。

记录在本步骤的备注里:实际下载到了哪几款字体、文件名是什么。

- [ ] **Step 3: 写入各字体许可文件**

为每款下载的字体,在 `assets/fonts/LICENSES/` 下写入对应 OFL 文本。Noto 系列许可可从 notofonts 仓库 LICENSE 文件复制:

- `assets/fonts/LICENSES/Noto-OFL.txt`(Noto Serif/Sans CJK SC 共用)
- 其他字体若下载了,各自写 `<font-name>-OFL.txt`

- [ ] **Step 4: 检查 `.gitignore`**

确保 `.gitignore` 中**没有**忽略 `assets/`。如果有,删掉。当前预期 `.gitignore` 只忽略 `node_modules / .next / out / .env*.local / *.tsbuildinfo / next-env.d.ts / data/search-index.json / public/search-index.json`,不动 `assets/`。

- [ ] **Step 5: 列出字体目录确认**

```bash
ls -la assets/fonts/
ls -la assets/fonts/LICENSES/
```

至少应能看到 `NotoSerifCJKsc-Regular.otf` 与对应的 OFL。

- [ ] **Step 6: 提交**

```bash
git add assets/fonts/ .gitignore
git commit -m "build(assets): 引入开源中文字体与许可文件"
```

注:Noto Serif CJK SC 单文件约 20MB+,该提交体量会较大。如果用户有 git-lfs 偏好,实施期可先停下询问;否则按本计划直接入库。

---

## Task 4: build-glyphs 脚本与字形渲染纯函数

**Files:**
- Create: `lib/glyph.ts`
- Create: `scripts/build-glyphs.ts`
- Create: `tests/build-glyphs.test.ts`
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: 安装 opentype.js**

```bash
npm install --save-dev opentype.js @types/opentype.js
```

- [ ] **Step 2: 先写失败测试 `tests/build-glyphs.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import opentype from "opentype.js";
import { renderGlyphSvg, renderPlaceholderSvg } from "../lib/glyph";

const NOTO_SERIF = join(process.cwd(), "assets/fonts/NotoSerifCJKsc-Regular.otf");

describe("renderGlyphSvg", () => {
  it("returns an svg with a path for a covered character", async () => {
    const buf = await readFile(NOTO_SERIF);
    const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const svg = renderGlyphSvg(font, "日");
    expect(svg).toMatch(/<svg\b/);
    expect(svg).toMatch(/viewBox="0 0 1000 1000"/);
    expect(svg).toMatch(/<path\b[^>]*\bd="/);
  });

  it("returns a placeholder svg when the font lacks the character", async () => {
    const buf = await readFile(NOTO_SERIF);
    const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const svg = renderGlyphSvg(font, "");
    expect(svg).toMatch(/class="placeholder"/);
  });
});

describe("renderPlaceholderSvg", () => {
  it("contains the placeholder marker and the script label", () => {
    const svg = renderPlaceholderSvg("日", "oracle");
    expect(svg).toMatch(/class="placeholder"/);
    expect(svg).toMatch(/viewBox="0 0 1000 1000"/);
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

```bash
npm run test -- tests/build-glyphs.test.ts
```

预期:FAIL,提示 `lib/glyph` 找不到或 `renderGlyphSvg is not a function`。

- [ ] **Step 4: 创建 `lib/glyph.ts`**

```ts
import type opentype from "opentype.js";
import type { ScriptKey } from "./types";

const VIEWBOX = "0 0 1000 1000";

export function renderGlyphSvg(font: opentype.Font, char: string): string {
  const glyph = font.charToGlyph(char);
  if (!glyph || glyph.unicode === undefined) {
    return renderPlaceholderSvg(char, "regular");
  }
  const codePoint = char.codePointAt(0);
  if (glyph.unicode !== codePoint) {
    return renderPlaceholderSvg(char, "regular");
  }

  const unitsPerEm = font.unitsPerEm;
  const scale = 1000 / unitsPerEm;
  const path = glyph.getPath(0, 0, unitsPerEm);
  const bbox = path.getBoundingBox();
  const cx = (bbox.x1 + bbox.x2) / 2;
  const cy = (bbox.y1 + bbox.y2) / 2;
  const w = bbox.x2 - bbox.x1;
  const h = bbox.y2 - bbox.y1;
  const margin = 100;
  const target = 1000 - margin * 2;
  const fit = Math.min(target / Math.max(w, 1), target / Math.max(h, 1)) * scale;

  const tx = 500 - cx * fit / scale;
  const ty = 500 - cy * fit / scale;

  const d = glyph.getPath(tx, ty, unitsPerEm * fit / scale).toPathData(3);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="currentColor"><path d="${d}"/></svg>`;
}

export function renderPlaceholderSvg(char: string, _script: ScriptKey | "regular"): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" class="placeholder">
  <rect x="80" y="80" width="840" height="840" rx="40" fill="#EFEAE2" stroke="#C9C2B6" stroke-width="6"/>
  <text x="500" y="560" text-anchor="middle" font-size="320" fill="#9A8F7A" font-family="serif">?</text>
</svg>`;
}
```

- [ ] **Step 5: 跑测试确认通过**

```bash
npm run test -- tests/build-glyphs.test.ts
```

预期:2 个测试通过。

- [ ] **Step 6: 写构建脚本 `scripts/build-glyphs.ts`**

```ts
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import opentype from "opentype.js";
import { Character, ScriptKey, SCRIPT_ORDER } from "../lib/types";
import { renderGlyphSvg, renderPlaceholderSvg } from "../lib/glyph";
import { z } from "zod";

const FONT_MAP: Record<ScriptKey, string | null> = {
  oracle:   null, // 占位:若 assets/fonts 下有甲骨文字体,改为相对路径
  bronze:   null,
  seal:     null,
  clerical: "assets/fonts/NotoSansCJKsc-Regular.otf",
  regular:  "assets/fonts/NotoSerifCJKsc-Regular.otf",
};

async function loadFont(relPath: string | null): Promise<opentype.Font | null> {
  if (!relPath) return null;
  const abs = join(process.cwd(), relPath);
  if (!existsSync(abs)) return null;
  const buf = await readFile(abs);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

export interface BuildResult {
  written: number;
  placeholders: number;
}

export async function buildGlyphs(): Promise<BuildResult> {
  const rawChars = JSON.parse(await readFile(join(process.cwd(), "data/characters.json"), "utf8"));
  const chars = z.array(Character).parse(rawChars);

  const fonts: Partial<Record<ScriptKey, opentype.Font | null>> = {};
  for (const s of SCRIPT_ORDER) fonts[s] = await loadFont(FONT_MAP[s]);

  let written = 0;
  let placeholders = 0;
  for (const c of chars) {
    const outDir = join(process.cwd(), "public/glyphs", c.char);
    await mkdir(outDir, { recursive: true });
    for (const s of SCRIPT_ORDER) {
      const font = fonts[s];
      let svg: string;
      if (!font) {
        svg = renderPlaceholderSvg(c.char, s);
        placeholders++;
        console.warn(`[build-glyphs] no font for ${c.char}/${s}, using placeholder`);
      } else {
        const candidate = renderGlyphSvg(font, c.char);
        if (candidate.includes('class="placeholder"')) {
          placeholders++;
          console.warn(`[build-glyphs] font lacks ${c.char}/${s}, using placeholder`);
        } else {
          written++;
        }
        svg = candidate;
      }
      await writeFile(join(outDir, `${s}.svg`), svg, "utf8");
    }
  }
  return { written, placeholders };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
    import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  buildGlyphs().then(r => {
    console.log(`✓ glyphs: ${r.written} real, ${r.placeholders} placeholder`);
  }).catch(e => { console.error(e); process.exit(1); });
}
```

- [ ] **Step 7: 改 `package.json` scripts 段**

把 `build:glyphs` 加进来,`build` 串成 glyphs → search-index → next build:

```json
"scripts": {
  "dev": "next dev",
  "build": "npm run build:glyphs && npm run build:search-index && next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "validate-data": "tsx scripts/validate-data.ts",
  "build:glyphs": "tsx scripts/build-glyphs.ts",
  "build:search-index": "tsx scripts/build-search-index.ts",
  "test": "vitest run"
}
```

- [ ] **Step 8: 把 `public/glyphs/` 加入 `.gitignore`**

在 `.gitignore` 末尾追加一行:

```
public/glyphs/
```

- [ ] **Step 9: 跑一次脚本 + typecheck + 全量测试**

```bash
npm run build:glyphs
npm run typecheck
npm run test
```

预期:`✓ glyphs: N real, M placeholder` 打印;typecheck 无错;`npm run test` 全绿(原 8 个 + 新增 3 个 = 11 个)。

`public/glyphs/日/regular.svg` 应存在且包含 `<path d="`。

- [ ] **Step 10: 提交**

```bash
git add lib/glyph.ts scripts/build-glyphs.ts tests/build-glyphs.test.ts package.json package-lock.json .gitignore
git commit -m "feat(build): 新增 build-glyphs 脚本生成 SVG"
```

---

## Task 5: 根据生成结果回填 `scripts.available` 与 `glyphSrc`

**Files:**
- Modify: `data/characters.json`
- Run: `npm run build:glyphs`, `npm run validate-data`

- [ ] **Step 1: 重新跑一次 glyphs 构建并检查产物**

```bash
npm run build:glyphs
ls public/glyphs/日/
ls public/glyphs/月/
ls public/glyphs/车/
ls public/glyphs/马/
```

记录每个 `<char>/<script>.svg` 是不是占位(可以 `grep -l 'class="placeholder"' public/glyphs/<char>/*.svg` 找出占位文件)。

- [ ] **Step 2: 对 4 个真实字符回填 `scripts`**

对 日 / 月 / 车 / 马 四个字符,把:

- 凡是 SVG 不含 `class="placeholder"` 的阶段 → `available: true`,`glyphSrc: "/glyphs/<char>/<script>.svg"`
- 仍是占位的阶段 → `available: false`,`glyphSrc: null`

举例(若 Task 3 只有 Serif + Sans 接入,则 4 字皆只有 `clerical` 与 `regular` 真实):

```json
"scripts": {
  "oracle":   { "available": false, "glyphSrc": null },
  "bronze":   { "available": false, "glyphSrc": null },
  "seal":     { "available": false, "glyphSrc": null },
  "clerical": { "available": true,  "glyphSrc": "/glyphs/日/clerical.svg" },
  "regular":  { "available": true,  "glyphSrc": "/glyphs/日/regular.svg" }
}
```

- [ ] **Step 3: 对其余 9 个非本期字符同步回填 `regular`**

它们 `regular` 一直 `available: true`,把 `glyphSrc` 填为 `"/glyphs/<char>/regular.svg"`,其余阶段保持 `false / null`。

- [ ] **Step 4: 校验**

```bash
npm run validate-data
npm run typecheck
npm run test
```

预期全绿。

- [ ] **Step 5: 提交**

```bash
git add data/characters.json
git commit -m "feat(data): 根据生成结果回填 scripts.available 与 glyphSrc"
```

---

## Task 6: EvolutionAnimation 改 SVG 切换 + 时间轴

**Files:**
- Modify: `components/EvolutionAnimation.tsx`

- [ ] **Step 1: 完整替换组件文件**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCRIPT_ORDER, SCRIPT_LABELS, type ScriptKey, type Character } from "@/lib/types";

const STEP_MS = 1600;
const REGULAR_HOLD_MS = 2400;

interface Props {
  c: Character;
  onStageChange?: (s: ScriptKey) => void;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function EvolutionAnimation({ c, onStageChange }: Props) {
  const firstReal = SCRIPT_ORDER.find(k => c.scripts[k].available) ?? "regular";
  const [active, setActive] = useState<ScriptKey>(firstReal);
  const [playing, setPlaying] = useState(true);
  const reduced = usePrefersReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { onStageChange?.(active); }, [active, onStageChange]);

  useEffect(() => {
    if (reduced || !playing) return;
    const tick = () => {
      setActive(prev => {
        const idx = SCRIPT_ORDER.indexOf(prev);
        const next = SCRIPT_ORDER[(idx + 1) % SCRIPT_ORDER.length];
        return next;
      });
    };
    const delay = active === "regular" ? REGULAR_HOLD_MS : STEP_MS;
    timer.current = setTimeout(tick, delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [active, playing, reduced]);

  const current = c.scripts[active];
  const src = current.glyphSrc;

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <ol className="flex items-center gap-2">
        {SCRIPT_ORDER.map(k => {
          const isActive = k === active;
          const info = c.scripts[k];
          return (
            <li key={k} className="flex flex-col items-center gap-1">
              <button
                onClick={() => { setPlaying(false); setActive(k); }}
                aria-label={`切换到${SCRIPT_LABELS[k]}`}
                className={`h-3 w-3 rounded-full border transition-colors ${isActive ? "bg-vermilion border-vermilion" : "border-ink/40"}`}
              />
              <span className={`text-xs ${isActive ? "text-vermilion" : "text-ink/60"}`}>{SCRIPT_LABELS[k]}</span>
              {!info.available && <span className="text-[10px] text-ink/40">暂缺</span>}
            </li>
          );
        }).reduce<JSX.Element[]>((acc, node, i, arr) => {
          acc.push(node);
          if (i < arr.length - 1) acc.push(<li key={`sep-${i}`} aria-hidden className="w-8 h-px bg-ink/20 mt-1.5" />);
          return acc;
        }, [])}
      </ol>

      <button
        onClick={() => setPlaying(p => !p)}
        aria-label={playing ? "暂停演变" : "播放演变"}
        className="relative w-64 h-64 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={src ?? `/glyphs/${c.char}/${active}.svg`}
            alt={`${c.char} ${SCRIPT_LABELS[active]}`}
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
            className="w-full h-full text-ink"
          />
        </AnimatePresence>
      </button>

      <p className="text-xs text-ink/50">{playing ? "点击画面暂停" : "点击画面继续"}</p>
    </div>
  );
}
```

注:reduce 中用 `JSX.Element[]` 是 React 19 自动 import 可用的全局类型;若 tsc 报错,改用 `React.ReactNode[]` 并 `import React from "react"`。

- [ ] **Step 2: typecheck**

```bash
npm run typecheck
```

预期:无错。若出现 `JSX.Element` 找不到,改为 `React.ReactNode` + 顶部 `import React from "react"`。

- [ ] **Step 3: 提交**

```bash
git add components/EvolutionAnimation.tsx
git commit -m "feat(ui): EvolutionAnimation 改 SVG 切换 + 时间轴"
```

---

## Task 7: 字详情页字源叙述与动画联动

**Files:**
- Create: `components/EvolutionSection.tsx`
- Modify: `app/zi/[char]/page.tsx`
- Modify: `components/CharCard.tsx`(如有 `etymology` 引用)

- [ ] **Step 1: 创建 `components/EvolutionSection.tsx`**

```tsx
"use client";
import { useState } from "react";
import EvolutionAnimation from "./EvolutionAnimation";
import { SCRIPT_ORDER, SCRIPT_LABELS, type Character, type ScriptKey } from "@/lib/types";

export default function EvolutionSection({ c }: { c: Character }) {
  const first = SCRIPT_ORDER.find(k => c.scripts[k].available) ?? "regular";
  const [stage, setStage] = useState<ScriptKey>(first);
  const stageText = c.etymology.stages.find(s => s.script === stage)?.text
    ?? c.etymology.stages[c.etymology.stages.length - 1].text;

  return (
    <section className="space-y-6">
      <p className="text-ink/85 leading-relaxed">{c.etymology.intro}</p>
      <EvolutionAnimation c={c} onStageChange={setStage} />
      <div>
        <h3 className="font-serif text-base text-ink/70 mb-1">{SCRIPT_LABELS[stage]}阶段</h3>
        <p className="text-ink/85 leading-relaxed">{stageText}</p>
      </div>
      <p className="text-ink/85 leading-relaxed">{c.etymology.modern}</p>
    </section>
  );
}
```

- [ ] **Step 2: 改 `app/zi/[char]/page.tsx`**

把 `EvolutionAnimation` 的 import 与使用全部换成 `EvolutionSection`,并把旧的"字源"段落删掉(它的内容已被 `EvolutionSection` 包含)。完整文件如下:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCharacters, getCharacter, getAllTopics } from "@/lib/data";
import EvolutionSection from "@/components/EvolutionSection";
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
        <EvolutionSection c={c} />
        <dl className="grid grid-cols-3 gap-4 mt-10 text-sm">
          <div><dt className="text-ink/50">拼音</dt><dd>{c.pinyin.join(" / ")}</dd></div>
          <div><dt className="text-ink/50">部首</dt><dd>{c.radical}</dd></div>
          <div><dt className="text-ink/50">笔画</dt><dd>{c.strokes}</dd></div>
        </dl>
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

- [ ] **Step 3: 检查 `components/CharCard.tsx` 是否引用旧 `etymology` 字段**

```bash
grep -n "etymology" components/CharCard.tsx components/CharCardMorph.tsx components/TopicCoverCard.tsx components/TopicSection.tsx 2>/dev/null || true
```

如果有任何文件直接读 `c.etymology`(当作字符串),改成 `c.etymology.intro`。如果没有,跳过本步骤。

- [ ] **Step 4: typecheck + 全测试 + 数据校验**

```bash
npm run typecheck
npm run test
npm run validate-data
```

预期:全绿。

- [ ] **Step 5: dev smoke**

```bash
npm run dev > /tmp/next-dev.log 2>&1 &
sleep 8
curl -s -o /tmp/r1.html -w "%{http_code}\n" http://localhost:3000/zi/%E6%97%A5
curl -s -o /tmp/r2.html -w "%{http_code}\n" http://localhost:3000/zi/%E6%9C%88
curl -s -o /tmp/r3.html -w "%{http_code}\n" http://localhost:3000/zi/%E8%BD%A6
curl -s -o /tmp/r4.html -w "%{http_code}\n" http://localhost:3000/zi/%E9%A9%AC
grep -c "象形字" /tmp/r1.html
grep -c "象形字" /tmp/r2.html
grep -c "象形字" /tmp/r3.html
grep -c "象形字" /tmp/r4.html
```

预期:4 个 200,4 个 grep 计数 ≥ 1。然后:

```bash
# 杀掉 dev 进程(Windows / Git Bash)
taskkill //F //IM node.exe 2>/dev/null || kill %1 2>/dev/null || true
```

- [ ] **Step 6: 提交**

```bash
git add components/EvolutionSection.tsx "app/zi/[char]/page.tsx"
# 如果 CharCard 等有调整:
# git add components/CharCard.tsx
git commit -m "feat(page): 字详情页字源叙述与动画联动"
```

---

## Task 8: 更新文档

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: 在 `README.md` 的"常用命令"或"开发"小节增加 `build:glyphs` 说明**

加一段(措辞按现有 README 风格微调):

```md
### 字形构建

```bash
npm run build:glyphs
```

`scripts/build-glyphs.ts` 会读 `assets/fonts/` 下的开源中文字体,为 `data/characters.json` 中的每个字 × 每个字体阶段生成 `public/glyphs/<字>/<阶段>.svg`,缺字阶段输出占位 SVG。该步骤已串入 `npm run build`。
```

- [ ] **Step 2: 在 `CLAUDE.md` 的"常用命令"和"开发约定"部分补充**

- 在"常用命令"块末尾加 `npm run build:glyphs  # 单独重建字形 SVG`
- 在"数据层"小节末尾追加一段:

```md
- 改动 `data/characters.json` 后,字形产物需要重建:`npm run build:glyphs`。`public/glyphs/` 是构建产物,被 `.gitignore` 忽略。
- 新接入字体须放到 `assets/fonts/` 并在 `assets/fonts/LICENSES/` 写入对应许可文本;在 `scripts/build-glyphs.ts` 的 `FONT_MAP` 中登记。
```

- [ ] **Step 3: 提交**

```bash
git add README.md CLAUDE.md
git commit -m "docs: 更新 README 与 CLAUDE.md 标注 build:glyphs 步骤"
```

---

## 验收清单(实施完成后逐项核对)

- [ ] `npm run validate-data` → `✓ data ok`
- [ ] `npm run typecheck` → 无错
- [ ] `npm run test` → 全绿(原 8 + build-glyphs 新增 3 = 11)
- [ ] `npm run build:glyphs` → 输出 N real / M placeholder,且 `public/glyphs/日|月|车|马/regular.svg` 存在
- [ ] `npm run build` → 成功(含 glyphs / search-index / next build)
- [ ] dev smoke:`/zi/日 月 车 马` 四页 200 且响应含字源 intro 文本
- [ ] 浏览器肉眼验证:动画自动循环、点圆点切换、暂缺阶段显示「暂缺」、reduced-motion 关闭动画
- [ ] git log 至少 8 个新 commits(Task 1–8 各一)
