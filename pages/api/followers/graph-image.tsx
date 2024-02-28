import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { getFollowersStats } from "@/middleware/caststats";
import { addFollowersEntry, getFollowers, updateFollowersEntry } from "@/middleware/caststats/supabase";
import { IFollower } from "@/types/followers";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const fid = req.query["fid"] as string;
    const followers:IFollower[] = [];

    // check to see if already have followers
    const followerRes = await getFollowers(fid);
    if(followerRes?.updated && followerRes?.followers !== null) {
        console.log(`using followers from db`)
        followers.push(...followerRes.followers);
    } else {
        // fetch followers from Farcaster
        const stats = await getFollowersStats(fid);
        console.log(`fetch followers from farcaster`)
        followers.push(...stats);
        // update if already has followers
        if(followerRes?.followers !== null){
            console.log(`update if already has followers`)
            await updateFollowersEntry(fid, stats);
        } else {
            // add new entry
            console.log(`add new entry`)
            await addFollowersEntry(fid, stats);
        }
    }

    followers.sort((a, b) => b.followerCount - a.followerCount);
        // Calculate the total number of followers
        const totalFollowers = followers.reduce((acc, follower) => acc + follower.followerCount, 0);
        console.log(totalFollowers);
    

    const svg = await satori(
        <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#111",
          padding: 25,
          lineHeight: 2,
          fontSize: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* status */}
        <div
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            display: "flex",
            padding: 20,
          }}
        >
            <p
                style={{
                color: `#fff`,
                padding: 10,
                }}
            >
                Total follower power: {totalFollowers}
            </p>
        </div>
      </div>,
      {
        width: 600,
        height: 400,
        fonts: [
          {
            data: fontData,
            name: "Roboto",
            style: "normal",
            weight: 400,
          },
        ],
      }
    );

    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

    // Set the content type to PNG and send the response
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "max-age=10");
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating image");
  }
}
