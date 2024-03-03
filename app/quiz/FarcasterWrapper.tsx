"use client";

import "@farcaster/auth-kit/styles.css";
import React from "react";
import { AuthKitProvider, SignInButton } from "@farcaster/auth-kit";
import { FarcasterProvider, useFarcaster } from "./FarcasterContext"; // Ensure the import is correct
import Link from "next/link";

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
  const { setFid, setUsername } = useFarcaster();

  return (
    <>
      <header className="sticky top-0">
        <Link
          href={process.env["NEXT_PUBLIC_HOST"] + `/quiz`}
          className="text-2xl font-sans font-bold absolute top-0 left-0 m-5 cursor-pointer underline-offset-4 text-[#7c65c1] hover:underline hover:underline-offset-5"
        >
          Farcaster Quiz Frame Builder & Explorer
        </Link>
        <div className="absolute top-0 right-0 m-5">
          <SignInButton
            onSuccess={({ fid, username }) => {
              if (!fid || !username) return;
              setFid(fid?.toString());
              setUsername(username);
            }}
          />
        </div>
      </header>
      <main className="pt-16">{children}</main>
    </>
  );
}
