import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { getCompletedMatches } from "@/middleware/wrestle.ts";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // get 10 matches to display
    const matches = await getCompletedMatches();

    const svg = await satori(
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#111",
          padding: 15,
          lineHeight: 1,
          fontSize: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {matches
          ? matches.map((match, index) => {
              return (
                <p
                  key={index}
                  style={{
                    color: `#fff`,
                    padding: 0,
                  }}
                >
                  {match.opponent_fname}: {match.opponent_score} vs{" "}
                  {match.challenger_fname}: {match.challenger_score}
                </p>
              );
            })
          : "No matches found"}
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
