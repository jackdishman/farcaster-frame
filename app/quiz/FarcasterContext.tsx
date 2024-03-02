"use client";

import React, { createContext, useContext, useState } from "react";

// Define the shape of the context
interface FarcasterContextType {
  fid: string | null;
  username: string | null;
  setFid: (fid: string | null) => void;
  setUsername: (username: string | null) => void;
}

// Create the context with a default undefined value
const FarcasterContext = createContext<FarcasterContextType | undefined>(
  undefined
);

// Create a custom hook to use the context
export function useFarcaster() {
  const context = useContext(FarcasterContext);
  if (context === undefined) {
    throw new Error("useFarcaster must be used within a FarcasterProvider");
  }
  return context;
}

// Provider component that wraps your app and makes the context available to any child component
export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [fid, setFid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  return (
    <FarcasterContext.Provider value={{ fid, username, setFid, setUsername }}>
      {children}
    </FarcasterContext.Provider>
  );
}
