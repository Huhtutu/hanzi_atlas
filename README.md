# Hanzi Atlas 汉字图志

一个让用户能搜任意常用汉字并查看字形演化(甲骨文 → 金文 → 小篆 → 隶书 → 楷书)的开源汉字图志。

## 现状

当前版本:字形演变功能已实现。13 个汉字(含日/月/车/马真实字源数据与 SVG 字形),2 个专题(water/human)。楷书与隶书阶段的 SVG 字形由 Noto Sans CJK SC 构建期自动生成;甲骨文/金文/小篆阶段为占位状态,待接入开源字体。

## 开发

```bash
npm install
npm run dev           # http://localhost:3000
npm run validate-data
npm run test
npm run build:glyphs  # 从 assets/fonts/ 生成字形 SVG
npm run build         # glyphs → search-index → next build
```

### 字形构建

```bash
npm run build:glyphs
```

`scripts/build-glyphs.ts` 会读 `assets/fonts/` 下的开源中文字体,为 `data/characters.json` 中的每个字 × 每个字体阶段生成 `public/glyphs/<字>/<阶段>.svg`,缺字阶段输出占位 SVG。该步骤已串入 `npm run build`。

## 设计文档

见 [`docs/specs/2026-06-11-hanzi-atlas-design.md`](docs/specs/2026-06-11-hanzi-atlas-design.md)。

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。
