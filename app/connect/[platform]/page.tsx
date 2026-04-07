"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PlatformContextPage() {
  const params = useParams();
  const router = useRouter();
  const platform = params.platform as string;
  
  const [productName, setProductName] = useState<string>("your product");
  const [accountType, setAccountType] = useState<"old" | "new" | null>(null);

  useEffect(() => {
    // Attempt to get product name from local storage analysis
    const stored = localStorage.getItem("furciJobDescription");
    if (stored) {
      // Very simple extraction for display
      setProductName("your project");
    }
  }, []);

  const platformNames: Record<string, string> = {
    twitter: "Twitter (X)",
    linkedin: "LinkedIn",
    tiktok: "TikTok"
  };

  const displayName = platformNames[platform] || platform;

  const handleConnect = () => {
    if (!accountType) return;
    
    // Save selection
    localStorage.setItem(`furci_${platform}_context`, accountType);
    
    // Proceed to actual Auth (Mocked for now until keys are added)
    alert(`Redirecting to ${displayName} OAuth Login...\n(Note: This will require your Client ID/Secret in .env)`);
    
    // In a real flow, this would trigger signIn(platform) via NextAuth
    // router.push('/strategy'); // Lead them to strategy after "auth"
  };

  return (
    <div className="page" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh' 
    }}>
      <div className="hero animate-fade-in-up" style={{ 
        width: '100%', 
        maxWidth: '700px', 
        padding: '3rem 2.5rem',
        background: 'linear-gradient(160deg, rgba(255, 255, 255, 0.98), rgba(236, 247, 255, 0.98))',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(90, 178, 255, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem', color: 'var(--text)' }}>
          {displayName} Context
        </h2>
        <p style={{ margin: '0 0 2.5rem', color: 'var(--muted)', fontSize: '1.2rem' }}>
          Tell me about your {displayName} account for <strong>{productName}</strong>.
        </p>

        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
          <button 
            onClick={() => setAccountType("old")}
            style={{
              padding: '2rem',
              borderRadius: '20px',
              border: accountType === "old" ? '3px solid var(--primary-strong)' : '1px solid #cfe6ff',
              background: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: accountType === "old" ? '0 10px 20px rgba(90, 178, 255, 0.15)' : 'none'
            }}
          >
            <div style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text)' }}>
              Old Account 🕰️
            </div>
            <div style={{ color: 'var(--muted)' }}>
              Already has existing content about {productName}. I'll audit your past posts and impressions.
            </div>
          </button>

          <button 
            onClick={() => setAccountType("new")}
            style={{
              padding: '2rem',
              borderRadius: '20px',
              border: accountType === "new" ? '3px solid var(--primary-strong)' : '1px solid #cfe6ff',
              background: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: accountType === "new" ? '0 10px 20px rgba(90, 178, 255, 0.15)' : 'none'
            }}
          >
            <div style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text)' }}>
              Brand New Account ✨
            </div>
            <div style={{ color: 'var(--muted)' }}>
              Needs fresh content from scratch. I'll build your brand presence from the ground up.
            </div>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link 
            href="/connect"
            style={{
              padding: '1.2rem 2.5rem',
              borderRadius: '16px',
              color: '#05345a',
              fontWeight: '700',
              background: 'linear-gradient(180deg, #edf7ff, #c7e6ff)',
              textDecoration: 'none',
              border: '1px solid #b7dbff'
            }}
          >
            Back
          </Link>
          <button 
            onClick={handleConnect}
            disabled={!accountType}
            className={accountType ? "btn-pulse" : ""}
            style={{
              padding: '1.2rem 3.5rem',
              borderRadius: '16px',
              color: '#05345a',
              fontWeight: '700',
              fontSize: '1.1rem',
              background: accountType ? 'linear-gradient(180deg, #8fd1ff, var(--primary-strong))' : '#e2e8f0',
              border: 'none',
              cursor: accountType ? 'pointer' : 'not-allowed',
              opacity: accountType ? 1 : 0.7
            }}
          >
            Authorize Furci
          </button>
        </div>
      </div>
    </div>
  );
}
