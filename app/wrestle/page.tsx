import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(): Promise<Metadata> {

    const imageUrl = `${process.env["HOST"]}/wrestle.jpeg`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["HOST"]}/api/wrestle/start`,
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": `Wrestle`,
  };

  return {
    title: "Wrestle Someone",
    openGraph: {
      title: `Farcaster Wrestle`,
      description: `Challenge a farcaster or accept a challenge`,
      images: [{ url: imageUrl }],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["HOST"] || ""),
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-2xl">WRESTLE PAGE</h1>
        <img
          src={
            process.env[`HOST`] +
            `/wrestle.jpeg`
          }
        />
      </main>
    </div>
  );
}
