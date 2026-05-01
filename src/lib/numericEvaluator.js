const FUNCTIONS = new Set(["sqrt", "round", "random", "split"]);

export function evaluateNumericExpression(expression) {
  const parser = new NumericParser(expression);
  const value = parser.parse();

  if (!Number.isFinite(value)) {
    throw new Error("The result wandered outside normal number land.");
  }

  return normalizeNumber(value);
}

export function formatNumber(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return Number.parseFloat(value.toFixed(10)).toString();
}

export function wrapExpression(expression, wrapper) {
  const trimmed = expression.trim();
  const target = trimmed || "0";

  if (wrapper === "sqrt") return `sqrt(${target})`;
  if (wrapper === "square") return `(${target})^2`;
  if (wrapper === "round") return `round(${target})`;
  if (wrapper === "split") return `split(${target}, 2)`;
  if (wrapper === "percent") return `(${target})%`;
  if (wrapper === "sign") return trimmed.startsWith("-") ? trimmed.slice(1) : `-(${target})`;

  return expression;
}

function normalizeNumber(value) {
  return Number.parseFloat(value.toFixed(12));
}

class NumericParser {
  constructor(input) {
    this.input = input.replace(/\s+/g, "");
    this.index = 0;
  }

  parse() {
    if (!this.input) {
      throw new Error("Nothing to calculate yet.");
    }

    const value = this.parseExpression();

    if (!this.isAtEnd()) {
      throw new Error(`Unexpected token "${this.peek()}".`);
    }

    return value;
  }

  parseExpression() {
    let value = this.parseTerm();

    while (this.match("+") || this.match("-")) {
      const operator = this.previous();
      const right = this.parseTerm();
      value = operator === "+" ? value + right : value - right;
    }

    return value;
  }

  parseTerm() {
    let value = this.parsePower();

    while (this.match("*") || this.match("×") || this.match("/") || this.match("÷")) {
      const operator = this.previous();
      const right = this.parsePower();

      if ((operator === "/" || operator === "÷") && right === 0) {
        throw new Error("Division by zero is a bold choice.");
      }

      value = operator === "*" || operator === "×" ? value * right : value / right;
    }

    return value;
  }

  parsePower() {
    let value = this.parseUnary();

    if (this.match("^")) {
      const exponent = this.parsePower();
      value = Math.pow(value, exponent);
    }

    return value;
  }

  parseUnary() {
    if (this.match("+")) return this.parseUnary();
    if (this.match("-")) return -this.parseUnary();

    return this.parsePostfix();
  }

  parsePostfix() {
    let value = this.parsePrimary();

    while (this.match("%")) {
      value /= 100;
    }

    return value;
  }

  parsePrimary() {
    if (this.match("(")) {
      const value = this.parseExpression();
      this.consume(")", "Missing closing parenthesis.");
      return value;
    }

    if (this.isDigit(this.peek()) || this.peek() === ".") {
      return this.parseNumber();
    }

    if (this.isAlpha(this.peek())) {
      return this.parseFunction();
    }

    throw new Error(`Unexpected token "${this.peek() || "end"}".`);
  }

  parseNumber() {
    const start = this.index;

    while (this.isDigit(this.peek())) this.advance();

    if (this.peek() === ".") {
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    const raw = this.input.slice(start, this.index);
    const value = Number(raw);

    if (!Number.isFinite(value)) {
      throw new Error(`"${raw}" is not a number.`);
    }

    return value;
  }

  parseFunction() {
    const start = this.index;
    while (this.isAlpha(this.peek())) this.advance();
    const name = this.input.slice(start, this.index);

    if (!FUNCTIONS.has(name)) {
      throw new Error(`Unknown function "${name}".`);
    }

    this.consume("(", `Missing "(" after ${name}.`);

    if (name === "random") {
      this.consume(")", "random() does not take arguments.");
      return Math.floor(Math.random() * 100) + 1;
    }

    const first = this.parseExpression();

    if (name === "split") {
      this.consume(",", "split needs a value and a number of parts.");
      const parts = this.parseExpression();
      this.consume(")", "Missing closing parenthesis.");

      if (parts === 0) {
        throw new Error("Can't split into zero parts.");
      }

      return first / parts;
    }

    this.consume(")", "Missing closing parenthesis.");

    if (name === "sqrt") {
      if (first < 0) throw new Error("Square root wants a non-negative number.");
      return Math.sqrt(first);
    }

    if (name === "round") {
      return Math.round(first);
    }

    throw new Error(`Unknown function "${name}".`);
  }

  consume(expected, message) {
    if (this.match(expected)) return;
    throw new Error(message);
  }

  match(token) {
    if (this.input[this.index] !== token) return false;
    this.index += 1;
    return true;
  }

  previous() {
    return this.input[this.index - 1];
  }

  peek() {
    return this.input[this.index] || "";
  }

  advance() {
    this.index += 1;
  }

  isAtEnd() {
    return this.index >= this.input.length;
  }

  isDigit(char) {
    return char >= "0" && char <= "9";
  }

  isAlpha(char) {
    return /^[a-z]$/i.test(char);
  }
}
