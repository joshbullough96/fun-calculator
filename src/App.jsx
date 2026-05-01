import { useEffect, useState } from "react";
import emojiRules from "./data/emojiRules.json";
import { evaluateEmojiExpression } from "./lib/emojiEvaluator";
import { evaluateNumericExpression, formatNumber, wrapExpression } from "./lib/numericEvaluator";

const numberKeys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", ".", "="];
const operatorKeys = [
  { label: "+", value: "+" },
  { label: "-", value: "-" },
  { label: "×", value: "*" },
  { label: "÷", value: "/" },
  { label: "( )", value: "()" },
  { label: "%", value: "%" }
];
const utilityButtons = [
  { label: "√", action: "sqrt", title: "Square root" },
  { label: "x²", action: "square", title: "Square" },
  { label: "round", action: "round", title: "Round" },
  { label: "split", action: "split", title: "Split by 2" },
  { label: "🎲 rand", action: "random", title: "Random number" },
  { label: "+/-", action: "sign", title: "Toggle sign" }
];
const emojiKeys = [
  "🥸",
  "🧑",
  "🐶",
  "🐱",
  "☕",
  "🍕",
  "🍰",
  "🎵",
  "💻",
  "📚",
  "💰",
  "🪽",
  "🌧️",
  "☂️",
  "🔥",
  "💧",
  "🌱",
  "☀️",
  "🌙",
  "⭐",
  "🧠",
  "💡"
];
const exampleEmojiCombos = ["🥸+🐶", "☕+💻", "🌧️+☂️", "🔥+💧"];
const modeMessages = {
  calculator: "numbers are back on stage",
  emoji: "emoji logic has entered the room"
};
const initialMessage = "ready when you are";
const themes = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "rainbow", label: "Rainbow" },
  { value: "chrome", label: "Chrome" }
];

