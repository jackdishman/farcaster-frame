"use client";

import "@farcaster/auth-kit/styles.css";
import React from "react";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { SignInButton } from "@farcaster/auth-kit";
import { useProfile } from "@farcaster/auth-kit";

console.log(process.env.NEXT_PUBLIC_HOST);

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
    <AuthKitProvider config={config}>
      <SignInButton
        onSuccess={({ fid, username }) =>
          console.log(`Hello, ${username}! Your fid is ${fid}.`)
        }
      />
      {children}
    </AuthKitProvider>
  );
}
