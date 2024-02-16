import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { getSubmissions } from "@/middleware/supabase";
import { getFarcasterUsernames } from "@/middleware/airstack";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const quizId = req.query["quiz_id"] as string;
  const fid = req.query["fid"] as string;
  try {
    // get quiz submissions
    const submissions = await getSubmissions(quizId);
    if (!submissions) {
      res.status(200).send("No submissions yet");
      return;
    }
    // get top 5 submissions
    let svg;
    const topSubmissionsFidList = submissions.slice(0, 5).map((s) => s.fid);
    console.log(`topSubmissionsFidList`, topSubmissionsFidList)

    // nobody has answered yet
    if(topSubmissionsFidList.length === 0) {
        svg = await satori(
            <div
                style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#111",
                padding: 10,
                lineHeight: 1.2,
                fontSize: 24,
                display: "flex",
                flexDirection: "column",
                }}
            >
                <p
                style={{
                    color: `#fff`,
                }}
                >
                No submissions yet
                </p>
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
    } else {
        const usernameList = await getFarcasterUsernames(topSubmissionsFidList);
        console.log(`usernameList with and painting leaderboard`, usernameList)
        svg = await satori(
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#111",
              padding: 10,
              lineHeight: 1.2,
              fontSize: 24,
              display: "flex",
              flexDirection: "column",
            }}
          >
              <p
                style={{
                  color: `#fff`,
                }}
              >
                Top 5 Submissions
              </p>
              <p
                style={{
                  color: `#fff`,
                }}
              >
                {/* display the top submission fids */}
                <ol>
                    {usernameList.map((u: string) => {
                        return <li key={u}>{u}</li>;
                    })}
                </ol>
              </p>
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
    
    }

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
