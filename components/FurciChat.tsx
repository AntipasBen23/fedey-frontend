"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";

type Message = {
  role: "furci" | "user";
  text: string;
};

export default function FurciChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "furci", text: "I'm online. How can I help you grow today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 2000 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'var(--primary-strong)', 
            color: 'white', 
            border: 0, 
            boxShadow: '0 10px 30px rgba(9, 63, 103, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease'
          }}
          className="hover-scale"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{ 
          width: '380px', 
          height: '550px', 
          background: 'white', 
          borderRadius: '30px', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease',
          border: '1px solid #f0f0f0'
        }}>
          {/* Header */}
          <div style={{ padding: '1.5rem', background: 'var(--primary-strong)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={22} />
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>Furci AI</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Context Aware • Online</div>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 0, color: 'white', cursor: 'pointer' }}>
                <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fcfdfe' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '1rem',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: msg.role === 'user' ? 'var(--primary-strong)' : 'white',
                color: msg.role === 'user' ? 'white' : 'var(--text)',
                boxShadow: msg.role === 'user' ? 'none' : '0 4px 15px rgba(0,0,0,0.03)',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                fontWeight: msg.role === 'furci' ? 500 : 600
              }}>
                {msg.text}
              </div>
            ))}
            {loading && (
                <div style={{ alignSelf: 'flex-start', background: '#eee', padding: '0.8rem 1.2rem', borderRadius: '15px', fontSize: '0.8rem', color: '#888' }}>
                    Furci is thinking...
                </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{ padding: '1.2rem', background: 'white', borderTop: '1px solid #eee' }}>
            <div style={{ position: 'relative' }}>
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your strategy..."
                    style={{ 
                        width: '100%', 
                        padding: '1rem 3.5rem 1rem 1.2rem', 
                        borderRadius: '15px', 
                        border: '1px solid #eee',
                        fontSize: '0.9rem',
                        outline: 'none',
                        background: '#f8f9fa'
                    }}
                />
                <button 
                    onClick={handleSend}
                    style={{ 
                        position: 'absolute', 
                        right: '8px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: '35px', 
                        height: '35px', 
                        borderRadius: '10px', 
                        background: 'var(--primary-strong)', 
                        color: 'white', 
                        border: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer' 
                    }}
                >
                    <Send size={16} />
                </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .hover-scale:hover { transform: scale(1.1); }
      `}</style>
    </div>
  );
}
