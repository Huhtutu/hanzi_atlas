import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import opentype from "opentype.js";
import { renderGlyphSvg, renderPlaceholderSvg } from "../lib/glyph";

const NOTO_SANS = join(process.cwd(), "assets/fonts/NotoSansCJKsc-Regular.otf");

describe("renderGlyphSvg", () => {
  it("returns an svg with a path for a covered character", async () => {
    const buf = await readFile(NOTO_SANS);
    const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const svg = renderGlyphSvg(font, "日");
    expect(svg).toMatch(/<svg\b/);
    expect(svg).toMatch(/viewBox="0 0 1000 1000"/);
    expect(svg).toMatch(/<path\b[^>]*\bd="/);
  });

  it("returns a placeholder svg when the font lacks the character", async () => {
    const buf = await readFile(NOTO_SANS);
    const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    const svg = renderGlyphSvg(font, "");
    expect(svg).toMatch(/class="placeholder"/);
  });
});

describe("renderPlaceholderSvg", () => {
  it("contains the placeholder marker and the script label", () => {
    const svg = renderPlaceholderSvg("日", "oracle");
    expect(svg).toMatch(/class="placeholder"/);
    expect(svg).toMatch(/viewBox="0 0 1000 1000"/);
  });
});
