# 诗词拾萃与成语典故模块设计

## 背景

当前站点已有“古诗词赏析”模块，导航显示为“诗词”，路由为 `/poems`。用户希望：

- 将诗词分类名称改为“诗词拾萃”。
- 优化诗词列表页排版，使其更适合诗词阅读。
- 诗词支持按内容配图，图片由用户提供。
- 新增“成语典故”分类，先收录几条成语故事。
- 首页导航去掉“水”“人”。

## 目标

1. Header 导航改为：`诗词拾萃 / 成语典故 / 关于`，保留搜索框。
2. `/poems` 路由继续保留，只修改展示名称与排版，不做 URL 迁移。
3. `Poem` 数据增加可选图片字段：`imageSrc` 与 `imageAlt`。
4. 诗词列表和详情页在有图片时展示用户提供的图片；没有图片时保持纯文字诗笺排版。
5. 新增成语典故数据、类型、读取函数和列表/详情页面。
6. 首版收录：画龙点睛、守株待兔、亡羊补牢、刻舟求剑。

## 非目标

- 不调用外部图片生成服务。
- 不自动生成图片文件。
- 不重命名 `/poems` 路由。
- 不改动现有专题页 `/topic/water`、`/topic/human`，只从导航移除入口。

## 数据设计

### Poem 扩展

在现有 `Poem` schema 上新增两个可选字段：

```ts
imageSrc: z.string().optional();
imageAlt: z.string().optional();
```

示例：

```json
{
  "slug": "jing-ye-si",
  "title": "静夜思",
  "imageSrc": "/poems/jing-ye-si.jpg",
  "imageAlt": "月夜窗前的清冷光影"
}
```

如果用户尚未提供图片，`data/poems.json` 可暂不填写图片字段，页面不展示图片区域。

### Idiom 新增

新增 `Idiom` schema：

```ts
{
  slug: string;
  title: string;
  source: string;
  story: string;
  meaning: string;
  usage: string;
  tags: string[];
}
```

新增 `data/idioms.json`，首版收录：

- 画龙点睛
- 守株待兔
- 亡羊补牢
- 刻舟求剑

## 页面设计

### Header

`components/Header.tsx` 中删除“水”“人”导航链接，保留搜索框，导航改为：

- `/poems`：诗词拾萃
- `/idioms`：成语典故
- `/about`：关于

### 诗词拾萃列表页 `/poems`

- 标题改为“诗词拾萃”。
- 卡片改为诗笺式布局：朝代作者、小标题、诗句居中排布、导读摘要在下。
- 如果 `imageSrc` 存在，在卡片上方显示图片，使用 `object-cover` 与柔和边框。
- 没有图片时不显示空图框，避免占位突兀。

### 诗词详情页 `/poems/[slug]`

- 返回链接改为“返回诗词拾萃”。
- 顶部小标题改为“诗 词 拾 萃”。
- 如果 `imageSrc` 存在，在诗文前展示图片。
- 诗句排版保持居中、行距放大。

### 成语典故列表页 `/idioms`

- 页面标题“成语典故”。
- 卡片展示成语、出处、寓意摘要、标签。
- 点击进入详情页。

### 成语详情页 `/idioms/[slug]`

- 顶部显示成语和出处。
- 正文分为“典故故事”“寓意”“今用”。
- 标签在底部展示。

## 验证

```bash
npm run validate-data
npm run typecheck
npm run test
npm run build
```

浏览器验证：

- 首页导航只显示“诗词拾萃 / 成语典故 / 关于”。
- `/poems` 标题为“诗词拾萃”，诗词排版更像诗笺。
- `/poems/jing-ye-si` 返回链接和小标题已改名。
- `/idioms` 能看到四个成语卡片。
- `/idioms/hua-long-dian-jing` 能看到故事、寓意和今用。

## 成功标准

- 导航文案符合要求且不再显示“水”“人”。
- 诗词模块支持用户提供图片，但无图片时页面正常。
- 成语典故模块有独立数据与静态页面。
- 数据校验、类型检查、测试和构建通过。
