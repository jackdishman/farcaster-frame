import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const opponent_fname = req.query["opponent_fname"];
    const challenger_fname = req.query["challenger_fname"];
    const opponent_score = req.query["opponent_score"] as string;
    const challenger_score = req.query["challenger_score"] as string;
    
    const winner = Number(challenger_score) > Number(opponent_score) ? challenger_fname : opponent_fname;
    
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
                {winner} wins!
            </p>
        </div>
        {/* directions */}
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
                Reply to let them know.
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
