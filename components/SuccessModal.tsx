"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function SuccessModal({ isOpen, onClose, title, message }: SuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '32px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        transform: 'translateY(0)',
        animation: 'slideUp 0.4s ease'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          display: 'inline-block',
          animation: 'bounce 2s infinite'
        }}>
          ✨
        </div>
        <h2 style={{ fontSize: '2rem', color: '#093f67', marginBottom: '1rem' }}>{title}</h2>
        <p style={{ color: '#526e82', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          {message}
        </p>
        
        <button
          onClick={() => {
            onClose();
            router.push("/dashboard");
          }}
          style={{
            width: '100%',
            padding: '1.2rem',
            background: 'linear-gradient(180deg, #8fd1ff, var(--primary-strong))',
            color: '#05345a',
            fontWeight: '800',
            fontSize: '1.2rem',
            border: 0,
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            boxShadow: '0 10px 20px rgba(0, 123, 255, 0.2)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Enter Dashboard 🚀
        </button>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-20px);}
            60% {transform: translateY(-10px);}
          }
        `}</style>
      </div>
    </div>
  );
}
