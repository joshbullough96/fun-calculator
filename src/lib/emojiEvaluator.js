export function evaluateEmojiExpression(expression, data) {
  const parsed = parseEmojiExpression(expression);

  if (!parsed) {
    throw new Error("Try an emoji expression like 🥸 + 🐶.");
  }

  const left = data.concepts[parsed.left];
  const right = data.concepts[parsed.right];

  if (!left || !right) {
    return fallback(data, "One of those emoji is still living off the grid.");
  }

  const exact = findRule(data.exactRules, parsed.operator, left.name, right.name, "left", "right");
  if (exact) return resultFromRule(exact, left, right);

  const category = findRule(
    data.categoryRules,
    parsed.operator,
    left.category,
    right.category,
    "leftCategory",
    "rightCategory"
  );
  if (category) return resultFromRule(category, left, right);

  return fallback(data);
}

function parseEmojiExpression(expression) {
  const cleaned = expression.replace(/\s+/g, "");
  const match = cleaned.match(/^(.+?)([+\-*/×÷])(.+)$/u);

  if (!match) return null;

  return {
    left: match[1],
    operator: normalizeOperator(match[2]),
    right: match[3]
  };
}

function normalizeOperator(operator) {
  if (operator === "×") return "*";
  if (operator === "÷") return "/";
  return operator;
}

function findRule(rules, operator, left, right, leftKey, rightKey) {
  return rules.find((rule) => {
    if (rule.operator !== operator) return false;

    const direct = rule[leftKey] === left && rule[rightKey] === right;
    const reversed = operator === "+" && rule[leftKey] === right && rule[rightKey] === left;

    return direct || reversed;
  });
}

function resultFromRule(rule, left, right) {
  return {
    result: rule.result,
    message: rule.message,
    detail: `${left.name} ${rule.operator} ${right.name}`
  };
}

function fallback(data, message) {
  const options = data.fallbacks;
  const choice = options[Math.floor(Math.random() * options.length)];

  return {
    result: choice.result,
    message: message || choice.message,
    detail: "unknown emoji combo"
  };
}
