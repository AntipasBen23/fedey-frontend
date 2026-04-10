"use client";

import { useEffect, useState } from "react";

type Trend = {
  topic: string;
  engagement: string;
  description: string;
};

type TrendingWidgetProps = {
    onReact: (topic: string) => void;
};

export default function TrendingWidget({ onReact }: TrendingWidgetProps) {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrends = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setIsRefreshing(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
      const response = await fetch(`${apiUrl}/v1/trends`);
      if (!response.ok) throw new Error("Failed to load trends");
      const json = await response.json();
      setTrends(json.trends || []);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
        fetchTrends(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Furci is listening to the world...</p>
    </div>
  );

  return (
    <div className="card" style={{ padding: '2rem', borderRadius: '24px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <span>📈</span> Trending Now
            </h4>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                UPDATED {lastUpdated} {isRefreshing && "• REFRESHING..."}
            </div>
        </div>
        <span style={{ fontSize: '0.7rem', background: '#e6f4ff', color: 'var(--primary-strong)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>LIVE</span>
      </div>

      <div className="custom-scroll" style={{ 
        display: 'grid', 
        gap: '1.2rem', 
        maxHeight: '600px', 
        overflowY: 'auto',
        paddingRight: '1rem'
      }}>
        {trends.map((trend, i) => (
          <div key={i} className="trend-item" style={{ 
            borderBottom: i === trends.length - 1 ? 0 : '1px solid #f0f0f0', 
            paddingBottom: i === trends.length - 1 ? 0 : '1.2rem',
            animation: 'fadeIn 0.5s ease'
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>
                    {trend.topic}
                </div>
                <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 900, 
                    color: trend.engagement === 'Explosive' ? '#ff4d4d' : 'var(--primary-strong)',
                }}>
                    {trend.engagement.toUpperCase()}
                </span>
             </div>
             <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                {trend.description}
             </p>
             <button 
               onClick={() => onReact(trend.topic)}
               style={{ 
                width: '100%', 
                padding: '0.6rem', 
                borderRadius: '10px', 
                background: 'var(--primary-strong)', 
                color: 'white', 
                border: 0, 
                fontWeight: 700, 
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'transform 0.1s ease'
             }}>
                React with AI Draft ⚡
             </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: #f0f0f0 transparent;
        }
        .custom-scroll::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
            background-color: #f0f0f0;
            border-radius: 10px;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

