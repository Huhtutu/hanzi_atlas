import { describe, expect, it } from "vitest";
import type { Character } from "../lib/types";
import { createPlaceholderCharacter, mergeGlyphCharacters, scriptsFromFiles } from "../scripts/sync-glyph-characters";

const existing: Character = {
  char: "水",
  pinyin: ["shuǐ"],
  radical: "水",
  strokes: 4,
  meanings: ["无色无味的液体"],
  etymology: {
    intro: "已有字源说明",
    stages: [
      { script: "oracle", text: "已有甲骨说明" },
      { script: "bronze", text: "已有金文说明" },
      { script: "seal", text: "已有小篆说明" },
      { script: "clerical", text: "已有隶书说明" },
      { script: "regular", text: "已有楷书说明" },
    ],
    modern: "已有现代说明",
  },
  scripts: {
    oracle: { available: false, glyphSrc: null },
    bronze: { available: false, glyphSrc: null },
    seal: { available: false, glyphSrc: null },
    clerical: { available: true, glyphSrc: "/glyphs/水/隸書_1.png" },
    regular: { available: true, glyphSrc: "/glyphs/水/楷書_1.png" },
  },
  morph: { enabled: false, svgDir: null },
  topics: ["water"],
  related: ["河"],
};

describe("sync-glyph-characters", () => {
  it("detects script availability from PNG prefixes", () => {
    const scripts = scriptsFromFiles("安", ["甲骨文_1.png", "金文_1.png", "戰國文字_1.png", "篆文_1.png", "隸書_1.png", "楷書_1.png"]);

    expect(scripts.oracle).toEqual({ available: true, glyphSrc: "/glyphs/%E5%AE%89/%E7%94%B2%E9%AA%A8%E6%96%87_1.png" });
    expect(scripts.bronze.available).toBe(true);
    expect(scripts.seal.available).toBe(true);
    expect(scripts.clerical.available).toBe(true);
    expect(scripts.regular.available).toBe(true);
  });

  it("creates a schema-valid placeholder character", () => {
    const c = createPlaceholderCharacter("安", ["篆文_1.png", "楷書_1.png"]);

    expect(c.char).toBe("安");
    expect(c.pinyin).toEqual(["待补"]);
    expect(c.radical).toBe("安");
    expect(c.strokes).toBe(1);
    expect(c.etymology.stages.map(s => s.script)).toEqual(["oracle", "bronze", "seal", "clerical", "regular"]);
    expect(c.scripts.seal.available).toBe(true);
    expect(c.scripts.regular.available).toBe(true);
    expect(c.related).toEqual([]);
  });

  it("preserves existing characters and appends missing glyph characters", () => {
    const merged = mergeGlyphCharacters([existing], [
      { char: "水", files: ["楷書_1.png"] },
      { char: "安", files: ["篆文_1.png", "楷書_1.png"] },
    ]);

    expect(merged).toHaveLength(2);
    expect(merged[0]).toBe(existing);
    expect(merged[1].char).toBe("安");
  });
});
