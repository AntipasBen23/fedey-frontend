"use client";

import { useEffect, useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, BarChart2, Zap, RefreshCw, ArrowLeft } from "lucide-react";
import { useDialog } from "@/context/DialogContext";
import Link from "next/link";
import PeakHourHeatmap from "@/components/PeakHourHeatmap";

type AnalyticsData = {
  totalReach: number;
  avgImpact: number;
  engagementRate: number;
  bestPerformers: any[];
};

// Mock data for the chart (until we have enough synced data)
const chartData = [
  { name: 'Mon', engagement: 400, reach: 2400 },
  { name: 'Tue', engagement: 300, reach: 1398 },
  { name: 'Wed', engagement: 200, reach: 9800 },
  { name: 'Thu', engagement: 278, reach: 3908 },
  { name: 'Fri', engagement: 189, reach: 4800 },
  { name: 'Sat', engagement: 239, reach: 3800 },
  { name: 'Sun', engagement: 349, reach: 4300 },
];

export default function AnalyticsPage() {
  const { toast } = useDialog();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      const response = await fetch(`${apiUrl}/v1/analytics`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load analytics");
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    setIsSyncing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      const response = await fetch(`${apiUrl}/v1/analytics/sync`, { method: 'POST', credentials: "include" });
      if (!response.ok) throw new Error("Sync failed");
      await fetchAnalytics();
      toast("Intelligence Sync Complete! Your impact score has been updated.", "success");
    } catch (err) {
      toast("Error syncing analytics", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return <div className="page center"><h2>Consulting Furci's records...</h2></div>;

  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '0.5rem', fontWeight: 700 }}>
             <ArrowLeft size={18} /> BACK TO ENGINE
          </Link>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Impact Intelligence 📊</h1>
        </div>
        
        <button 
          onClick={syncData}
          disabled={isSyncing}
          style={{ 
            padding: '1rem 2rem', 
            borderRadius: '16px', 
            background: 'var(--primary-strong)', 
            color: 'white', 
            border: 0, 
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.7rem',
            boxShadow: '0 10px 20px rgba(0, 123, 255, 0.2)'
          }}
        >
          <RefreshCw className={isSyncing ? "spin" : ""} size={20} />
          {isSyncing ? "SYNCING..." : "SYNC LIVE STATS"}
        </button>
      </div>

      {/* Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
         <div className="stat-card premium">
            <div className="icon-wrap"><TrendingUp /></div>
            <label>TOTAL REACH</label>
            <div className="value">{data?.totalReach.toLocaleString() || "0"}</div>
            <p className="sub">Impressions across all platforms</p>
         </div>
         <div className="stat-card premium highlight">
            <div className="icon-wrap"><Zap /></div>
            <label>AVG IMPACT SCORE</label>
            <div className="value">{data?.avgImpact || "0"}/100</div>
            <p className="sub">AI calculation of engagement quality</p>
         </div>
         <div className="stat-card premium">
            <div className="icon-wrap"><BarChart2 /></div>
            <label>ENGAGEMENT RATE</label>
            <div className="value">{(data?.engagementRate || 0).toFixed(2)}%</div>
            <p className="sub">Relative to total impressions</p>
         </div>
      </div>

      <PeakHourHeatmap />

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
         <div className="card" style={{ padding: '2.5rem', borderRadius: '32px' }}>
            <h3 style={{ marginBottom: '2rem' }}>Engagement Trend</h3>
            <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary-strong)" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="var(--primary-strong)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="engagement" stroke="var(--primary-strong)" strokeWidth={3} fillOpacity={1} fill="url(#colorEngage)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </div>

         <div className="card" style={{ padding: '2.5rem', borderRadius: '32px', background: '#f8fbff' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>AI Insights 🧠</h3>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>💡</div>
                    <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5', margin: 0 }}>
                        Your **Sora Update** post performed 40% better than average. Double down on real-time tech news.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>📈</div>
                    <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5', margin: 0 }}>
                        LinkedIn engagement is peaking at **10:45 AM**. Furci has automatically adjusted your stagger strategy.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>🚀</div>
                    <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5', margin: 0 }}>
                        Your hook "Provocative" style is trending. Keep using "Question-first" hooks for X.
                    </p>
                </div>
            </div>
         </div>
      </div>

      <style jsx>{`
        .stat-card.premium {
            background: white;
            padding: 2.5rem;
            border-radius: 32px;
            border: 1px solid #f0f0f0;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        .stat-card.premium:hover { transform: translateY(-5px); }
        .stat-card.highlight { border: 2px solid var(--primary-strong); background: #f0f7ff; }
        .icon-wrap {
            color: var(--primary-strong);
            margin-bottom: 1.5rem;
        }
        .stat-card label {
            display: block;
            font-size: 0.75rem;
            font-weight: 800;
            color: var(--muted);
            letter-spacing: 1.5px;
            margin-bottom: 0.5rem;
        }
        .stat-card .value {
            font-size: 2.2rem;
            font-weight: 900;
            color: var(--text);
            margin-bottom: 0.5rem;
        }
        .stat-card .sub {
            font-size: 0.85rem;
            color: var(--muted);
            margin: 0;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
