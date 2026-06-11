# Hanzi Atlas(汉字图志)设计文档

- **日期**:2026-06-11
- **状态**:Draft → 待用户审阅
- **类型**:全新开源项目

---

## 1. 项目定位

**名字(暂定)**:Hanzi Atlas(汉字图志)

**一句话**:一个让用户能搜任意常用汉字并查看字形演化(甲骨文 → 金文 → 小篆 → 隶书 → 楷书)的开源汉字图志,首页以策划专题作为入口。

**目标用户**:对汉字文化感兴趣的中文使用者、海外华人、学中文的外国人、设计师/文创工作者。

**项目定性**:科普探索(A)+ 互动展览(D)的轻量混合。既能查任意字(工具感),又有"故事化"专题(内容感)。

**项目调性**:博物馆 + 工具。视觉精致(米白底 + 墨色 + 朱砂点缀),交互克制,不堆信息。

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────┐
│            浏览器(纯静态站点)                  │
│                                                  │
│  Next.js App Router(SSG 全部预渲染)             │
│   ├─ /                  首页                     │
│   ├─ /zi/[char]         字详情页(300 个静态页) │
│   ├─ /topic/[slug]      专题页(2 个)            │
│   ├─ /search            搜索页                   │
│   └─ /about             关于                     │
│                                                  │
│  客户端能力:                                    │
│   • MiniSearch          本地全文索引             │
│   • Framer Motion       字形切换动画             │
│   • SVG path animation  精品专题形变动画         │
└─────────────────────────────────────────────────┘
                       ▲
                       │ build time 读取
┌──────────────────────┴──────────────────────────┐
│                Git 仓库(数据即代码)            │
│                                                  │
│  data/                                           │
│   ├─ characters.json    300 字元数据             │
│   ├─ topics/                                     │
│   │    ├─ water.json    "水的故事"专题           │
│   │    └─ human.json    "人的姿态"专题           │
│   └─ search-index.json  构建时生成               │
│                                                  │
│  public/                                         │
│   ├─ fonts/             甲骨文/金文/小篆 字体    │
│   └─ svg/[char]/        手工 SVG(精品 ~20 字)  │
└─────────────────────────────────────────────────┘
                       ▲
                       │ deploy
                  Vercel / Cloudflare Pages
                  (免费档,全球 CDN)
```

**关键技术决策**:

- **技术栈**:Next.js (App Router) + TypeScript + Tailwind CSS
- **0 后端**:数据全部存在 git 仓库,贡献内容 = 提 PR
- **构建时静态化**:`next build` 把所有页面预渲染成 HTML
- **客户端搜索**:`search-index.json` 在构建时生成,浏览器加载后用 MiniSearch 本地搜索
- **字形数据**:以开源字体渲染为主(切换式动画),少量手工 SVG 做精品形变动画(morphing)放在专题里
- **部署**:Vercel 或 Cloudflare Pages 免费档

---

## 3. 数据模型

### `data/characters.json`

每个字一条记录:

```json
{
  "char": "水",
  "pinyin": ["shuǐ"],
  "radical": "水",
  "strokes": 4,
  "meanings": [
    "无色无味的液体,化学式 H₂O",
    "江河湖海的总称"
  ],
  "etymology": "甲骨文像水流的形状,中间一道主流,两侧点为水花。本义是流动的水,后引申为所有液体的总称。",
  "scripts": {
    "oracle":   { "available": true,  "font": "oracle" },
    "bronze":   { "available": true,  "font": "bronze" },
    "seal":     { "available": true,  "font": "seal" },
    "clerical": { "available": true,  "font": "clerical" },
    "regular":  { "available": true,  "font": null }
  },
  "morph": {
    "enabled": true,
    "svgDir": "/svg/水"
  },
  "topics": ["water"],
  "related": ["川", "河", "江", "雨"]
}
```

**字段说明**:

- `scripts`:5 种字体的可用性。`available: false` 时前端显示"暂无此字古文写法"占位。
- `morph.enabled`:是否有精品手工 SVG;若 true,`svgDir` 下应存在 `oracle.svg`、`bronze.svg`、`seal.svg`、`clerical.svg`、`regular.svg`。
- `topics`:该字所属专题 slug 列表。
- `related`:相关字推荐(手工策划,不自动计算)。

### `data/topics/<slug>.json`

```json
{
  "slug": "water",
  "title": "水的故事",
  "subtitle": "汉字里的流动与浩瀚",
  "cover": "/covers/water.jpg",
  "intro": "上古先民临水而居……(2-3 段引言)",
  "sections": [
    {
      "heading": "源头",
      "narrative": "一滴水如何成形……",
      "chars": ["水", "泉"]
    },
    {
      "heading": "奔流",
      "narrative": "水汇成川……",
      "chars": ["川", "河", "江"]
    }
  ]
}
```

专题不是单纯列字,而是"分节叙事 + 在叙事中嵌入字卡"。

### `data/search-index.json`

构建时由 `scripts/build-search-index.ts` 生成,前端 MiniSearch 直接加载使用,不在运行时再次构建。

---

## 4. 页面与 UI 设计

**视觉规范**:

- 背景:`#FAF7F2`(米白)
- 正文:`#1A1A1A`(墨色)
- 强调:`#A23B2D`(朱砂)
- 字体:正文用思源宋体(衬线),UI 元素用思源黑体

