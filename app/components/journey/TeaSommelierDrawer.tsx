"use client";

import { useState } from "react";
import { MessageSquare, Sparkles, Thermometer, Droplets, Clock, X, Send, Bot, CheckCircle2 } from "lucide-react";

interface TeaSommelierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeChapter: number;
}

const SOMMELIER_KNOWLEDGE: Record<string, string> = {
  default:
    "Welcome to the Tea Intelligence terminal. I am calibrated on mountain harvest records, pyrolytic roasting curves, and traditional Chinese gongfu cha steeping science. How may I guide your palate?",
  harvest:
    "Dawn harvesting (5:30 AM – 7:15 AM) captures leaves at peak turgor pressure before the mountain sun triggers enzyme oxidation. At 1,400m elevation, nocturnal temperature swings concentrate sugars and L-theanine within the apical bud.",
  fire:
    "The cast-iron wok roasting ('Sha Qing' or kill-green) is held strictly between 220°C and 250°C. Rapid conduction halts polyphenol oxidase enzymes, capturing vivid chlorophyll and releasing caramel notes from amino acid thermal reactions.",
  water:
    "Optimal extraction requires soft mountain spring water (< 60 PPM TDS) heated to 82°C (180°F). Boiling water (100°C) burns delicate green catechins, resulting in harsh astringency rather than silky sweetness.",
  cup:
    "Porous ceramic chawans, shaped by wood kiln reduction firing, breathe micro-bubbles against the liquor. This softens the tannin perception on the mid-palate and preserves the radiant jade hue.",
};

const QUICK_PROMPTS = [
  { label: "Dawn Harvest Chemistry", query: "harvest" },
  { label: "Charcoal Wok Roasting", query: "fire" },
  { label: "Water & Temperature Matrix", query: "water" },
  { label: "Ceramic Chawan Science", query: "cup" },
];

export function TeaSommelierDrawer({
  isOpen,
  onClose,
  activeChapter,
}: TeaSommelierDrawerProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Greetings. I am your Tea Sommelier Intelligence, calibrated on alpine harvest botany and artisanal tea chemistry. Select an inquiry or explore the sensory matrix below.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [waterTemp, setWaterTemp] = useState(82);
  const [steepTime, setSteepTime] = useState(35);

  if (!isOpen) return null;

  const handleSend = (queryKey?: string) => {
    const text = queryKey || inputValue.trim();
    if (!text) return;

    const userMsg = queryKey
      ? QUICK_PROMPTS.find((p) => p.query === queryKey)?.label || text
      : text;

    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInputValue("");

    // Simulate Claude/Kimi intelligent response
    setTimeout(() => {
      let reply = SOMMELIER_KNOWLEDGE[queryKey || "default"];
      if (!reply) {
        const lower = text.toLowerCase();
        if (lower.includes("harvest") || lower.includes("mist") || lower.includes("leaf")) {
          reply = SOMMELIER_KNOWLEDGE.harvest;
        } else if (lower.includes("fire") || lower.includes("roast") || lower.includes("wok")) {
          reply = SOMMELIER_KNOWLEDGE.fire;
        } else if (lower.includes("water") || lower.includes("temp") || lower.includes("brew")) {
          reply = SOMMELIER_KNOWLEDGE.water;
        } else if (lower.includes("cup") || lower.includes("chawan") || lower.includes("taste")) {
          reply = SOMMELIER_KNOWLEDGE.cup;
        } else {
          reply = `The leaf currently in chapter ${activeChapter + 1} expresses distinct terroir notes of sweet orchid, pine resin, and mineral dew. To experience optimal harmony, steep with soft water at ${waterTemp}°C for ${steepTime} seconds.`;
        }
      }

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 380);
  };

  return (
    <aside className="tea-sommelier-drawer animate-slideLeft">
      {/* Drawer Header (Claude style minimalism) */}
      <header className="tea-sommelier-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
            <Bot size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.92rem", fontFamily: "Georgia, serif", color: "#f5efeb", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Leaf Intelligence</span>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }} />
            </h3>
            <p style={{ margin: 0, fontSize: "0.68rem", fontFamily: "monospace", color: "var(--ink-soft)" }}>Claude & Kimi Inspired Copilot</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "var(--ink-soft)", cursor: "pointer", padding: "6px" }}
          aria-label="Close Sommelier drawer"
        >
          <X size={18} />
        </button>
      </header>

      {/* Sensory & Extraction Telemetry (Astra style parameters) */}
      <div className="tea-sommelier-telemetry">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontFamily: "monospace", color: "var(--ink-soft)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399" }}>
            <Thermometer size={14} /> Extraction Temp
          </span>
          <span style={{ fontWeight: 600, color: "#f5efeb" }}>{waterTemp}°C (180°F)</span>
        </div>
        <input
          type="range"
          min="70"
          max="98"
          value={waterTemp}
          onChange={(e) => setWaterTemp(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#10b981", height: "4px", background: "#222", borderRadius: "4px", cursor: "pointer" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontFamily: "monospace", color: "var(--ink-soft)", paddingTop: "4px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fbbf24" }}>
            <Clock size={14} /> Gongfu Steep
          </span>
          <span style={{ fontWeight: 600, color: "#f5efeb" }}>{steepTime} Seconds</span>
        </div>
        <input
          type="range"
          min="15"
          max="90"
          value={steepTime}
          onChange={(e) => setSteepTime(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#f59e0b", height: "4px", background: "#222", borderRadius: "4px", cursor: "pointer" }}
        />
      </div>

      {/* Chat Transcript */}
      <div className="tea-sommelier-chat">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`tea-sommelier-msg ${m.sender === "user" ? "is-user" : "is-ai"}`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="tea-sommelier-chips">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.query}
            type="button"
            onClick={() => handleSend(p.query)}
            className="tea-chip-btn"
          >
            <Sparkles size={10} style={{ display: "inline", marginRight: "4px", color: "#34d399" }} />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="tea-sommelier-input-bar">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about terroir, enzymes, or roasting..."
          className="tea-sommelier-input"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          className="tea-sommelier-send"
          aria-label="Send query"
        >
          <Send size={14} />
        </button>
      </div>
    </aside>
  );
}
