"use client";

import React from "react";
import { useFarcaster } from "./FarcasterContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { username, fid } = useFarcaster();
  return (
    <div>
      <h1>Welcome {username}</h1>
      <h2>Your FID is {fid}</h2>
      {children}
    </div>
  );
}
