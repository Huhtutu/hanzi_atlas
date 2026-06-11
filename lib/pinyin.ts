const TONE_MAP: Record<string, string> = {
  "ā":"a","á":"a","ǎ":"a","à":"a",
  "ē":"e","é":"e","ě":"e","è":"e",
  "ī":"i","í":"i","ǐ":"i","ì":"i",
  "ō":"o","ó":"o","ǒ":"o","ò":"o",
  "ū":"u","ú":"u","ǔ":"u","ù":"u",
  "ǖ":"ü","ǘ":"ü","ǚ":"ü","ǜ":"ü",
};

export function stripTone(syllable: string): string {
  let out = "";
  for (const ch of syllable) out += TONE_MAP[ch] ?? ch;
  return out;
}
