"use client";

import { createContext, useContext, useState } from "react";

type AutopilotContextType = {
  isAutopilot: boolean;
  setAutopilotState: (enabled: boolean) => void;
};

const AutopilotContext = createContext<AutopilotContextType | undefined>(undefined);

export function AutopilotProvider({ children }: { children: React.ReactNode }) {
  // State only — dashboard reads the authoritative value from the backend
  // and calls setAutopilotState after loading/toggling.
  const [isAutopilot, setIsAutopilot] = useState(false);

  const setAutopilotState = (enabled: boolean) => {
    setIsAutopilot(enabled);
  };

  return (
    <AutopilotContext.Provider value={{ isAutopilot, setAutopilotState }}>
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
