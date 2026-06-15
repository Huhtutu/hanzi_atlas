import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { Character, SpringAutumnChapter, Topic } from "./types";
import { z } from "zod";

const DATA = join(process.cwd(), "data");

let _chars: Character[] | null = null;
let _topics: Topic[] | null = null;

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
