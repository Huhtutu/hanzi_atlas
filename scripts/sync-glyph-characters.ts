import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Character, SCRIPT_ORDER, type ScriptKey } from "../lib/types";
import { z } from "zod";

const PNG_PREFIX_MAP: Array<[string, ScriptKey]> = [
  ["甲骨文", "oracle"],
  ["金文", "bronze"],
  ["小篆", "seal"],
  ["篆文", "seal"],
  ["戰國文字", "seal"],
  ["战国文字", "seal"],
  ["隸書", "clerical"],
  ["隶书", "clerical"],
  ["楷書", "regular"],
  ["楷书", "regular"],
];

export type GlyphCharacterFiles = { char: string; files: string[] };

function emptyScripts(): Character["scripts"] {
  return {
    oracle: { available: false, glyphSrc: null },
    bronze: { available: false, glyphSrc: null },
    seal: { available: false, glyphSrc: null },
    clerical: { available: false, glyphSrc: null },
    regular: { available: false, glyphSrc: null },
  };
}

function scriptKeyForFile(file: string): ScriptKey | null {
  for (const [prefix, key] of PNG_PREFIX_MAP) {
    if (file.startsWith(prefix + "_") || file.startsWith(prefix + ".")) return key;
  }
  return null;
}

export function scriptsFromFiles(ch: string, files: string[]): Character["scripts"] {
  const scripts = emptyScripts();
  const pngs = files.filter(f => f.toLowerCase().endsWith(".png")).sort();

  for (const file of pngs) {
    const key = scriptKeyForFile(file);
    if (!key || scripts[key].available) continue;
    scripts[key] = {
      available: true,
      glyphSrc: `/glyphs/${encodeURIComponent(ch)}/${encodeURIComponent(file)}`,
    };
  }

  return scripts;
}

export function createPlaceholderCharacter(ch: string, files: string[]): Character {
  return {
    char: ch,
    pinyin: ["待补"],
    radical: ch,
    strokes: 1,
    meanings: ["待补充释义"],
    etymology: {
      intro: `${ch}的字源信息待补充。`,
      stages: SCRIPT_ORDER.map(script => ({ script, text: `${ch}的该阶段字形说明待补充。` })),
      modern: `${ch}的现代用法待补充。`,
    },
    scripts: scriptsFromFiles(ch, files),
    morph: { enabled: false, svgDir: null },
    topics: [],
    related: [],
  };
}

export function mergeGlyphCharacters(existing: Character[], glyphs: GlyphCharacterFiles[]): Character[] {
  const seen = new Set(existing.map(c => c.char));
  const additions = glyphs
    .filter(g => g.char.length === 1 && !seen.has(g.char))
    .sort((a, b) => a.char.localeCompare(b.char, "zh-Hans"))
    .map(g => createPlaceholderCharacter(g.char, g.files));

  return [...existing, ...additions];
}

async function readGlyphCharacters(root: string): Promise<GlyphCharacterFiles[]> {
  const glyphRoot = join(root, "public", "glyphs");
  const entries = await readdir(glyphRoot, { withFileTypes: true });
  const dirs = entries.filter(entry => entry.isDirectory() && entry.name.length === 1);

  return Promise.all(
    dirs.map(async dir => ({
      char: dir.name,
      files: await readdir(join(glyphRoot, dir.name)),
    }))
  );
}

async function main() {
  const root = process.cwd();
  const charactersPath = join(root, "data", "characters.json");
  const raw = JSON.parse(await readFile(charactersPath, "utf8"));
  const existing = z.array(Character).parse(raw);
  const glyphs = await readGlyphCharacters(root);
  const merged = mergeGlyphCharacters(existing, glyphs);

  await writeFile(charactersPath, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`✓ characters.json: ${existing.length} → ${merged.length}`);
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
    import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
