# CLAUDE.md — 汉字图志 (Hanzi Atlas) 项目说明

本文件供 Claude Code 在本仓库中工作时阅读。所有问答、解释、提交信息均使用**中文**。

## 沟通约定

- 与用户的所有对话、解释、报告、计划，一律使用中文。
- 所有 `git commit` 信息使用中文,沿用 Conventional Commits 前缀(如 `feat(ui): ...`、`fix(data): ...`、`docs: ...`、`chore: ...`、`test: ...`)。
- 子代理(subagent)的提示词可使用英文以保证可靠性,但子代理写入仓库的提交信息和代码注释仍须中文。
- 代码内尽量不写无意义注释;若必须写,使用中文,只解释"为什么",不解释"是什么"。
- **最小改动原则**：任何代码修改请始终遵守“最小改动原则”，除非我主动要求优化或者重构。
- **严禁擅自删除**：永远不要删除不是你写的代码（即便代码已被注释），也**永远不要删除原有的任何注释**。
- **复用与参考**：写代码前先思考哪些业务可以参考或复用。尽可能参考现有业务的实现风格；如果不明确，请让我为你提供参考，坚决避免重复造轮子。

## 项目定位

汉字图志是一个面向中文读者的静态网站,以书籍式排版讲述汉字字形演变(甲骨文 → 金文 → 小篆 → 隶书 → 楷书)与主题串讲。当前为**骨架版本**,数据是 10 个占位汉字 + 2 个占位专题,所有页面、组件、构建管线已就绪,等待后续填充真实字源数据与字形 SVG。

设计稿与实现计划:
- `docs/specs/2026-06-11-hanzi-atlas-design.md` — 视觉与信息架构设计
- `docs/superpowers/plans/2026-06-11-hanzi-atlas-skeleton.md` — 骨架实现计划(已完成)

## 技术栈

- **Next.js 15** (App Router) + **React 19**,默认服务端组件,客户端组件显式 `"use client"`
- **TypeScript** strict 模式,路径别名 `@/*` → 仓库根
- **Tailwind CSS v4**(`@tailwindcss/postcss`,无 `tailwind.config`,主题在 `app/globals.css` 用 `@theme` 块定义)
- **Zod** 校验 JSON 数据
- **MiniSearch** 提供客户端检索
- **Framer Motion** 提供动画
- **Vitest** 跑单元测试
- **tsx** 跑构建脚本

## 目录结构

```
app/                  Next.js 路由
  layout.tsx          根布局(Header + Footer)
  page.tsx            首页
  zi/[char]/page.tsx  单字详情页(动态路由,params 为 Promise)
  topic/[slug]/page.tsx  专题页
  search/page.tsx     检索页(客户端,已用 <Suspense> 包裹)
  about/page.tsx      关于页
  not-found.tsx       共享 404
components/           可复用组件,客户端组件文件首行须有 "use client";
data/
  characters.json     10 个占位字符
  topics/*.json       专题数据
  search-index.json   构建产物,被 .gitignore 忽略
lib/
  types.ts            Zod schema + TS 类型 + 字体常量
  data.ts             服务端数据读取
  pinyin.ts           拼音去声调
  search.ts           MiniSearch 加载/查询
scripts/
  validate-data.ts    用 Zod 校验所有数据
  build-search-index.ts  生成 data/ 和 public/ 下的检索索引
tests/                Vitest 测试
docs/                 设计稿 + 实施计划(只读参考,改动前先讨论)
public/search-index.json  构建产物,被 .gitignore 忽略
```

## 常用命令

```bash
npm run dev              # 启动开发服务器(默认 :3000)
npm run build            # 先构建检索索引,再 next build
npm run start            # 生产模式预览
npm run typecheck        # tsc --noEmit
npm run test             # vitest run(当前 8 个测试)
npm run validate-data    # Zod 校验 data/
npm run build:search-index  # 单独重建 MiniSearch 索引
npm run build:glyphs        # 单独重建字形 SVG
```

## 开发约定

### 数据层

