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
    // nobody has answered yet
    if(submissions.length === 0) {
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
      const topSubmissionsFidList = submissions.slice(0, 5).map((s) => s.fid);
      const topPlayerScores: { fid: string | null; score: number | null, fname: string }[] = [];
      const usernameList = await getFarcasterUsernames(topSubmissionsFidList);
      // combine usernameList with topSubmissionsFidList into topPlayerScores
      topSubmissionsFidList.forEach((fid, index) => {
        topPlayerScores.push({fid, score: submissions[index].score, fname: usernameList[index]});
      }
      );
      console.log(topPlayerScores);

        svg = await satori(
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#111",
              padding: 40,
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
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                }}>
                    {topPlayerScores.map((s, index) => {
                        return (
                            <p key={index}>{s.fname} - {s.score}</p>
                        );
                    }
                    )}
                </div>
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
