import { describe, it, expect } from "vitest";
import { validateAll } from "../scripts/validate-data";

describe("validateAll", () => {
  it("passes for the shipped placeholder dataset", async () => {
    const result = await validateAll();
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("reports a missing related char as an error", async () => {
    const chars = [
      { char: "水", pinyin: ["shuǐ"], radical: "水", strokes: 4,
        meanings: ["x"], etymology: "x",
        scripts: { oracle:{available:true,font:"o"}, bronze:{available:true,font:"b"}, seal:{available:true,font:"s"}, clerical:{available:true,font:"c"}, regular:{available:true,font:null} },
        morph: { enabled:false, svgDir:null }, topics: [], related: ["不存在"] }
    ];
    const topics: any[] = [];
    const result = await validateAll({ chars, topics });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/related.*不存在/);
  });

  it("reports an unknown topic slug as an error", async () => {
    const chars = [
      { char: "水", pinyin: ["shuǐ"], radical: "水", strokes: 4,
        meanings: ["x"], etymology: "x",
        scripts: { oracle:{available:true,font:"o"}, bronze:{available:true,font:"b"}, seal:{available:true,font:"s"}, clerical:{available:true,font:"c"}, regular:{available:true,font:null} },
        morph: { enabled:false, svgDir:null }, topics: ["ghost"], related: [] }
    ];
    const result = await validateAll({ chars, topics: [] });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/topic.*ghost/);
  });
});
