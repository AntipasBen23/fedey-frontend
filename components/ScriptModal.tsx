"use client";

import { useState } from "react";

type CalendarItem = {
  day: number;
  hook: string;
  content: string;
  media: string;
  contentType: string;
  script: string;
  slides: string[];
  hashtags: string[];
  visualPrompt: string;
  ctaText: string;
};

type Props = {
  item: CalendarItem;
  onClose: () => void;
};

export default function ScriptModal({ item, onClose }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const typeColors: Record<string, { color: string; bg: string }> = {
    thread:       { color: "#1d9bf0", bg: "#e8f5fe" },
    carousel:     { color: "#7b2ff7", bg: "#f3e8ff" },
    video_script: { color: "#d32f2f", bg: "#fdecea" },
  };
  const tc = typeColors[item.contentType] || { color: "#333", bg: "#f5f5f5" };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "720px",
        maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{
          padding: "1.5rem 2rem", borderBottom: "1px solid #eee",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: tc.bg,
        }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: tc.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Day {item.day} — {item.contentType.replace("_", " ").toUpperCase()}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", marginTop: "0.25rem", lineHeight: 1.3 }}>
              {item.hook}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888", padding: "0.25rem 0.5rem" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* ── VIDEO SCRIPT ── */}
          {item.contentType === "video_script" && item.script && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#d32f2f" }}>Scene-by-Scene Script</h3>
                <button onClick={() => copy(item.script, "script")} style={copyBtnStyle}>
                  {copied === "script" ? "Copied!" : "Copy Script"}
                </button>
              </div>
              <div style={{ background: "#1a1a1a", borderRadius: "14px", padding: "1.5rem", color: "#e8e8e8", fontFamily: "monospace", fontSize: "0.88rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {item.script}
              </div>
            </div>
          )}

          {/* ── THREAD ── */}
          {item.contentType === "thread" && item.script && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1d9bf0" }}>Full Thread</h3>
                <button onClick={() => copy(item.script, "script")} style={copyBtnStyle}>
                  {copied === "script" ? "Copied!" : "Copy All Tweets"}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {item.script.split(/\n(?=\d+\/)/).map((tweet, i) => (
                  <div key={i} style={{
                    background: "#f0f7ff", borderRadius: "12px", padding: "1rem 1.2rem",
                    borderLeft: "3px solid #1d9bf0", fontSize: "0.92rem", lineHeight: 1.6,
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem"
                  }}>
                    <span style={{ flex: 1 }}>{tweet.trim()}</span>
                    <button
                      onClick={() => copy(tweet.trim(), `tweet-${i}`)}
                      style={{ ...copyBtnStyle, flexShrink: 0, fontSize: "0.75rem" }}
                    >
                      {copied === `tweet-${i}` ? "✓" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CAROUSEL ── */}
          {item.contentType === "carousel" && item.slides && item.slides.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#7b2ff7" }}>
                  {item.slides.length} Carousel Slides
                </h3>
                <button onClick={() => copy(item.slides.join("\n\n---\n\n"), "slides")} style={copyBtnStyle}>
                  {copied === "slides" ? "Copied!" : "Copy All Copy"}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {item.slides.map((slide, i) => (
                  <div key={i} style={{
                    background: i === 0 ? "#f3e8ff" : i === item.slides.length - 1 ? "#fef9e7" : "#fafafa",
                    borderRadius: "14px", padding: "1.25rem",
                    borderLeft: `3px solid ${i === 0 ? "#7b2ff7" : i === item.slides.length - 1 ? "#f59e0b" : "#ccc"}`,
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem"
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#888", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                        {i === 0 ? "Slide 1 — Hook" : i === item.slides.length - 1 ? `Slide ${i + 1} — CTA` : `Slide ${i + 1}`}
                      </div>
                      <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{slide}</div>
                    </div>
                    <button
                      onClick={() => copy(slide, `slide-${i}`)}
                      style={{ ...copyBtnStyle, flexShrink: 0, fontSize: "0.75rem" }}
                    >
                      {copied === `slide-${i}` ? "✓" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Prompt */}
          {item.visualPrompt && (
            <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "1rem 1.2rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                AI Image Prompt (for cover / thumbnail)
              </div>
              <div style={{ fontSize: "0.88rem", color: "#444", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                {item.visualPrompt}
              </div>
              <button onClick={() => copy(item.visualPrompt, "visual")} style={copyBtnStyle}>
                {copied === "visual" ? "Copied!" : "Copy Prompt"}
              </button>
            </div>
          )}

          {/* Hashtags */}
          {item.hashtags && item.hashtags.length > 0 && (
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                Hashtags
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {item.hashtags.map((tag, i) => (
                  <span key={i} style={{
                    fontSize: "0.85rem", background: "#e8f0ff", color: "#1a56db",
                    borderRadius: "999px", padding: "0.3rem 0.8rem", fontWeight: 600
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {item.ctaText && (
            <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "1rem 1.2rem", borderLeft: "3px solid #22c55e" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>
                Call to Action
              </div>
              <div style={{ fontSize: "0.95rem", color: "#166534", fontWeight: 600 }}>{item.ctaText}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 2rem", borderTop: "1px solid #eee", textAlign: "right" }}>
          <button onClick={onClose} style={{
            padding: "0.75rem 2rem", borderRadius: "10px", background: "#111",
            color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.95rem"
          }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

const copyBtnStyle: React.CSSProperties = {
  padding: "0.35rem 0.9rem", borderRadius: "8px", background: "#f0f0f0",
  border: "1px solid #ddd", color: "#333", fontWeight: 700,
  fontSize: "0.82rem", cursor: "pointer",
};
