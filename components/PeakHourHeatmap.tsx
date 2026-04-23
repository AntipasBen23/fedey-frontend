"use client";

import { useState, useEffect } from "react";

interface PeakData {
  day: number;
  hour: number;
  engagement: number;
  reach: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function PeakHourHeatmap() {
  const [data, setData] = useState<PeakData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<PeakData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
        const res = await fetch(`${apiUrl}/v1/analytics/peak-hours`);
        if (!res.ok) throw new Error("Failed to load heatmap data");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="heatmap-loader">Mapping your impact windows...</div>;

  const maxEng = Math.max(...data.map(d => d.engagement), 1);

  const getIntensity = (day: number, hour: number) => {
    const point = data.find(d => d.day === day && d.hour === hour);
    if (!point) return 0;
    return point.engagement / maxEng;
  };

  const getPoint = (day: number, hour: number) => {
    return data.find(d => d.day === day && d.hour === hour);
  };

  return (
    <div className="card heatmap-card">
      <div className="card-header">
        <div>
          <h3>Peak Engagement Heatmap 🌡️</h3>
          <p className="subtext">Darker blue indicates higher engagement rate for your brand.</p>
        </div>
        {hovered && (
          <div className="hover-stat">
            <strong>{hovered.engagement.toFixed(1)}% ENG</strong>
            <span> • {hovered.reach.toLocaleString()} Reach</span>
          </div>
        )}
      </div>

      <div className="heatmap-container">
        <div className="hour-labels">
          <div className="label-spacer" />
          {HOURS.filter(h => h % 3 === 0).map(h => (
            <div key={h} className="hour-label">
              {h === 0 ? "12am" : h === 12 ? "12pm" : h > 12 ? `${h-12}pm` : `${h}am`}
            </div>
          ))}
        </div>

        {DAYS.map((dayName, dayIdx) => (
          <div key={dayName} className="day-row">
            <div className="day-label">{dayName}</div>
            <div className="cells">
              {HOURS.map(hour => {
                const intensity = getIntensity(dayIdx, hour);
                const point = getPoint(dayIdx, hour);
                return (
                  <div
                    key={hour}
                    className="cell"
                    style={{ 
                      backgroundColor: `rgba(0, 123, 255, ${Math.max(0.05, intensity)})`,
                      boxShadow: intensity > 0.8 ? 'inset 0 0 0 1px rgba(255,255,255,0.2)' : 'none'
                    }}
                    onMouseEnter={() => point && setHovered(point)}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .heatmap-card { padding: 2.5rem; border-radius: 32px; background: white; margin-bottom: 2rem; border: 1px solid #f0f0f0; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        h3 { margin: 0 0 0.4rem 0; font-size: 1.4rem; }
        .subtext { margin: 0; color: #999; font-size: 0.9rem; }
        
        .hover-stat { background: #111; color: white; padding: 0.6rem 1rem; border-radius: 12px; font-size: 0.85rem; display: flex; gap: 0.5rem; align-items: center; border: 1px solid rgba(255,255,255,0.1); }
        .hover-stat strong { color: #007bff; }

        .heatmap-container { display: flex; flex-direction: column; gap: 4px; overflow-x: auto; padding-bottom: 1rem; }
        .hour-labels { display: flex; gap: 4px; margin-bottom: 10px; }
        .label-spacer { width: 45px; flex-shrink: 0; }
        .hour-label { width: calc((100% - 45px) / 8); font-size: 0.7rem; font-weight: 700; color: #bbb; text-transform: uppercase; text-align: left; }

        .day-row { display: flex; gap: 10px; align-items: center; }
        .day-label { width: 45px; font-size: 0.75rem; font-weight: 800; color: #444; }
        .cells { display: flex; gap: 4px; flex: 1; min-width: 600px; }
        .cell { flex: 1; height: 32px; border-radius: 4px; cursor: crosshair; transition: transform 0.1s ease; }
        .cell:hover { transform: scale(1.1); z-index: 2; position: relative; border: 1.5px solid #007bff; }

        .heatmap-loader { padding: 4rem; text-align: center; color: #999; font-weight: 700; font-size: 1rem; }
      `}</style>
    </div>
  );
}
