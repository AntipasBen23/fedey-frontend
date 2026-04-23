"use client";

import { useState } from "react";
import { X, Zap, Clock, Send, Sparkles, Check } from "lucide-react";

interface CustomPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  connectedPlatforms: string[];
}

export default function CustomPostModal({ isOpen, onClose, onSuccess, connectedPlatforms }: CustomPostModalProps) {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(connectedPlatforms);
  const [timingMode, setTimingMode] = useState<"now" | "smart" | "specific">("smart");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Polish State
  const [isPolishing, setIsPolishing] = useState(false);
  const [showTonePicker, setShowTonePicker] = useState(false);

  if (!isOpen) return null;

  const handlePolish = async (style: string) => {
    setIsPolishing(true);
    setShowTonePicker(false);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      const res = await fetch(`${apiUrl}/v1/posts/polish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, style })
      });
      const data = await res.json();
      if (res.ok) setContent(data.polishedContent);
      else throw new Error(data.error);
    } catch (e: any) {
      alert("AI Polish failed: " + e.message);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      const res = await fetch(`${apiUrl}/v1/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          timingMode,
          scheduledAt: timingMode === "specific" ? scheduledAt : undefined
        })
      });

      if (!res.ok) throw new Error("Failed to queue post");
      
      onSuccess();
      onClose();
      setContent("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const charLimit = selectedPlatforms.includes("twitter") ? 280 : 3000;
  const isOverLimit = content.length > charLimit;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Draft Custom Post 🚀</h2>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Platform Toggle */}
          <div className="section">
            <label>PUBLISH TO</label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {["twitter", "linkedin"].map(p => {
                const isConnected = connectedPlatforms.includes(p);
                const isSelected = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    disabled={!isConnected}
                    onClick={() => setSelectedPlatforms(prev => 
                      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                    )}
                    className={`platform-pill ${isSelected ? 'active' : ''} ${!isConnected ? 'disabled' : ''}`}
                  >
                    {p === "twitter" ? "𝕏 Twitter" : "💼 LinkedIn"}
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="section" style={{ position: 'relative' }}>
            <label>CONTENT</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's the high-impact announcement?"
              style={{ height: '160px', borderColor: isOverLimit ? '#ff4d4d' : undefined }}
            />
            <div className="char-counter" style={{ color: isOverLimit ? '#ff4d4d' : undefined }}>
              {content.length} / {charLimit}
            </div>

            {/* AI Polisher Floating Action */}
            <div className="ai-polish-wrap">
              <button 
                onClick={() => setShowTonePicker(!showTonePicker)} 
                disabled={isPolishing || !content}
                className="ai-polish-btn"
              >
                {isPolishing ? <div className="spinner-small" /> : <Sparkles size={16} />}
                {isPolishing ? "POLISHING..." : "AI POLISH"}
              </button>

              {showTonePicker && (
                <div className="tone-picker">
                  <button onClick={() => handlePolish("professional")}>🤝 Professional</button>
                  <button onClick={() => handlePolish("provocative")}>🔥 Provocative</button>
                  <button onClick={() => handlePolish("educational")}>💡 Educational</button>
                </div>
              )}
            </div>
          </div>

          {/* Timing Engine */}
          <div className="section">
            <label>TIMING ENGINE</label>
            <div className="timing-grid">
              <button 
                onClick={() => setTimingMode("smart")}
                className={`timing-card ${timingMode === "smart" ? "active" : ""}`}
              >
                <Zap size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div className="title">Smart Snipe</div>
                  <div className="desc">Post at your next peak hour</div>
                </div>
              </button>

              <button 
                onClick={() => setTimingMode("now")}
                className={`timing-card ${timingMode === "now" ? "active" : ""}`}
              >
                <Send size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div className="title">Post Now</div>
                  <div className="desc">Queue for immediate drop</div>
                </div>
              </button>

              <button 
                onClick={() => setTimingMode("specific")}
                className={`timing-card ${timingMode === "specific" ? "active" : ""}`}
              >
                <Clock size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div className="title">Specific Time</div>
                  <div className="desc">Set a manual override</div>
                </div>
              </button>
            </div>

            {timingMode === "specific" && (
              <input 
                type="datetime-local" 
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="time-input"
              />
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="secondary-btn">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !content || selectedPlatforms.length === 0 || isOverLimit}
            className="primary-btn"
          >
            {isSubmitting ? "QUEUEING..." : "DEPLOY TO QUEUE"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 25, 41, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }
        .modal-content {
          background: white;
          width: 100%;
          max-width: 600px;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
        .close-btn { background: #f5f5f5; border: 0; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #666; }
        
        .modal-body { padding: 2rem; display: flex; flex-direction: column; gap: 2rem; }
        .section label { display: block; font-size: 0.7rem; font-weight: 800; color: #999; letter-spacing: 1px; margin-bottom: 0.5rem; }
        
        .platform-pill { padding: 0.6rem 1.2rem; border-radius: 12px; border: 1.5px solid #f0f0f0; background: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
        .platform-pill.active { border-color: #007bff; background: #eef2ff; color: #007bff; }
        .platform-pill.disabled { opacity: 0.5; cursor: not-allowed; background: #fafafa; }

        textarea { width: 100%; border: 1.5px solid #f0f0f0; border-radius: 16px; padding: 1.2rem; font-size: 1rem; outline: none; transition: border-color 0.2s; resize: none; font-family: inherit; }
        textarea:focus { border-color: #007bff; }
        .char-counter { position: absolute; bottom: 1rem; right: 1rem; font-size: 0.75rem; font-weight: 700; color: #999; }

        .ai-polish-wrap { position: absolute; top: 0; right: 0; transform: translateY(-30%); }
        .ai-polish-btn { background: #111; color: white; border: 0; padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.75rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .tone-picker { position: absolute; top: 110%; right: 0; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #f0f0f0; z-index: 10; overflow: hidden; display: flex; flex-direction: column; width: 140px; }
        .tone-picker button { padding: 0.7rem 1rem; border: 0; background: transparent; text-align: left; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .tone-picker button:hover { background: #f9f9f9; }

        .timing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 0.5rem; }
        .timing-card { padding: 1rem; border-radius: 16px; border: 1.5px solid #f0f0f0; background: white; cursor: pointer; display: flex; align-items: center; gap: 0.8rem; transition: all 0.2s; color: #666; }
        .timing-card.active { border-color: #007bff; background: #f0f7ff; color: #007bff; }
        .timing-card .title { font-weight: 800; font-size: 0.9rem; }
        .timing-card .desc { font-size: 0.7rem; opacity: 0.7; }

        .time-input { margin-top: 1rem; width: 100%; padding: 0.8rem; border-radius: 12px; border: 1.5px solid #f0f0f0; outline: none; }

        .modal-footer { padding: 1.5rem 2rem; background: #fafafa; display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid #f0f0f0; }
        .secondary-btn { background: transparent; border: 0; font-weight: 700; color: #999; cursor: pointer; }
        .primary-btn { padding: 0.8rem 1.8rem; border-radius: 12px; background: #007bff; color: white; border: 0; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(0, 123, 255, 0.2); }
        .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner-small { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
