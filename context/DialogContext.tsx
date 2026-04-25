"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends Required<ConfirmOptions> {
  open: boolean;
  message: string;
  resolve: (val: boolean) => void;
}

interface DialogContextType {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  toast: (message: string, type?: ToastType) => void;
}

const DialogContext = createContext<DialogContextType>({
  confirm: async () => false,
  toast: () => {},
});

export function useDialog() {
  return useContext(DialogContext);
}

let toastId = 0;

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
  success: { bg: "#f0fdf4", border: "#86efac", icon: "✓", iconBg: "#22c55e" },
  error:   { bg: "#fff1f2", border: "#fca5a5", icon: "✕", iconBg: "#ef4444" },
  info:    { bg: "#eff6ff", border: "#93c5fd", icon: "i", iconBg: "#3b82f6" },
};

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    message: "",
    title: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    danger: false,
    resolve: () => {},
  });

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const confirm = useCallback((message: string, options?: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({
        open: true,
        message,
        title: options?.title ?? "",
        confirmLabel: options?.confirmLabel ?? "Confirm",
        cancelLabel: options?.cancelLabel ?? "Cancel",
        danger: options?.danger ?? false,
        resolve,
      });
    });
  }, []);

  const settle = (val: boolean) => {
    confirmState.resolve(val);
    setConfirmState(prev => ({ ...prev, open: false }));
  };

  return (
    <DialogContext.Provider value={{ confirm, toast }}>
      {children}

      {/* ── Toast stack ── */}
      <div style={{
        position: "fixed", bottom: "2rem", right: "2rem",
        zIndex: 9999, display: "flex", flexDirection: "column",
        gap: "0.75rem", pointerEvents: "none",
      }}>
        {toasts.map(t => {
          const c = TOAST_COLORS[t.type];
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: "14px", padding: "1rem 1.4rem",
              display: "flex", alignItems: "center", gap: "0.75rem",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              maxWidth: "380px", pointerEvents: "auto",
              animation: "toastIn 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: "50%",
                background: c.iconBg, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 800, flexShrink: 0,
              }}>{c.icon}</span>
              <span style={{ fontSize: "0.95rem", color: "#1a1a1a", fontWeight: 500, lineHeight: 1.4 }}>
                {t.message}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Confirm modal ── */}
      {confirmState.open && (
        <div
          onClick={() => settle(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9998, animation: "dialogFadeIn 0.2s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white", borderRadius: "24px",
              padding: "2.5rem", maxWidth: "440px", width: "90%",
              boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
              animation: "dialogSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div style={{ fontSize: "2.8rem", textAlign: "center", marginBottom: "1rem" }}>
              {confirmState.danger ? "⚠️" : "💬"}
            </div>

            {confirmState.title && (
              <h3 style={{
                fontSize: "1.35rem", fontWeight: 800, color: "#1a1a1a",
                textAlign: "center", marginBottom: "0.6rem", marginTop: 0,
              }}>
                {confirmState.title}
              </h3>
            )}

            <p style={{
              fontSize: "1rem", color: "#526e82", lineHeight: 1.6,
              textAlign: "center", marginBottom: "2rem", marginTop: 0,
            }}>
              {confirmState.message}
            </p>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => settle(false)}
                style={{
                  flex: 1, padding: "1rem", background: "transparent",
                  border: "2px solid #e5e7eb", borderRadius: "14px",
                  fontSize: "1rem", fontWeight: 700, color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                {confirmState.cancelLabel}
              </button>
              <button
                onClick={() => settle(true)}
                style={{
                  flex: 1, padding: "1rem", border: "none", borderRadius: "14px",
                  fontSize: "1rem", fontWeight: 700, color: "white", cursor: "pointer",
                  background: confirmState.danger
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "linear-gradient(135deg, #22c55e, #16a34a)",
                  boxShadow: confirmState.danger
                    ? "0 4px 16px rgba(220,38,38,0.3)"
                    : "0 4px 16px rgba(34,197,94,0.3)",
                }}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dialogFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes dialogSlideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes toastIn       { from { opacity: 0; transform: translateX(24px) } to { opacity: 1; transform: translateX(0) } }
      `}</style>
    </DialogContext.Provider>
  );
}