### 4.1 首页 `/`

- 巨大标题"汉字图志",带甲骨文 → 楷书的循环切换动画
- 副标题 + "随机看一个字"按钮
- 精选专题卡片区(2 张)
- 随机字卡 8 个(刷新可换)
- 顶部固定搜索框 + 关于链接

### 4.2 字详情页 `/zi/[char]` —— 最重要的页面

布局元素:

- 顶部大字展示(可点切换字体)
- 拼音 / 部首 / 笔画数
- 字体切换标签:`[甲骨文][金文][小篆][隶书][楷书]` + 当前指示点
- "▶ 播放演化动画"按钮:点击后自动从甲骨文依次切换到楷书(约 5 秒)
- 字源段落(`etymology`)
- 释义列表(`meanings`)
- 相关字推荐(`related`)
- 收录于专题(若 `topics` 非空)

**字体不可用时**:对应标签置灰,tooltip 提示"暂无此字古文写法,欢迎贡献"。

### 4.3 专题页 `/topic/[slug]`

- 大封面图 + 文字蒙层(标题 + 副标题)
- 引言段落
- 分节展示:每节有 `heading` + `narrative` + 多张字卡
- 字卡:含 morphing 动画预览,滚动进视口时自动播放一次(IntersectionObserver),hover 重播,点击进入字详情页

### 4.4 搜索页 `/search?q=...`

- 输入框置顶
- 实时搜索(MiniSearch 客户端)
- 结果列表:字 + 拼音 + 释义首行
- 支持搜:汉字本身、拼音(带/不带声调)、释义关键词、部首

### 4.5 关于页 `/about`

- 项目缘起
- 字体来源致谢
- 专题作者署名
- 如何贡献(链到 `CONTRIBUTING.md`)

### 4.6 响应式

- 桌面(≥ 1024px):字详情页左右布局,右侧侧栏放相关字
- 移动(< 1024px):单列堆叠;字体切换标签变成水平滚动条

---

## 5. 错误处理与边缘情况

| 场景 | 处理 |
| --- | --- |
| 用户访问未收录的字(如 `/zi/龘`) | 返回 404 页:"该字暂未收录,欢迎在 GitHub 提交贡献" + 搜索链接 |
| 某字的某种古文写法不可用 | 字体切换标签置灰,tooltip 提示;"播放演化动画"按钮跳过该字体 |
| 古文字体文件加载失败 | `font-display: swap`,先用衬线兜底;失败时显示楷体并在标签上加 ⚠ 图标 |
| 搜索无结果 | 显示"未找到「xxx」"+ 推荐随机 5 个字 |
| 精品 SVG 加载失败 | 降级到字体切换动画,不报错 |
| 用户偏好 `prefers-reduced-motion: reduce` | 演化动画直接显示终态(楷书);SVG morphing 改为静态依次显示 |
| 汉字 URL 编码 | 用 `encodeURIComponent`;在 `generateStaticParams` 返回原始字符;部署后验证 CDN 不破坏 UTF-8 |
| 所有页面语言标记 | `<html lang="zh-Hans">` |

---

## 6. 测试策略

