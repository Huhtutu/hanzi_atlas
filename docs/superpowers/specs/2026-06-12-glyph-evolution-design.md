# 字形演变功能设计 — 日 / 月 / 车 / 马

- 状态:设计已确认,待写实施计划
- 日期:2026-06-12
- 范围:为 4 个汉字(日、月、车、马)接入真实字形演变动画与字源叙述
- 关联文档:`docs/superpowers/plans/2026-06-11-hanzi-atlas-skeleton.md`(骨架),`docs/specs/2026-06-11-hanzi-atlas-design.md`(整体设计)

## 1. 目标

复刻一张「日月车马」从甲骨文到楷书的演变示意图:

- 每个字在 5 种字体阶段(甲骨文 / 金文 / 小篆 / 隶书 / 楷书)各有一个 SVG 字形
- 字详情页 `app/zi/[char]/page.tsx` 通过 `EvolutionAnimation` 组件呈现真实的字形切换动画
- 配套结构化字源叙述,与动画状态联动:点哪个阶段、下方就显示哪段文字

非目标:

- 不实现 SVG 路径插值的「连续变形」动画(留待 C 方案)
- 不为其余 9 个占位字符接入真实字形(本次仅 4 字)
- 不涉及主题专题、检索逻辑

## 2. 资源与依赖

### 字体

来源全部 SIL OFL,可商用、可分发。文件放仓库内:

- `assets/fonts/` — 字体源文件(构建输入,不直接发布到 `public/`)
- `assets/fonts/LICENSES/` — 每款字体配套的 `OFL.txt`

初始接入:

| 字体 | 用途字体阶段 | 备注 |
| --- | --- | --- |
| Noto Serif CJK SC | regular(楷书) | 强制入库,作为兜底 |
| Noto Sans CJK SC | clerical(隶书,代替) | 若找不到独立隶书字体,先用 Sans 充当 |
| 小篆开源字体(若找到) | seal(小篆) | 缺则该阶段输出占位 SVG |
| 金文开源字体(若找到) | bronze | 缺则占位 |
| 甲骨文开源字体(若找到) | oracle | 缺则占位 |

缺字策略:`build-glyphs.ts` 在该字 × 该字体阶段找不到字形或字体未提供时,输出**占位 SVG**(灰底问号),并向 stdout 打印 warning;`characters.json` 该字体阶段保持 `available: false`、`glyphSrc: null`。

### npm 依赖

- 新增 `opentype.js`(devDependencies):读字体文件,按 Unicode 取 glyph path

### 构建管线

- 新增 `npm run build:glyphs`
- `npm run build` 改为:`npm run build:glyphs && npm run build:search-index && next build`
- `public/glyphs/**` 加入 `.gitignore`(产物)

## 3. 数据模型变化

### `lib/types.ts`(Zod schema)

**`ScriptInfo` 改名字段:**

```ts
// 旧
{ available: boolean, font: string | null }
// 新
{ available: boolean, glyphSrc: string | null }
```

`glyphSrc` 取值如 `/glyphs/日/regular.svg`,`null` 表示该阶段缺字。

**`Character.etymology` 改为结构化:**

```ts
etymology: {
  intro: string,                      // 50–80 字总览
  stages: Array<{
    script: ScriptKey,
    text: string,                     // 60–100 字,讲述该字体阶段形变
  }>,                                 // 长度恰好 5,顺序固定 oracle→bronze→seal→clerical→regular
  modern: string,                     // 50–80 字现代用法/引申
}
```

Zod 上对 `stages` 加 `.length(5)` 并对每条 `script` 用 `ScriptKey`。

### `data/characters.json`

- 10 个字符全部按新 schema 改写
- 9 个占位字符:`etymology.intro/stages[i].text/modern` 用短占位文本(保持可校验、不必精彩);`scripts.*.glyphSrc = null`、`scripts.*.available = false`(除 `regular` 仍保持原状)
- 4 个真实字符(日 / 月 / 车 / 马)按 § 4 写实

### `morph.enabled`

保持 `false`,本次不动。

