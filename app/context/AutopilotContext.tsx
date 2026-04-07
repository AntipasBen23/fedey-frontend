"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AutopilotContextType = {
  isAutopilot: boolean;
  toggleAutopilot: () => void;
};

const AutopilotContext = createContext<AutopilotContextType | undefined>(undefined);

export function AutopilotProvider({ children }: { children: React.ReactNode }) {
  const [isAutopilot, setIsAutopilot] = useState(false);

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem("furciAutopilot");
    if (saved) {
      setIsAutopilot(JSON.parse(saved));
    }
  }, []);

  const toggleAutopilot = () => {
    setIsAutopilot((prev) => {
      const next = !prev;
      localStorage.setItem("furciAutopilot", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AutopilotContext.Provider value={{ isAutopilot, toggleAutopilot }}>
      {children}
    </AutopilotContext.Provider>
  );
}

export function useAutopilot() {
  const context = useContext(AutopilotContext);
  if (!context) {
    throw new Error("useAutopilot must be used within an AutopilotProvider");
  }
  return context;
}
