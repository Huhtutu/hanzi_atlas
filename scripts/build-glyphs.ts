import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import opentype from "opentype.js";
import { Character, ScriptKey, SCRIPT_ORDER } from "../lib/types";
import { renderGlyphSvg, renderPlaceholderSvg } from "../lib/glyph";
import { z } from "zod";

const FONT_MAP: Record<ScriptKey, string | null> = {
  oracle:   null,
  bronze:   null,
  seal:     null,
  clerical: "assets/fonts/NotoSansCJKsc-Regular.otf",
  regular:  "assets/fonts/NotoSansCJKsc-Regular.otf",
};

async function loadFont(relPath: string | null): Promise<opentype.Font | null> {
  if (!relPath) return null;
  const abs = join(process.cwd(), relPath);
  if (!existsSync(abs)) return null;
  const buf = await readFile(abs);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/** 检查已有的 SVG 是否为占位(即是否可以安全覆写) */
async function isPlaceholderOrMissing(filePath: string): Promise<boolean> {
  if (!existsSync(filePath)) return true;
  const content = await readFile(filePath, "utf8");
  return content.includes('class="placeholder"');
}

export interface BuildResult {
  written: number;
  placeholders: number;
  preserved: number;
}

export async function buildGlyphs(): Promise<BuildResult> {
  const rawChars = JSON.parse(await readFile(join(process.cwd(), "data/characters.json"), "utf8"));
  const chars = z.array(Character).parse(rawChars);

  const fonts: Partial<Record<ScriptKey, opentype.Font | null>> = {};
  for (const s of SCRIPT_ORDER) fonts[s] = await loadFont(FONT_MAP[s]);

  let written = 0;
  let placeholders = 0;
  let preserved = 0;
  for (const c of chars) {
    const outDir = join(process.cwd(), "public/glyphs", c.char);
    await mkdir(outDir, { recursive: true });
    for (const s of SCRIPT_ORDER) {
      const targetFile = join(outDir, `${s}.svg`);
      const font = fonts[s];
      let svg: string;

      if (!font) {
        // 如果已有非占位 SVG(手工制作的),保留不动
        if (!(await isPlaceholderOrMissing(targetFile))) {
          preserved++;
          continue;
        }
        svg = renderPlaceholderSvg(c.char, s);
        placeholders++;
        console.warn(`[build-glyphs] no font for ${c.char}/${s}, using placeholder`);
      } else {
        const candidate = renderGlyphSvg(font, c.char);
        if (candidate.includes('class="placeholder"')) {
          // 字体缺字,如果已有手工 SVG 则保留
          if (!(await isPlaceholderOrMissing(targetFile))) {
            preserved++;
            continue;
          }
          placeholders++;
          console.warn(`[build-glyphs] font lacks ${c.char}/${s}, using placeholder`);
        } else {
          written++;
        }
        svg = candidate;
      }
      await writeFile(targetFile, svg, "utf8");
    }
  }
  return { written, placeholders, preserved };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
    import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  buildGlyphs().then(r => {
    console.log(`✓ glyphs: ${r.written} real, ${r.placeholders} placeholder, ${r.preserved} preserved`);
  }).catch(e => { console.error(e); process.exit(1); });
}