## 4. 字源叙述生成

由 Claude 直接基于通行字源学常识(《说文》《汉字源流字典》层级)撰写,中文,书面但不学术化,不带学术引用。后续可由专业校订。

每个字的 `etymology` 涵盖:

- `intro`:本义、构形要点(独体 / 合体 / 象形 / 会意)
- `stages[i].text`:该字体阶段的字形特征与上一阶段的形变要点
- `modern`:现代汉语中的常见义项与典型搭配

四字大致提纲(实施时再展开成完整段落):

| 字 | 本义 | 关键演变线索 |
| --- | --- | --- |
| 日 | 太阳 | 甲骨象日轮含点 → 金文圆中加点 → 小篆方框横画 → 隶书方扁 → 楷书定型 |
| 月 | 月亮 | 甲骨象残月内有点 → 金文弯曲收口 → 小篆笔画规整 → 隶书结构定 → 楷书 |
| 车 | 战车/车辆 | 甲骨象车舆轮辐俯视图(繁) → 金文简化保留两轮 → 小篆只留中轴轮 → 隶书简化 → 楷书 |
| 马 | 马 | 甲骨象马侧面带鬃尾 → 金文鬃尾抽象 → 小篆笔画规整化 → 隶书四点底确立 → 楷书 |

## 5. SVG 生成脚本

### `scripts/build-glyphs.ts`

伪流程:

```
for each character in characters.json:
  for each script in [oracle, bronze, seal, clerical, regular]:
    font = loadFontFor(script)          // 见字体映射表
    if !font: writePlaceholder(); warn; continue
    glyph = font.charToGlyph(character)
    if !glyph || glyph.unicode != character.codePoint:
      writePlaceholder(); warn; continue
    path = glyph.getPath(0, 0, 1000)    // baseline 后续在 SVG viewBox 里居中
    svg = wrapSvg(path, viewBox)
    write to public/glyphs/<char>/<script>.svg
```

字体映射表:写在脚本顶部,字面常量。每条 `{ script, fontFile, fontFamilyName }`。

`wrapSvg`:统一 `viewBox="0 0 1000 1000"`,`fill: currentColor`,路径居中。

占位 SVG:`<svg viewBox="0 0 1000 1000">` + 浅灰圆角矩形 + 中央问号。

### 测试 `tests/build-glyphs.test.ts`

- 用一个小型 fixture 字体(Noto 子集或脚本测试用 fixture)验证 `renderGlyphSvg(font, '日')` 返回的字符串包含 `<svg` 与 `<path d="M`
- 验证缺字时返回占位 SVG(含特定 marker class 如 `class="placeholder"`)

不在测试中跑整个 4 字 × 5 阶段流水线(那要带字体文件,过重);真实回归走 dev smoke。

### `package.json`

```json
"scripts": {
  "build:glyphs": "tsx scripts/build-glyphs.ts",
  "build": "npm run build:glyphs && npm run build:search-index && next build"
}
```

`.gitignore` 追加:

```
public/glyphs/
```

## 6. 前端组件

### `components/EvolutionAnimation.tsx`(重写)

Props:`{ char: string, scripts: Character["scripts"], onStageChange?: (s: ScriptKey) => void }`

布局:

```
┌────────────────────────────────────────────┐
│  ●——●——●——●——●         ← 时间轴 5 圆点    │
│  甲骨 金文 小篆 隶 楷                       │
│                                            │
│        ┌──────────────┐                    │
│        │              │                    │
│        │   <img svg>  │   ← 256×256 画布    │
│        │              │                    │
│        └──────────────┘                    │
└────────────────────────────────────────────┘
```

行为:

- 自动播放:每 1.6s 推进一档,到 `regular` 后停留 2.4s,然后从 `oracle` 重新开始(循环)
- 用户点圆点 → 跳到该阶段并暂停自动播放;点画布恢复自动播放
- Framer Motion:切换时 cross-fade + scale 0.92→1,duration 220ms
- `prefers-reduced-motion`:禁用自动播放与缩放,只保留圆点点击切换 + 立即替换
- 缺字阶段:画布显示占位 SVG,圆点下方加小字「暂缺」,自动播放仍会跳过到下一阶段(避免长时间停在占位)
- 通过 `onStageChange` 把当前阶段通知父组件(供字源叙述联动)

