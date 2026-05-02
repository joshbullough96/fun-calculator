import { describe, expect, it } from "vitest";
import { evaluateWordExpression } from "./wordEvaluator";

describe("evaluateWordExpression", () => {
  it("scores a single word", () => {
    expect(evaluateWordExpression("quiz")).toMatchObject({
      result: "22",
      detail: "quiz score"
    });
  });

  it("combines known compound words", () => {
    expect(evaluateWordExpression("fire + fly")).toMatchObject({
      result: "firefly",
      detail: "fire + fly"
    });
  });

  it("subtracts a word chunk when present", () => {
    expect(evaluateWordExpression("starfish - fish")).toMatchObject({
      result: "star"
    });
  });

  it("subtracts matching letters when the chunk is not present", () => {
    expect(evaluateWordExpression("planet - tea")).toMatchObject({
      result: "pln"
    });
  });

  it("repeats a word with multiplication", () => {
    expect(evaluateWordExpression("ha * 3")).toMatchObject({
      result: "hahaha"
    });
  });

  it("rejects empty input", () => {
    expect(() => evaluateWordExpression("   ")).toThrow(/Try a word/);
  });
});
