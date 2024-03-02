"use client";

import "@farcaster/auth-kit/styles.css";
import React from "react";
import { AuthKitProvider, SignInButton } from "@farcaster/auth-kit";
import { FarcasterProvider, useFarcaster } from "./FarcasterContext"; // Ensure the import is correct

const domain = process.env.NEXT_PUBLIC_HOST?.replace(/(^\w+:|^)\/\//, "");
const config = {
  rpcUrl: "https://mainnet.optimism.io",
  domain,
  siweUri: process.env.NEXT_PUBLIC_HOST + `/login`,
};

export default function FarcasterWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FarcasterProvider>
      <AuthKitProvider config={config}>
        <SignInHandler>{children}</SignInHandler>
      </AuthKitProvider>
    </FarcasterProvider>
  );
}

function SignInHandler({ children }: { children: React.ReactNode }) {
  const { setFid, setUsername } = useFarcaster(); // Use the context here

  return (
    <>
      <SignInButton
        onSuccess={({ fid, username }) => {
          if (!fid || !username) return;
          setFid(fid?.toString());
          setUsername(username);
        }}
      />
      {children}
    </>
  );
}
