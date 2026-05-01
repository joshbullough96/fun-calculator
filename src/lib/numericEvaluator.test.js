import { describe, expect, it, vi } from "vitest";
import { evaluateNumericExpression, wrapExpression } from "./numericEvaluator";

describe("evaluateNumericExpression", () => {
  it("evaluates arithmetic with precedence and parentheses", () => {
    expect(evaluateNumericExpression("2*(3+4)")).toBe(14);
  });

  it("supports decimals, powers, percentages, and utility functions", () => {
    expect(evaluateNumericExpression("1.5 + 2.25")).toBe(3.75);
    expect(evaluateNumericExpression("3^2")).toBe(9);
    expect(evaluateNumericExpression("50%")).toBe(0.5);
    expect(evaluateNumericExpression("sqrt(144)")).toBe(12);
    expect(evaluateNumericExpression("split(42, 3)")).toBe(14);
  });

  it("rejects invalid or unsafe expressions", () => {
    expect(() => evaluateNumericExpression("2/0")).toThrow(/Division by zero/);
    expect(() => evaluateNumericExpression("alert(1)")).toThrow(/Unknown function/);
  });

  it("supports deterministic random tests", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.41);
    expect(evaluateNumericExpression("random()")).toBe(42);
    vi.restoreAllMocks();
  });
});

describe("wrapExpression", () => {
  it("wraps existing expressions for utility buttons", () => {
    expect(wrapExpression("9+7", "sqrt")).toBe("sqrt(9+7)");
    expect(wrapExpression("5", "square")).toBe("(5)^2");
    expect(wrapExpression("42", "split")).toBe("split(42, 2)");
  });
});
