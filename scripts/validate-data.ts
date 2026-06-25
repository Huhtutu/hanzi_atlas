import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { Character, Poem, Topic } from "../lib/types";
import { z } from "zod";

const ROOT = join(process.cwd(), "data");

export interface ValidateInput {
  chars: unknown[];
  topics: unknown[];
  poems?: unknown[];
}

export interface ValidateResult {
  ok: boolean;
  errors: string[];
}

async function loadFromDisk(): Promise<ValidateInput> {
  const chars = JSON.parse(await readFile(join(ROOT, "characters.json"), "utf8"));
  const topicDir = join(ROOT, "topics");
  const files = (await readdir(topicDir)).filter(f => f.endsWith(".json"));
  const topics = await Promise.all(
    files.map(async f => JSON.parse(await readFile(join(topicDir, f), "utf8")))
  );
  let poems: unknown[] = [];
  try {
    poems = JSON.parse(await readFile(join(ROOT, "poems.json"), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return { chars, topics, poems };
}

export async function validateAll(input?: ValidateInput): Promise<ValidateResult> {
  const errors: string[] = [];
  const { chars: rawChars, topics: rawTopics, poems: rawPoems = [] } = input ?? (await loadFromDisk());

  const charsParsed = z.array(Character).safeParse(rawChars);
  const topicsParsed = z.array(Topic).safeParse(rawTopics);
  const poemsParsed = z.array(Poem).safeParse(rawPoems);

  if (!charsParsed.success) errors.push("characters.json schema: " + charsParsed.error.message);
  if (!topicsParsed.success) errors.push("topics schema: " + topicsParsed.error.message);
  if (!poemsParsed.success) errors.push("poems.json schema: " + poemsParsed.error.message);
  if (!charsParsed.success || !topicsParsed.success || !poemsParsed.success) return { ok: false, errors };

  const chars = charsParsed.data;
  const topics = topicsParsed.data;
  const charSet = new Set(chars.map(c => c.char));
  const topicSet = new Set(topics.map(t => t.slug));

  for (const c of chars) {
    for (const r of c.related) {
      if (!charSet.has(r)) errors.push(`char ${c.char}: related char "${r}" not in dataset`);
    }
    for (const t of c.topics) {
      if (!topicSet.has(t)) errors.push(`char ${c.char}: topic "${t}" not defined`);
    }
  }
  for (const t of topics) {
    for (const s of t.sections) {
      for (const ch of s.chars) {
        if (!charSet.has(ch)) errors.push(`topic ${t.slug}: section char "${ch}" not in dataset`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` ||
    import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  validateAll().then(r => {
    if (r.ok) { console.log("✓ data ok"); process.exit(0); }
    console.error("✗ data invalid:\n" + r.errors.map(e => "  - " + e).join("\n"));
    process.exit(1);
  });
}
