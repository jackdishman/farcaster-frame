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
    const opponent_score = req.query["opponent_score"];
    const challenger_score = req.query["challenger_score"];
    const timeLeft = req.query["time_left"];
    
    
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
            {opponent_fname}
          </p>
          <p
            style={{
              color: `#fff`,
            }}
          >
            {challenger_fname}
          </p>
        </div>
        <div
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            display: "flex",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 20,
            }}
          >
            <h2 style={{ textAlign: "center", color: "#fff" }}>{opponent_score}</h2>
            <img src={`${process.env.NEXT_PUBLIC_HOST}/wrestle.jpeg`} style={{width: "120px", height: "auto"}} />
            <h2 style={{ textAlign: "center", color: "#fff" }}>{challenger_score}</h2>
          </div>
        </div>
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
            {timeLeft}
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
