import type opentype from "opentype.js";
import type { ScriptKey } from "./types";

const VIEWBOX = "0 0 1000 1000";

export function renderGlyphSvg(font: opentype.Font, char: string): string {
  const glyphIndex = font.charToGlyphIndex(char);
  // .notdef is typically glyph index 0
  if (glyphIndex === 0) {
    return renderPlaceholderSvg(char, "regular");
  }
  const glyph = font.glyphs.get(glyphIndex);
  const unitsPerEm = font.unitsPerEm;
  const path = glyph.getPath(0, 0, unitsPerEm);
  const bbox = path.getBoundingBox();
  const glyphW = bbox.x2 - bbox.x1;
  const glyphH = bbox.y2 - bbox.y1;
  const margin = 100;
  const target = 1000 - margin * 2;
  const scale = Math.min(target / Math.max(glyphW, 1), target / Math.max(glyphH, 1));
  const cx = (bbox.x1 + bbox.x2) / 2;
  const cy = (bbox.y1 + bbox.y2) / 2;
  const tx = Math.round(500 - cx * scale);
  const ty = Math.round(500 - cy * scale);
  const scaledPath = glyph.getPath(tx, ty, unitsPerEm * scale);
  const d = scaledPath.toPathData(3);
  if (!d || d === "M0,0") {
    return renderPlaceholderSvg(char, "regular");
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="currentColor"><path d="${d}"/></svg>`;
}

export function renderPlaceholderSvg(char: string, _script: ScriptKey | string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" class="placeholder">
  <rect x="80" y="80" width="840" height="840" rx="40" fill="#EFEAE2" stroke="#C9C2B6" stroke-width="6"/>
  <text x="500" y="560" text-anchor="middle" font-size="320" fill="#9A8F7A" font-family="serif">?</text>
</svg>`;
}
