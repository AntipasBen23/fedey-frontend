"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function ErrorModal({ isOpen, onClose, title, message }: ErrorModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '32px',
        maxWidth: '480px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 30px 60px -12px rgba(220, 38, 38, 0.25)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.2))'
        }}>
          ⚠️
        </div>
        
        <h2 style={{ 
          fontSize: '2rem', 
          color: '#1a1a1a', 
          marginBottom: '1rem',
          fontWeight: 800
        }}>
          {title}
        </h2>
        
        <p style={{ 
          color: '#526e82', 
          fontSize: '1.1rem', 
          lineHeight: '1.6', 
          marginBottom: '2.5rem' 
        }}>
          {message}
        </p>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <button
            onClick={() => {
              onClose();
              router.push("/");
            }}
            style={{
              width: '100%',
              padding: '1.2rem',
              background: 'linear-gradient(180deg, #ff8f8f, #dc2626)',
              color: 'white',
              fontWeight: '800',
              fontSize: '1.1rem',
              border: 0,
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              boxShadow: '0 10px 20px rgba(220, 38, 38, 0.2)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Connect My Account 🔗
          </button>
          
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              color: '#dc2626',
              fontWeight: '700',
              fontSize: '1rem',
              border: '2px solid #fee2e2',
              borderRadius: '16px',
              cursor: 'pointer'
            }}
          >
            Stay on this Page
          </button>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