function App() {
  const [mode, setMode] = useState("calculator");
  const [theme, setTheme] = useState("dark");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const displayPlaceholder = mode === "calculator" ? "2*(3+4)" : "🥸 + 🐶";
  const modeLabel = mode === "calculator" ? "Calculator" : "Emoji Math";

  function appendValue(value) {
    if (value === "=") {
      calculate();
      return;
    }

    if (value === "()") {
      setInput((current) => (current.trim() ? `(${current})` : "("));
      return;
    }

    setInput((current) => `${current}${value}`);
  }

  function clearAll() {
    setInput("");
    setResult("");
    setMessage("fresh slate, very dramatic");
  }

  function backspace() {
    setInput((current) => Array.from(current).slice(0, -1).join(""));
  }

  function calculate(expression = input) {
    try {
      if (mode === "calculator") {
        const value = evaluateNumericExpression(expression);
        const formatted = formatNumber(value);
        setResult(formatted);
        setMessage(getNumericMessage(value));
        addHistory({ mode, expression, result: formatted, message: getNumericMessage(value) });
      } else {
        const emojiResult = evaluateEmojiExpression(expression, emojiRules);
        setResult(emojiResult.result);
        setMessage(emojiResult.message);
        addHistory({ mode, expression, result: emojiResult.result, message: emojiResult.message });
      }

      setPulseKey((key) => key + 1);
    } catch (error) {
      setResult("?");
      setMessage(error.message || "the math tripped over its shoelaces");
      setPulseKey((key) => key + 1);
    }
  }

  function addHistory(entry) {
    setHistory((items) => [
      {
        id: crypto.randomUUID(),
        ...entry
      },
      ...items
    ].slice(0, 20));
  }

  function useUtility(action) {
    if (mode !== "calculator") {
      setMessage("utility buttons are off-duty in Emoji Math");
      return;
    }

    if (action === "random") {
      const randomExpression = "random()";
      setInput(randomExpression);
      calculate(randomExpression);
      return;
    }

    setInput((current) => wrapExpression(current, action));
  }

  async function copyResult() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setMessage("copied to clipboard");
    } catch {
      setMessage("clipboard said not today");
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setInput("");
    setResult("");
    setMessage(modeMessages[nextMode]);
  }

  useEffect(() => {
    function handleGlobalKeyDown(event) {
      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isEditableTarget) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copyResult();
        return;
      }

      if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        clearAll();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
      }

      if (mode !== "calculator") return;

      if (/^[0-9.]$/.test(event.key)) {
        event.preventDefault();
        appendValue(event.key);
        return;
      }

      if (["+", "-", "*", "/", "%", "(", ")"].includes(event.key)) {
        event.preventDefault();
        appendValue(event.key);
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  });

  return (
    <main className={`app theme-${theme}`}>
      <section className="calculator-shell" aria-label="Fun calculator">
        <header className="topbar">
          <div>
            <p className="eyebrow">Fun Calculator</p>
            <h1>{modeLabel}</h1>
          </div>
          <div className="top-actions">
            <label className="theme-picker" title="Choose theme">
              <select aria-label="Theme" value={theme} onChange={(event) => setTheme(event.target.value)}>
                {themes.map((themeOption) => (
                  <option key={themeOption.value} value={themeOption.value}>
                    {themeOption.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="icon-button" type="button" title="Toggle history" onClick={() => setHistoryOpen((open) => !open)}>
              🧾
            </button>
          </div>
        </header>

        <div className="mode-switch" role="tablist" aria-label="Calculator mode">
          <button className={mode === "calculator" ? "active" : ""} type="button" onClick={() => switchMode("calculator")}>
            123
          </button>
          <button className={mode === "emoji" ? "active" : ""} type="button" onClick={() => switchMode("emoji")}>
            🥸 + 🐶
          </button>
        </div>

        <section className="display">
          <input
            aria-label="Expression"
            value={input}
            placeholder={displayPlaceholder}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") calculate();
              if (event.key === "Escape") clearAll();
            }}
          />
          <div className="result-row">
            <output key={pulseKey} className="result-pop">
              {result || "0"}
            </output>
            <button type="button" className="copy-button" onClick={copyResult} title="Copy result">
              📋
            </button>
          </div>
          <p>{message}</p>
        </section>

        {mode === "calculator" ? (
          <>
            <div className="utility-grid">
              {utilityButtons.map((button) => (
                <button key={button.action} type="button" title={button.title} onClick={() => useUtility(button.action)}>
                  {button.label}
                </button>
              ))}
            </div>

            <div className="keypad">
              <div className="number-grid">
                {numberKeys.map((key) => (
                  <button key={key} type="button" className={key === "=" ? "equals" : ""} onClick={() => appendValue(key)}>
                    {key}
                  </button>
                ))}
              </div>
              <div className="operator-grid">
                {operatorKeys.map((key) => (
                  <button key={key.label} type="button" onClick={() => appendValue(key.value)}>
                    {key.label}
                  </button>
                ))}
                <button type="button" className="danger" onClick={clearAll}>C</button>
                <button type="button" onClick={backspace}>⌫</button>
              </div>
            </div>
          </>
        ) : (
          <section className="emoji-pad">
            <div className="emoji-examples">
              {exampleEmojiCombos.map((combo) => (
                <button key={combo} type="button" onClick={() => setInput(combo)}>
                  {combo}
                </button>
              ))}
            </div>
            <div className="emoji-grid">
              {emojiKeys.map((emoji) => (
                <button key={emoji} type="button" onClick={() => appendValue(emoji)}>
                  {emoji}
                </button>
              ))}
              <button type="button" onClick={() => appendValue("+")}>+ ✨</button>
              <button type="button" onClick={() => appendValue("-")}>- 🧊</button>
              <button type="button" className="equals" onClick={calculate}>=</button>
              <button type="button" className="danger" onClick={clearAll}>C 🧼</button>
              <button type="button" onClick={backspace}>⌫</button>
            </div>
          </section>
        )}

        <aside className={historyOpen ? "history open" : "history"} aria-label="Calculation history">
          <div className="history-header">
            <strong>History</strong>
            <button type="button" onClick={() => setHistory([])}>clear</button>
          </div>
          {history.length === 0 ? (
            <p className="empty-history">nothing suspicious yet</p>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                type="button"
                className="history-item"
                onClick={() => {
                  setMode(item.mode);
                  setInput(item.expression);
                  setResult(item.result);
                  setMessage(item.message);
                }}
              >
                <span>{item.mode === "calculator" ? "calc" : "emoji"}</span>
                <strong>{item.expression}</strong>
                <em>{item.result}</em>
              </button>
            ))
          )}
        </aside>
      </section>
    </main>
  );
}

function getNumericMessage(value) {
  if (value === 0) return "zero, but with confidence";
  if (Number.isInteger(value) && Math.abs(value) < 1000) return "clean result, no crumbs";
  if (Math.abs(value) > 1000000) return "that escalated quickly";
  if (Math.abs(value) < 1) return "tiny but trying";
  return "nailed it";
}

export default App;