- 所有数据读取走 `lib/data.ts`,**仅在服务端**调用(页面组件或 `generateStaticParams`)。
- 改动 `data/characters.json` 或 `data/topics/*.json` 后,必须运行 `npm run validate-data` 并通过。
- 字符的 `related` 字段中所列汉字必须存在于 `characters.json`,否则校验会失败。
- 新增字符或专题,先在 `lib/types.ts` 的 Zod schema 中确认字段约束,再写数据。
- 改动 `data/characters.json` 后,字形产物需要重建:`npm run build:glyphs`。`public/glyphs/` 是构建产物,被 `.gitignore` 忽略。
- 新接入字体须放到 `assets/fonts/` 并在 `assets/fonts/LICENSES/` 写入对应许可文本;在 `scripts/build-glyphs.ts` 的 `FONT_MAP` 中登记。

### 路由

- 当前是 Next.js 15,**动态路由的 `params` 是 `Promise`**,页面组件必须 `async function Page({ params }: { params: Promise<{...}> })` 并 `await` 解构。
- `app/search/page.tsx` 使用 `useSearchParams()`,**必须**保留外层 `<Suspense>` 包裹,否则 `next build` 会失败。

### 组件

- 默认服务端组件。只有使用 hooks、浏览器 API、事件处理的组件才加 `"use client";`。
- 当前客户端组件:`SearchBox`、`ScriptSwitcher`、`EvolutionAnimation`、`CharCardMorph`、`HomeTitle`。
- 视觉风格遵循 `docs/specs/...` 设计稿(纸色 `--color-paper` `#FAF7F2`、墨色 `--color-ink` `#1A1A1A`、朱砂 `--color-vermilion` `#A23B2D`、衬线优先思源宋体)。

### 检索索引

- `npm run build:search-index` 同时写 `data/search-index.json`(供测试)与 `public/search-index.json`(供浏览器 fetch)。
- 两份产物都被 `.gitignore` 忽略,**不要**提交。
- 改动 `characters.json` 后,索引需重建;`npm run build` 已包含此步骤。

### 测试

- TDD 优先:新功能先写测试,看到红再实现,看到绿再提交。
- 新增数据相关功能时,优先在 `tests/validate-data.test.ts` 扩展样例,而不是手工调试。
- 提交前请保证 `npm run test`、`npm run typecheck`、`npm run validate-data` 三者全绿。

### Windows / 跨平台

- 仓库可能在 Windows + Git Bash 下开发,脚本中的 IIFE 入口判断已经兼容 `file://` 与 `file:///` 两种形式,改动 `scripts/` 时请保持。
- Git 可能出现 `LF will be replaced by CRLF` 警告,可忽略。

## 提交规范

- 一次提交只做一件事,粒度参考 `git log` 历史。
- 中文 commit 信息,带英文 type/scope 前缀,例如:
  - `feat(page): 新增字源时间轴交互`
  - `fix(data): 修正"河"的相关字引用`
  - `test(search): 补充拼音多音字检索用例`
  - `docs: 更新 README 的运行说明`
- **不要**在 `main` 上直接做大改动前不沟通;先讨论方案,必要时写计划(参考 `docs/superpowers/plans/` 的格式)。
- **不要**使用 `--no-verify` 跳过 hook;`--amend`、`reset --hard`、`push --force` 等破坏性操作必须先征得用户确认。

## 已知约束与坑

- 占位字符共 10 个(水川河雨人大立从山日),专题 2 个(water、human),`related` 字段不要引用集合外的字。
- `next-env.d.ts` 由 Next 自动维护,已被 `.gitignore` 忽略。
- 部分 npm 依赖在 Node 22 下会有 `EBADENGINE` 警告,可忽略。
- 字形动画与 SVG 字形目前是占位(`morph.enabled: false`),真实数据接入时需同步扩展 `EvolutionAnimation` 与 `CharCardMorph`。

## 何时停下来问用户

- 改动 `docs/specs/` 或 `docs/superpowers/plans/` 之前。
- 引入新依赖、改 `tsconfig`、改 Tailwind 主题之前。
- 任何"看起来已有的工作可以丢弃"的操作之前(分支、未提交改动、未识别的文件)。
- 接入真实字形 SVG / 字源数据等大块新工作之前,先讨论数据来源、版权、目录结构。
