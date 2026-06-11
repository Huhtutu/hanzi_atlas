import { describe, it, expect } from "vitest";
import { buildDocs } from "../scripts/build-search-index";
import type { Character } from "../lib/types";

const fixture: Character[] = [
  {
    char: "水", pinyin: ["shuǐ"], radical: "水", strokes: 4,
    meanings: ["液体", "江河湖海"], etymology: "x",
    scripts: { oracle:{available:true,font:"o"}, bronze:{available:true,font:"b"}, seal:{available:true,font:"s"}, clerical:{available:true,font:"c"}, regular:{available:true,font:null} },
    morph: { enabled:false, svgDir:null }, topics: [], related: [],
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
