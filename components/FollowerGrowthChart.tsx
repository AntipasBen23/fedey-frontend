"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Point = { date: string; count: number };

type Props = {
  data: Point[];
  currentCount: number;
  growth: number; // +/- vs 30 days ago
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e1b4b",
      border: "none",
      borderRadius: "10px",
      padding: "0.5rem 0.85rem",
      boxShadow: "0 8px 24px rgba(99,102,241,0.25)",
    }}>
      <p style={{ margin: 0, color: "#a5b4fc", fontSize: "0.72rem", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, color: "#fff", fontSize: "1rem", fontWeight: 800 }}>
        {payload[0].value.toLocaleString()} followers
      </p>
    </div>
  );
};

export default function FollowerGrowthChart({ data, currentCount, growth }: Props) {
  const hasData = data && data.length > 1;
  const growthPositive = growth >= 0;

  // Pad with placeholder points if only 1 snapshot exists
  const chartData = hasData ? data : [
    { date: "Day 1", count: currentCount },
    { date: "Today", count: currentCount },
  ];

  const minVal = Math.min(...chartData.map(d => d.count));
  const maxVal = Math.max(...chartData.map(d => d.count));
  const domain: [number, number] = [
    Math.max(0, minVal - Math.ceil((maxVal - minVal) * 0.3)),
    maxVal + Math.ceil((maxVal - minVal) * 0.2) + 10,
  ];

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
      borderRadius: "20px",
      padding: "1.5rem",
      color: "#fff",
    }}>
      {/* Header numbers */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Follower Growth
          </p>
          <p style={{ margin: "0.15rem 0 0", fontSize: "2.2rem", fontWeight: 900, lineHeight: 1 }}>
            {currentCount.toLocaleString()}
          </p>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          background: growthPositive ? "rgba(134,239,172,0.15)" : "rgba(252,165,165,0.15)",
          border: `1px solid ${growthPositive ? "rgba(134,239,172,0.3)" : "rgba(252,165,165,0.3)"}`,
          borderRadius: "999px",
          padding: "0.35rem 0.75rem",
          fontSize: "0.85rem",
          fontWeight: 800,
          color: growthPositive ? "#86efac" : "#fca5a5",
        }}>
          {growthPositive ? "▲" : "▼"} {Math.abs(growth).toLocaleString()}
          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: growthPositive ? "#4ade80" : "#f87171", marginLeft: "0.2rem" }}>
            30d
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: "110px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "#6366f1", fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis domain={domain} hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#818cf8", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#818cf8"
              strokeWidth={2.5}
              fill="url(#followerGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#fff", stroke: "#818cf8", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!hasData && (
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#6366f1", margin: "0.5rem 0 0" }}>
          Sync daily to build your growth curve
        </p>
      )}
    </div>
  );
}
