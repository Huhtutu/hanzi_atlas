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
});
