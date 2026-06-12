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

## 设计文档

见 [`docs/specs/2026-06-11-hanzi-atlas-design.md`](docs/specs/2026-06-11-hanzi-atlas-design.md)。

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。
