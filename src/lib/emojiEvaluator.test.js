import { describe, expect, it, vi } from "vitest";
import emojiRules from "../data/emojiRules.json";
import { evaluateEmojiExpression } from "./emojiEvaluator";

describe("evaluateEmojiExpression", () => {
  it("matches exact handcrafted emoji rules", () => {
    expect(evaluateEmojiExpression("🥸 + 🐶", emojiRules)).toMatchObject({
      result: "😀",
      detail: "person + dog"
    });
  });

  it("treats plus rules as commutative", () => {
    expect(evaluateEmojiExpression("🐶 + 🥸", emojiRules).result).toBe("😀");
  });

  it("falls back to category rules", () => {
    expect(evaluateEmojiExpression("🧑 + 🐹", emojiRules)).toMatchObject({
      result: "😀"
    });
  });

  it("returns a playful fallback for unknown combinations", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(evaluateEmojiExpression("🐶 + 💧", emojiRules)).toMatchObject({
      result: "🤔"
    });
    vi.restoreAllMocks();
  });

  it("rejects non-emoji-expression input", () => {
    expect(() => evaluateEmojiExpression("🥸", emojiRules)).toThrow(/Try an emoji expression/);
  });
});