定位:内容驱动的静态站,重点测"数据正确性 + 关键交互不挂",不追求覆盖率。

**单元测试(Vitest)**:

- 数据校验脚本:`characters.json` 字段完整;`related` 指向的字真实存在;`topics` 引用的专题真实存在
- 搜索索引构建函数:输入 mock 数据 → 输出索引结构正确
- 拼音匹配工具:支持带/不带声调匹配

**集成测试(Playwright,3-5 条关键路径)**:

- 首页 → 点专题卡 → 专题页 → 点字卡 → 字详情页
- 搜索 "shui" → 命中"水" → 进字详情页
- 字详情页:点字体切换标签 → 大字内容变化
- 字详情页:点"播放演化动画" → 5 个标签依次激活

**CI 数据校验 Gate**:

- PR 改动 `data/*.json` 时,GitHub Action 跑 schema 校验,失败拦截合并
- 这是开源项目最关键的护栏

**不做**:

- 视觉回归测试(MVP 阶段过度)
- E2E 跑全部 300 字(抽样即可)
- 性能压测(静态站不需要)

---

## 7. 项目结构

```
hanzi-atlas/
├── app/                       # Next.js App Router
│   ├── page.tsx               # 首页
│   ├── zi/[char]/page.tsx     # 字详情
│   ├── topic/[slug]/page.tsx  # 专题
│   ├── search/page.tsx
│   ├── about/page.tsx
│   └── layout.tsx
├── components/
│   ├── ScriptSwitcher.tsx     # 字体切换组件
│   ├── EvolutionAnimation.tsx # 演化播放
│   ├── CharCard.tsx
│   ├── TopicSection.tsx
│   └── SearchBox.tsx
├── lib/
│   ├── data.ts                # 读 JSON 的工具
│   ├── search.ts              # 搜索索引构建
│   └── pinyin.ts
├── data/
│   ├── characters.json
│   └── topics/
├── scripts/
│   ├── validate-data.ts       # 数据校验(CI 用)
│   └── build-search-index.ts
├── public/
│   ├── fonts/
│   └── svg/
├── tests/
└── CONTRIBUTING.md
```

**贡献流程(写入 `CONTRIBUTING.md`)**:

- 加新字:在 `characters.json` 加条目 → 可选放 SVG → 提 PR
- 加新专题:复制 `topics/_template.json` → 修改 → 提 PR
- 字源故事改进:直接改 JSON 提 PR

---

## 8. MVP 范围(v0.1)

**包含**:

1. 首页(标题动画 + 2 个精选专题入口 + 随机字 + 搜索)
2. 字详情页:300 个常用字
3. 2 个精品专题:"水的故事" 和 "人的姿态",合计约 20 个字带手工 SVG morphing
4. 搜索页:支持汉字 / 拼音 / 部首 / 释义关键词
5. 关于页
6. CI 数据校验
7. `CONTRIBUTING.md`

**明确不做(留给 v0.2+)**:

- 用户系统、收藏、笔记
- 字形对比工具(并排看两个字)
- 测验 / 学习模式
- 除 20 个精品字外的形变动画
- 移动端 App
- 多语言界面
- 评论系统
- SVG 资源下载

---

## 9. 开放问题(进入实现前需要确认)

下列项不阻塞架构,但实现前需要确认或调研:

1. **甲骨文 / 金文字体的具体选择和许可证**:需要在实现前的第一步进行字体选型与许可证审查(SIL OFL 优先)
2. **300 个常用字的具体名单**:基于现代汉语常用字表 + 字源故事可写出来的优先
3. **专题的具体字源故事文案**:由谁撰写,是否邀请贡献者
4. **域名 + 部署平台**:Vercel vs Cloudflare Pages
5. **`pinyin` 字段是否需要包含多音字的所有读音和对应释义**:MVP 暂存为字符串数组,不区分释义对应

---

## 10. 成功标准

v0.1 发布后:

- 任意收录的 300 字都能搜到、看到 5 种字形演化、读到字源故事
- 2 个专题完整可读,叙事 + 字卡形变动画在所有主流浏览器正常播放
- 数据校验 CI 跑通,外部贡献者可通过 PR 加新字
- Lighthouse 性能 / 可访问性 / SEO 评分 ≥ 90
