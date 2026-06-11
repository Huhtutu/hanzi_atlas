import { describe, it, expect } from "vitest";
import { stripTone } from "../lib/pinyin";

describe("stripTone", () => {
  it("removes diacritics", () => {
    expect(stripTone("shuǐ")).toBe("shui");
    expect(stripTone("hé")).toBe("he");
    expect(stripTone("dà")).toBe("da");
    expect(stripTone("cóng")).toBe("cong");
  });
  it("leaves plain ASCII alone", () => {
    expect(stripTone("shui")).toBe("shui");
  });
  it("handles ü-with-tone", () => {
    expect(stripTone("lǜ")).toBe("lü");
  });
});
