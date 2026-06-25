import { z } from "zod";

export const ScriptKey = z.enum(["oracle", "bronze", "seal", "clerical", "regular"]);
export type ScriptKey = z.infer<typeof ScriptKey>;

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

export const Poem = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  dynasty: z.string().min(1),
  lines: z.array(z.string().min(1)).min(1),
  intro: z.string().min(1),
  appreciation: z.string().min(1),
  tags: z.array(z.string()),
});
export type Poem = z.infer<typeof Poem>;

export const SpringAutumnChapter = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  intro: z.string(),
  chars: z.array(z.string().length(1)).min(1),
});
export type SpringAutumnChapter = z.infer<typeof SpringAutumnChapter>;

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
