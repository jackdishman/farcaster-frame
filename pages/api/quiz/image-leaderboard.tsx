import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { getSubmissions } from "@/middleware/supabase";

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
    const topSubmissions = submissions.slice(0, 5);

    const svg = await satori(
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
        {/* top header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 10,
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
              {topSubmissions.map((s, i) => {
                return <li key={i}>{s.fid}</li>;
              })}
            </ol>
          </p>
        </div>
        {/* question */}
        <div
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            display: "flex",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 20,
            }}
          >
            {/* <h2 style={{ textAlign: "center", color: "#fff" }}>You placed {text}</h2> */}
          </div>
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
