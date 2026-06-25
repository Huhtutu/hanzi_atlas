# 字形数据全量接入与古诗词赏析模块设计

## 背景

`public/glyphs` 已更新为新的爬取结果，目录名表示汉字，目录内 PNG 文件按 `甲骨文_1.png`、`金文_1.png`、`篆文_1.png`、`戰國文字_1.png`、`隸書_1.png`、`楷書_1.png` 等格式存放。当前 `data/characters.json` 只覆盖少量字，需要把已有字形目录全量加入项目，使每个已爬取字都能进入详情页并展示对应 PNG 字形。

同时新增一个独立的“古诗词赏析”模块，首版只收录少量古诗，作为后续扩展入口。

## 目标

1. 从 `public/glyphs` 目录生成或补齐 `data/characters.json` 中缺失的汉字条目。
2. 保留已有 `characters.json` 条目，不覆盖已存在的人工内容。
3. 新增条目先使用可构建通过的占位文本，保证页面、校验、搜索索引和静态构建正常运行。
4. 根据每个字目录内 PNG 文件前缀，设置该字各字体阶段的 `scripts.*.available` 与 `glyphSrc`。
5. 新增古诗词赏析数据与页面入口，首版收录几首经典古诗。
6. 保持最小改动，不删除用户已有的字形文件和注释。

## 非目标

- 不在本次补齐 1000+ 字的真实拼音、部首、笔画、释义和字源考据。
- 不引入数据库、CMS 或新依赖。
- 不改造现有单字详情页的视觉结构，除非为适配新增数据必须做小修。
- 不删除 `public/glyphs` 中已有文件，即使 Git 状态显示其为删除或新增。

## 数据设计

### 汉字数据

继续使用现有 `Character` schema。新增字条目采用以下策略：

- `char`：取 `public/glyphs/<字>` 的目录名，仅处理单个 Unicode 字符的目录。
- `pinyin`：占位为 `["待补"]`。
- `radical`：占位为该字本身。
- `strokes`：占位为 `1`，满足正整数约束。
- `meanings`：占位为 `["待补充释义"]`。
- `etymology.intro`：占位说明该字字源信息待补。
- `etymology.stages`：固定五个阶段，每阶段文本为待补说明。
- `etymology.modern`：占位为现代用法待补。
- `scripts`：按 PNG 前缀判断可用阶段：
  - `甲骨文` → `oracle`
  - `金文` → `bronze`
  - `小篆`、`篆文`、`戰國文字`、`战国文字` → `seal`
  - `隸書`、`隶书` → `clerical`
  - `楷書`、`楷书` → `regular`
- `glyphSrc`：若该阶段有 PNG，指向该阶段排序后的第一张 PNG；否则为 `null`。
- `morph.enabled`：`false`。
- `morph.svgDir`：`null`。
- `topics`：空数组。
- `related`：空数组。

现有详情页已经通过 `getCharacterGlyphs()` 读取 PNG 数组展示多版本字形，因此 `scripts.glyphSrc` 只作为 schema 兼容与旧组件备用字段。

### 古诗词数据

新增 `data/poems.json`，使用独立 schema，首版字段：

```ts
{
  slug: string;
  title: string;
  author: string;
  dynasty: string;
  lines: string[];
  intro: string;
  appreciation: string;
  tags: string[];
}
```

首版收录少量公版经典古诗，例如：

- 《静夜思》李白
- 《春晓》孟浩然
- 《登鹳雀楼》王之涣
- 《江雪》柳宗元

## 页面与组件设计

### 数据读取

在 `lib/types.ts` 增加 `Poem` schema 和类型。在 `lib/data.ts` 增加：

- `getAllPoems()`：读取并校验 `data/poems.json`。
- `getPoem(slug)`：按 slug 查找单首诗。

### 路由

新增两个路由：

- `app/poems/page.tsx`：古诗词赏析列表页。
- `app/poems/[slug]/page.tsx`：单首诗详情页，提供 `generateStaticParams()`。

列表页复用当前书卷式视觉风格：朱砂小标题、宋体大标题、纸色卡片。详情页按“诗文原文 → 诗意导读 → 赏析 → 标签”排布。

### 导航

在 `components/Header.tsx` 中增加“诗词”链接，指向 `/poems`。保留现有搜索框和专题链接。

## 脚本与验证

为避免手写 1000+ 条 JSON，新增或使用一次性脚本生成缺失字符条目。脚本行为应满足：

1. 读取现有 `data/characters.json`。
2. 扫描 `public/glyphs` 下单字目录。
3. 对缺失字生成占位条目。
4. 按字符排序或保持现有条目在前、新增条目追加，保证 diff 可读。
5. 写回 `data/characters.json`。

验证命令：

```bash
npm run validate-data
npm run typecheck
npm run build
```

如果全量静态生成耗时较长，应至少先运行 `validate-data` 和 `typecheck`，再运行 `build` 作为最终验证。

## 风险与处理

- **Git 状态显示大量 glyphs 删除/新增**：这些是用户更新爬取数据导致的工作区状态，不做清理、不还原、不删除。
- **Windows 路径与中文文件名**：脚本使用 Node `fs/promises` 与 UTF-8 JSON，避免 shell 对中文路径解码异常。
- **占位数据过多影响内容质量**：本次目标是先接入并让页面可访问；真实释义和字源后续可按批次替换。
- **搜索结果出现大量占位内容**：新增字可被搜索到，但释义为“待补充释义”。这是首版全量接入的预期结果。

## 成功标准

- `data/characters.json` 覆盖 `public/glyphs` 下所有单字目录。
- 已有字符数据不被覆盖。
- `/zi/<字>` 对新增字可静态生成并展示对应 PNG 字形。
- `/poems` 可访问并列出首批古诗。
- `/poems/<slug>` 可访问并展示原文与赏析。
- 数据校验、类型检查、构建通过。
