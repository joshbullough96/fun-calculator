const LETTER_SCORES = {
  a: 1,
  b: 3,
  c: 3,
  d: 2,
  e: 1,
  f: 4,
  g: 2,
  h: 4,
  i: 1,
  j: 8,
  k: 5,
  l: 1,
  m: 3,
  n: 1,
  o: 1,
  p: 3,
  q: 10,
  r: 1,
  s: 1,
  t: 1,
  u: 1,
  v: 4,
  w: 4,
  x: 8,
  y: 4,
  z: 10
};

const COMPOUNDS = new Map([
  ["book+mark", "bookmark"],
  ["butter+fly", "butterfly"],
  ["cup+cake", "cupcake"],
  ["fire+fly", "firefly"],
  ["moon+light", "moonlight"],
  ["rain+bow", "rainbow"],
  ["snow+man", "snowman"],
  ["star+fish", "starfish"],
  ["sun+flower", "sunflower"],
  ["tea+cup", "teacup"]
]);

export function evaluateWordExpression(expression) {
  const parsed = parseWordExpression(expression);

  if (!parsed) {
    const word = cleanWord(expression);

    if (!word) {
      throw new Error("Try a word, or a combo like fire + fly.");
    }

    return describeWord(word);
  }

  const result = calculateWords(parsed);
  return {
    result: result.text,
    message: `${result.message} score: ${scoreWord(result.text)}`,
    detail: result.detail
  };
}

function parseWordExpression(expression) {
  const cleaned = expression.trim().toLowerCase();
  const match = cleaned.match(/^([a-z]+)\s*([+\-*x])\s*([a-z]+|\d+)$/i);

  if (!match) return null;

  return {
    left: cleanWord(match[1]),
    operator: normalizeOperator(match[2]),
    right: match[3].toLowerCase()
  };
}

function calculateWords({ left, operator, right }) {
  if (!left) throw new Error("Left side needs letters.");

  if (operator === "+") {
    const rightWord = cleanWord(right);
    if (!rightWord) throw new Error("Right side needs letters.");

    const exact = findCompound(left, rightWord);
    const text = exact || `${left}${rightWord}`;

    return {
      text,
      message: exact ? "compound unlocked," : "word mashup complete,",
      detail: `${left} + ${rightWord}`
    };
  }

  if (operator === "-") {
    const rightWord = cleanWord(right);
    if (!rightWord) throw new Error("Right side needs letters.");

    const text = subtractWord(left, rightWord);
    return {
      text: text || "(empty)",
      message: text ? "letters removed," : "you subtracted the whole word,",
      detail: `${left} - ${rightWord}`
    };
  }

  if (operator === "*") {
    const count = Number(right);

    if (!Number.isInteger(count) || count < 1 || count > 8) {
      throw new Error("Word repeats want a number from 1 to 8.");
    }

    return {
      text: left.repeat(count),
      message: "echo chamber achieved,",
      detail: `${left} * ${count}`
    };
  }

  throw new Error(`Word Math does not know "${operator}" yet.`);
}

function describeWord(word) {
  const score = scoreWord(word);
  const vowels = Array.from(word).filter((letter) => "aeiou".includes(letter)).length;
  const palindrome = word.length > 1 && word === Array.from(word).reverse().join("");

  return {
    result: String(score),
    message: palindrome ? "palindrome bonus energy" : `${vowels} vowel${vowels === 1 ? "" : "s"} in the mix`,
    detail: `${word} score`
  };
}

function findCompound(left, right) {
  return COMPOUNDS.get(`${left}+${right}`) || COMPOUNDS.get(`${right}+${left}`);
}

function subtractWord(left, right) {
  if (left.includes(right)) return left.replace(right, "");

  const letters = Array.from(left);
  for (const letter of right) {
    const index = letters.indexOf(letter);
    if (index !== -1) letters.splice(index, 1);
  }

  return letters.join("");
}

function scoreWord(word) {
  return Array.from(cleanWord(word)).reduce((total, letter) => total + (LETTER_SCORES[letter] || 0), 0);
}

function cleanWord(value) {
  return String(value).toLowerCase().replace(/[^a-z]/g, "");
}

function normalizeOperator(operator) {
  return operator === "x" ? "*" : operator;
}
