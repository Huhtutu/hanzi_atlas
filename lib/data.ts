import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { Character, Idiom, Poem, SCRIPT_LABELS, ScriptKey, SpringAutumnChapter, Topic } from "./types";
import { z } from "zod";

const DATA = join(process.cwd(), "data");
const GLYPHS_DIR = join(process.cwd(), "public", "glyphs");

export type GlyphImage = { src: string; alt: string };
export type ScriptGlyphs = Record<ScriptKey, GlyphImage[]>;

const _glyphCache: Map<string, ScriptGlyphs> = new Map();

// PNG 文件名前缀 → 五大字体类别(支持简/繁/异名,顺序敏感:更具体的写前面)
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

export async function getCharacterGlyphs(ch: string): Promise<ScriptGlyphs> {
  const cached = _glyphCache.get(ch);
  if (cached) return cached;

  const empty: ScriptGlyphs = { oracle: [], bronze: [], seal: [], clerical: [], regular: [] };
  let files: string[] = [];
  try {
    files = await readdir(join(GLYPHS_DIR, ch));
  } catch {
    _glyphCache.set(ch, empty);
    return empty;
  }

  const pngs = files.filter(f => f.toLowerCase().endsWith(".png")).sort();
  const result: ScriptGlyphs = { oracle: [], bronze: [], seal: [], clerical: [], regular: [] };

  for (const f of pngs) {
    for (const [prefix, k] of PNG_PREFIX_MAP) {
      if (f.startsWith(prefix + "_") || f.startsWith(prefix + ".")) {
        result[k].push({
          src: `/glyphs/${encodeURIComponent(ch)}/${encodeURIComponent(f)}`,
          alt: `${ch} ${SCRIPT_LABELS[k]}`,
        });
        break;
      }
    }
  }

  _glyphCache.set(ch, result);
  return result;
}

let _chars: Character[] | null = null;
let _topics: Topic[] | null = null;
let _poems: Poem[] | null = null;
let _idioms: Idiom[] | null = null;

export async function getAllCharacters(): Promise<Character[]> {
  if (_chars) return _chars;
  const raw = JSON.parse(await readFile(join(DATA, "characters.json"), "utf8"));
  _chars = z.array(Character).parse(raw);
  return _chars;
}

export async function getCharacter(ch: string): Promise<Character | null> {
  const all = await getAllCharacters();
  return all.find(c => c.char === ch) ?? null;
}

export async function getAllTopics(): Promise<Topic[]> {
  if (_topics) return _topics;
  const dir = join(DATA, "topics");
  const files = (await readdir(dir)).filter(f => f.endsWith(".json"));
  const parsed = await Promise.all(
    files.map(async f => Topic.parse(JSON.parse(await readFile(join(dir, f), "utf8"))))
  );
  _topics = parsed;
  return _topics;
}

export async function getTopic(slug: string): Promise<Topic | null> {
  const all = await getAllTopics();
  return all.find(t => t.slug === slug) ?? null;
}

export async function getAllPoems(): Promise<Poem[]> {
  if (_poems) return _poems;
  const raw = JSON.parse(await readFile(join(DATA, "poems.json"), "utf8"));
  _poems = z.array(Poem).parse(raw);
  return _poems;
}

export async function getPoem(slug: string): Promise<Poem | null> {
  const all = await getAllPoems();
  return all.find(p => p.slug === slug) ?? null;
}

export async function getAllIdioms(): Promise<Idiom[]> {
  if (_idioms) return _idioms;
  const raw = JSON.parse(await readFile(join(DATA, "idioms.json"), "utf8"));
  _idioms = z.array(Idiom).parse(raw);
  return _idioms;
}

export async function getIdiom(slug: string): Promise<Idiom | null> {
  const all = await getAllIdioms();
  return all.find(i => i.slug === slug) ?? null;
}

let _chapters: SpringAutumnChapter[] | null = null;
let _stories: Record<string, string> | null = null;

export async function getCharacterStories(): Promise<Record<string, string>> {
  if (_stories) return _stories;
  _stories = JSON.parse(await readFile(join(DATA, "spring-autumn-stories.json"), "utf8"));
  return _stories!;
}

export async function getSpringAutumnChapters(): Promise<SpringAutumnChapter[]> {
  if (_chapters) return _chapters;
  const raw = JSON.parse(await readFile(join(DATA, "spring-autumn.json"), "utf8"));
  _chapters = z.array(SpringAutumnChapter).parse(raw);
  return _chapters;
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