### `app/zi/[char]/page.tsx`

页面中新增「字形演变」区块,结构:

```tsx
<section>
  <p>{character.etymology.intro}</p>
  <EvolutionAnimation
    char={character.char}
    scripts={character.scripts}
    onStageChange={setStage}
  />
  <p>{character.etymology.stages[stageIndex].text}</p>
  <p>{character.etymology.modern}</p>
</section>
```

因为 `useState` + `onStageChange` 是客户端,需要将这整个 section 抽到一个 `"use client"` 子组件(例如 `components/EvolutionSection.tsx`),页面服务端组件仅传 props 进去。

### 其他组件影响

- `CharCard.tsx`:若展示了字源 `etymology` 任何字段,改读 `etymology.intro`(用最短的预览),否则不动
- `CharCardMorph.tsx`:不动(继续按 `morph.enabled` 判定,这次都是 `false`)

## 7. 测试与验证

硬门槛:

- `npm run validate-data` ✅
- `npm run typecheck` ✅
- `npm run test` ✅(原 8 个 + 新增 build-glyphs 用例)
- `npm run build` ✅(含 build:glyphs、build:search-index、next build 全过)
- dev smoke:`/zi/日`、`/zi/月`、`/zi/车`、`/zi/马` 返回 200,响应 HTML 包含对应字源 intro 文本片段
- 手动浏览器验证:动画自动播放、点圆点可切换、字源文本联动、reduced-motion 下表现正常

测试用例增减:

- 扩展 `tests/validate-data.test.ts` fixture 以匹配新 schema(数据 fixture 改写,断言保持)
- 新增 `tests/build-glyphs.test.ts`(2 个用例:正常生成 / 缺字占位)
- 不新增 e2e 框架,dev smoke 用 curl 手工跑

## 8. 实施分步(预期 commits)

每步独立可回滚,按顺序提交:

1. `refactor(data): 调整 ScriptInfo 与 etymology 数据结构`
2. `feat(data): 补齐日月车马的真实字源数据`
3. `build(assets): 引入开源中文字体与许可文件`
4. `feat(build): 新增 build-glyphs 脚本生成 SVG`
5. `feat(data): 根据生成结果回填 scripts.available 与 glyphSrc`
6. `feat(ui): EvolutionAnimation 改 SVG 切换 + 时间轴`
7. `feat(page): 字详情页字源叙述与动画联动`
8. `docs: 更新 README 与 CLAUDE.md 标注新增 build:glyphs 步骤`

## 9. 风险与未决

- **字体许可**:Noto 系列稳定 OFL;甲骨/金文/小篆开源字体覆盖率与许可需逐一确认。若 OFL 之外的许可(如 GPL)需重新评估。
- **字体体积**:Noto Serif CJK SC 单文件 20MB+,4 款字体可能 80MB,入库会让仓库膨胀。本次按 § 6 说明先入库,后续可改 git-lfs 或 CI 下载。
- **字形对齐**:不同字体的 advance width、baseline、字面大小差异较大;`viewBox` 取 `0 0 1000 1000` + 字形 path 计算 bbox 后居中。
- **甲骨/金文异体**:同一字可能有多种甲骨字形,本次取字体提供的默认字形,不做异体选择。
- **字源文本准确性**:Claude 撰写、未经古文字学专业人士校订,作为骨架版本可接受,正式发布前建议人工复核。

## 10. 完成定义

- 浏览器访问 `http://localhost:3000/zi/日` 可看到字形从甲骨文到楷书循环切换的动画(若 5 阶段字体齐备),配套字源文本随阶段切换更新;`月 / 车 / 马` 同理
- 缺字阶段显示占位 + 「暂缺」标注,而非空白或报错
- 所有硬门槛检查通过
- 设计稿(本文件)+ 实施计划 + 全部 commits 入库
