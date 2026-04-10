"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles } from "lucide-react";

type Message = {
  role: "furci" | "user";
  text: string;
};

export default function FurciChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "furci", text: "Dashboard intelligence is active. How can I help you manage your growth today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea logic
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
      const response = await fetch(`${apiUrl}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error("Connection lost");
      const json = await response.json();
      setMessages(prev => [...prev, { role: "furci", text: json.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "furci", text: "Sorry, my neural link is offline. Stand by." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card highlight-border" style={{ 
        marginBottom: '2.5rem', 
        padding: '1.5rem', 
        borderRadius: '24px', 
        background: 'white',
        boxShadow: '0 15px 35px rgba(0,0,0,0.03)',
        border: '2px solid #f0f7ff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
          <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'var(--primary-strong)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} />
          </div>
          <h4 style={{ margin: 0, color: '#093f67', fontSize: '1.1rem', fontWeight: 800 }}>
             Wanna ask Furci how work is going or progress of work? 🕵️‍♂️
          </h4>
      </div>

      {/* Chat History - Integrated and Scrollable */}
      {messages.length > 0 && (
          <div 
            ref={scrollRef}
            style={{ 
                maxHeight: '200px', 
                overflowY: 'auto', 
                padding: '1rem', 
                background: '#f8fbff', 
                borderRadius: '16px', 
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                padding: '0.8rem 1.2rem',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'var(--primary-strong)' : 'white',
                color: msg.role === 'user' ? 'white' : '#444',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: msg.role === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.02)',
                border: msg.role === 'user' ? 'none' : '1px solid #eef2f6'
              }}>
                {msg.text}
              </div>
            ))}
            {loading && (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={14} className="pulse" /> Furci is analyzing your situation...
                </div>
            )}
          </div>
      )}

      {/* Auto-expanding Input Box */}
      <div style={{ position: 'relative' }}>
          <textarea 
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                  }
              }}
              placeholder="Type your question here (e.g. How is my queue looking?)"
              rows={1}
              style={{ 
                  width: '100%', 
                  padding: '1.2rem 4.5rem 1.2rem 1.2rem', 
                  borderRadius: '16px', 
                  border: '2px solid #eef2f6',
                  fontSize: '1rem',
                  fontWeight: 600,
                  outline: 'none',
                  background: 'white',
                  resize: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s ease',
                  minHeight: '60px'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-strong)'}
              onBlur={(e) => e.target.style.borderColor = '#eef2f6'}
          />
          <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  bottom: '12px', 
                  padding: '0.8rem 1.2rem', 
                  borderRadius: '12px', 
                  background: 'var(--primary-strong)', 
                  color: 'white', 
                  border: 0, 
                  fontWeight: 800,
                  cursor: 'pointer',
                  opacity: (loading || !input.trim()) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
              }}
          >
              <Send size={18} />
              <span>Ask</span>
          </button>
      </div>

      <style jsx>{`
        .pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
