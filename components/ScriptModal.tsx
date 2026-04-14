"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";

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

type SlideImage = { index: number; url: string; prompt: string; permanent: boolean };
type VideoTask = { taskId: string; status: string; videoUrl?: string; message?: string };

type Props = {
  item: CalendarItem;
  onClose: () => void;
};

export default function ScriptModal({ item, onClose }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  // Carousel image generation state
  const [slideImages, setSlideImages] = useState<SlideImage[]>([]);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Video generation state
  const [videoTask, setVideoTask] = useState<VideoTask | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [pollingVideo, setPollingVideo] = useState(false);

  const generateCarouselImages = async () => {
    setGeneratingImages(true);
    setImageError(null);
    try {
      // Build one prompt per slide using visualPrompt as cover, slides as context
      const prompts = item.slides.map((slide, i) =>
        i === 0
          ? (item.visualPrompt || `Cover slide for: ${slide}`)
          : `Slide ${i + 1}: ${slide.slice(0, 120)}`
      );
      const res = await fetch(`${API_URL}/v1/carousel/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visualPrompts: prompts }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      setSlideImages(data.images || []);
    } catch (e: any) {
      setImageError(e.message);
    } finally {
      setGeneratingImages(false);
    }
  };

  const generateVideo = async () => {
    setGeneratingVideo(true);
    setVideoError(null);
    setVideoTask(null);
    try {
      // Use first scene line as prompt text
      const firstLine = item.script.split("\n")[0] || item.hook;
      const res = await fetch(`${API_URL}/v1/video/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: firstLine,
          duration: 5,
          ratio: "768:1280",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      setVideoTask(data);
      // Start polling
      pollVideoStatus(data.taskId);
    } catch (e: any) {
      setVideoError(e.message);
    } finally {
      setGeneratingVideo(false);
    }
  };

  const pollVideoStatus = (taskId: string) => {
    setPollingVideo(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/v1/video/status/${taskId}`);
        const data: VideoTask = await res.json();
        setVideoTask(data);
        if (data.status === "SUCCEEDED" || data.status === "FAILED") {
          clearInterval(interval);
          setPollingVideo(false);
        }
      } catch {
        clearInterval(interval);
        setPollingVideo(false);
      }
    }, 5000);
  };

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

          {/* ── CAROUSEL IMAGE GENERATION ── */}
          {item.contentType === "carousel" && item.slides && item.slides.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#7b2ff7" }}>Slide Images</h3>
                <button
                  onClick={generateCarouselImages}
                  disabled={generatingImages}
                  style={{
                    ...copyBtnStyle,
                    background: generatingImages ? "#f0e8ff" : "#7b2ff7",
                    color: generatingImages ? "#7b2ff7" : "#fff",
                    border: "none", padding: "0.5rem 1.2rem",
                  }}
                >
                  {generatingImages ? "Generating..." : slideImages.length > 0 ? "Regenerate Images" : "Generate with DALL-E 3"}
                </button>
              </div>
              {imageError && (
                <div style={{ fontSize: "0.85rem", color: "#d32f2f", marginBottom: "0.5rem" }}>{imageError}</div>
              )}
              {slideImages.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem" }}>
                  {slideImages.map((img) => (
                    <a key={img.index} href={img.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <img
                        src={img.url}
                        alt={`Slide ${img.index}`}
                        style={{ width: "100%", borderRadius: "10px", display: "block", aspectRatio: "1/1", objectFit: "cover" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "#888" }}>Slide {img.index}</span>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: img.permanent ? "#15803d" : "#b45309", background: img.permanent ? "#f0fdf4" : "#fef9e7", borderRadius: "4px", padding: "0.1rem 0.35rem" }}>
                          {img.permanent ? "Saved" : "Temp"}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              {generatingImages && (
                <div style={{ fontSize: "0.85rem", color: "#7b2ff7", textAlign: "center", padding: "1rem" }}>
                  Generating {item.slides.length} slide images in parallel...
                </div>
              )}
            </div>
          )}

          {/* ── VIDEO GENERATION ── */}
          {item.contentType === "video_script" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#d32f2f" }}>Video Generation</h3>
                <button
                  onClick={generateVideo}
                  disabled={generatingVideo || pollingVideo}
                  style={{
                    ...copyBtnStyle,
                    background: generatingVideo || pollingVideo ? "#fdecea" : "#d32f2f",
                    color: generatingVideo || pollingVideo ? "#d32f2f" : "#fff",
                    border: "none", padding: "0.5rem 1.2rem",
                  }}
                >
                  {generatingVideo ? "Starting..." : pollingVideo ? "Processing..." : videoTask?.videoUrl ? "Regenerate Video" : "Generate with Runway ML"}
                </button>
              </div>
              {videoError && (
                <div style={{ fontSize: "0.85rem", color: "#d32f2f", marginBottom: "0.5rem" }}>
                  {videoError.includes("not configured") ? "Set RUNWAY_API_KEY on the backend to enable video generation." : videoError}
                </div>
              )}
              {videoTask && (
                <div style={{ background: "#fdecea", borderRadius: "12px", padding: "1rem 1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#d32f2f" }}>
                      Status: {videoTask.status}
                      {pollingVideo && " — checking every 5s..."}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#999" }}>Task: {videoTask.taskId?.slice(0, 12)}...</span>
                  </div>
                  {videoTask.message && (
                    <div style={{ fontSize: "0.85rem", color: "#555" }}>{videoTask.message}</div>
                  )}
                  {videoTask.videoUrl && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <video
                        src={videoTask.videoUrl}
                        controls
                        style={{ width: "100%", borderRadius: "10px", maxHeight: "320px" }}
                      />
                      <a
                        href={videoTask.videoUrl}
                        download
                        style={{ display: "block", marginTop: "0.5rem", fontSize: "0.85rem", color: "#d32f2f", fontWeight: 700 }}
                      >
                        Download Video
                      </a>
                    </div>
                  )}
                </div>
              )}
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
