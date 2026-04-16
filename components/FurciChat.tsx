"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, Activity, Search, Brain, Zap } from "lucide-react";

type Message = {
  role: "furci" | "user";
  text: string;
};

const QUICK_ACTIONS = [
  { label: "Analyze my growth curve 📈", prompt: "How is my growth going? Analyze my current metrics." },
  { label: "What's in my queue? 📅", prompt: "Give me a summary of my upcoming posts in the queue." },
  { label: "Suggest a trend take 🔥", prompt: "What are the latest trends and how should I react to them?" },
  { label: "Audit my identity 🕵️‍♂️", prompt: "Check my brand identity audit and tell me if I'm on track." },
];

const THINKING_STEPS = [
  { icon: <Search size={14} />, text: "Scanning your content queue..." },
  { icon: <Activity size={14} />, text: "Analyzing live performance metrics..." },
  { icon: <Brain size={14} />, text: "Synthesizing strategic response..." },
];

export default function FurciChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "furci", text: "Autonomous intelligence active. I'm connected to your live metrics and queue. How can I help you scale today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Thinking steps animation
  useEffect(() => {
    let interval: any;
    if (loading) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep(prev => (prev + 1) % THINKING_STEPS.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Auto-expand textarea logic
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading, thinkingStep]);

  const handleSend = async (customMsg?: string) => {
    const userMsg = (customMsg || input).trim();
    if (!userMsg || loading) return;

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
      setMessages(prev => [...prev, { role: "furci", text: "Sorry, my neural link is offline. I'm still monitoring your accounts in the background." }]);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary-strong)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 123, 255, 0.2)' }}>
                  <Bot size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#093f67', fontSize: '1.1rem', fontWeight: 800 }}>Furci Tactical Brain</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', color: '#5ec26a', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.1rem' }}>
                   <span style={{ width: '6px', height: '6px', background: '#5ec26a', borderRadius: '50%' }} className="pulse"></span>
                   Context Synced & Ready
                </div>
              </div>
          </div>
          <div style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#f0f7ff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700 }}>
             <Zap size={14} /> Full Access
          </div>
      </div>

      {/* Chat History */}
      <div 
        ref={scrollRef}
        style={{ 
            maxHeight: '300px', 
            overflowY: 'auto', 
            padding: '1rem', 
            background: '#f9fafb', 
            borderRadius: '20px', 
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: '1px solid #f1f5f9'
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: msg.role === 'user' ? '80%' : '90%',
            padding: '0.9rem 1.25rem',
            borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            background: msg.role === 'user' ? 'var(--primary-strong)' : 'white',
            color: msg.role === 'user' ? 'white' : '#1e293b',
            fontSize: '0.92rem',
            fontWeight: 500,
            lineHeight: 1.5,
            boxShadow: msg.role === 'user' ? '0 4px 12px rgba(0, 123, 255, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
            border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0'
          }}>
            {msg.text}
          </div>
        ))}
        {loading && (
            <div style={{ 
              alignSelf: 'flex-start',
              background: '#eef2ff',
              padding: '0.75rem 1.2rem',
              borderRadius: '20px 20px 20px 4px',
              border: '1px solid #e0e7ff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#4f46e5',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
                <div className="spin" style={{ color: '#4f46e5' }}>
                  {THINKING_STEPS[thinkingStep].icon}
                </div>
                <span>{THINKING_STEPS[thinkingStep].text}</span>
            </div>
        )}
      </div>

      {/* Quick Action Chips */}
      {!loading && messages.length < 5 && (
        <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
           {QUICK_ACTIONS.map((action, idx) => (
             <button
                key={idx}
                onClick={() => handleSend(action.prompt)}
                style={{ 
                  flexShrink: 0,
                  padding: '0.6rem 1rem',
                  borderRadius: '12px',
                  background: 'white',
                  border: '1.5px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-strong)';
                  e.currentTarget.style.color = 'var(--primary-strong)';
                  e.currentTarget.style.background = '#f0f7ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.background = 'white';
                }}
             >
                {action.label}
             </button>
           ))}
        </div>
      )}

      {/* Input Section */}
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
              placeholder="Ask Furci about your growth..."
              rows={1}
              style={{ 
                  width: '100%', 
                  padding: '1.1rem 4rem 1.1rem 1.25rem', 
                  borderRadius: '18px', 
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  fontWeight: 500,
                  outline: 'none',
                  background: '#f8fafc',
                  resize: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  minHeight: '56px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-strong)';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 123, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
          />
          <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  bottom: '8px', 
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px', 
                  background: 'var(--primary-strong)', 
                  color: 'white', 
                  border: 0, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: (loading || !input.trim()) ? 0.3 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 10px rgba(0, 123, 255, 0.2)'
              }}
          >
              <Send size={18} />
          </button>
      </div>

      <style jsx>{`
        .pulse { animation: pulse 2s infinite; }
        .spin { animation: spin 2s linear infinite; }
        @keyframes pulse { 0% { opacity: 0.4; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.4; transform: scale(0.9); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
