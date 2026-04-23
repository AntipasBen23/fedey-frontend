"use client";

import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useAutopilot } from "../context/AutopilotContext";

const inter = Inter({ subsets: ["latin"], weight: ["600"] });

export function Header() {
  const { isAutopilot, setAutopilotState } = useAutopilot();

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      height: '90px',
      background: 'transparent',
      borderBottom: 'none',
      backdropFilter: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0 }}>
        <Image
          src="/furciai-logo.jpeg"
          alt="Furci.ai"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: 'auto', height: '80px', objectFit: 'contain' }}
          priority
        />
        <span
          className={inter.className}
          style={{
            fontSize: '28px',
            fontWeight: 600,
            lineHeight: '110%',
            letterSpacing: '0%',
            color: 'var(--text)',
          }}
        >
          Furci<span style={{ color: 'var(--primary-strong)' }}> AI</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isAutopilot ? 'var(--primary-strong)' : 'var(--muted)' }}>
          {isAutopilot ? "🚀 Autopilot Active" : "✋ Review Mode"}
        </span>
        <button
          onClick={() => setAutopilotState(!isAutopilot)}
          style={{
            width: '50px',
            height: '26px',
            borderRadius: '999px',
            background: isAutopilot ? 'var(--primary-strong)' : '#e2e8f0',
            border: 'none',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: '3px',
            left: isAutopilot ? '27px' : '3px',
            transition: 'left 0.3s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }} />
        </button>
      </div>
    </header>
  );
}
