// import { getFollowers, upsertFollowers } from '@/middleware/caststats/supabase';
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {

    const imageUrl = `${process.env["HOST"]}/followers.png`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["HOST"]}/api/followers/graph`,
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": `Generate your Graph`,
  };

  return {
    title: "View graph of your followers",
    openGraph: {
      title: `Farcaster Followers`,
      description: `See a node-edge visualization of your followers on Farcaster.`,
      images: [{ url: imageUrl }],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["HOST"] || ""),
  };
}

export default async function Page() {
    return (
        <div>
            <h1 className="text-h1">Frame page to fetch followers of a Farcaster user (more coming soon)</h1>
        </div>
    )
}
