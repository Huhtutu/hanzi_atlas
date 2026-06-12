import { describe, it, expect } from "vitest";
import { buildDocs } from "../scripts/build-search-index";
import type { Character } from "../lib/types";

const sampleEtymology = {
  intro: "占位",
  stages: [
    { script: "oracle" as const, text: "占位" },
    { script: "bronze" as const, text: "占位" },
    { script: "seal" as const, text: "占位" },
    { script: "clerical" as const, text: "占位" },
    { script: "regular" as const, text: "占位" },
  ],
  modern: "占位",
};
const sampleScripts = {
  oracle:   { available: false, glyphSrc: null },
  bronze:   { available: false, glyphSrc: null },
  seal:     { available: false, glyphSrc: null },
  clerical: { available: false, glyphSrc: null },
  regular:  { available: true,  glyphSrc: null },
};

const fixture: Character[] = [
  {
    char: "水", pinyin: ["shuǐ"], radical: "水", strokes: 4,
    meanings: ["液体", "江河湖海"], etymology: sampleEtymology,
    scripts: sampleScripts,
    morph: { enabled: false, svgDir: null }, topics: [], related: [],
  },
];

describe("buildDocs", () => {
  it("emits both toned and untoned pinyin", () => {
    const docs = buildDocs(fixture);
    expect(docs[0].char).toBe("水");
    expect(docs[0].pinyinToned).toBe("shuǐ");
    expect(docs[0].pinyinPlain).toBe("shui");
  });
  it("joins all meanings into one searchable field", () => {
    const docs = buildDocs(fixture);
    expect(docs[0].meanings).toMatch(/液体/);
    expect(docs[0].meanings).toMatch(/江河湖海/);
  });
});
