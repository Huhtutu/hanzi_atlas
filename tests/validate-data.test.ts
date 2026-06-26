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

  it("passes for valid poems input", async () => {
    const poems = [
      {
        slug: "quiet-night-thoughts",
        title: "静夜思",
        author: "李白",
        dynasty: "唐",
        lines: ["床前明月光", "疑是地上霜"],
        intro: "一首思乡诗。",
        appreciation: "语言清新自然。",
        tags: ["唐诗", "思乡"],
      },
    ];

    const result = await validateAll({ chars: [], topics: [], poems });

    expect(result.ok).toBe(true);
  });

  it("reports poem schema errors", async () => {
    const poems = [
      {
        slug: "quiet-night-thoughts",
        title: "静夜思",
        author: "李白",
        dynasty: "唐",
        lines: [],
        intro: "一首思乡诗。",
        tags: ["唐诗", "思乡"],
      },
    ];

    const result = await validateAll({ chars: [], topics: [], poems });

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/poems\.json schema/);
  });

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
});
