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
    const isCorrect = req.query["correct"] as string;
    const explanation = req.query["explanation"] as string;
    const time = req.query["time"] as string;
    const progress = req.query["progress"] as string;

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
            padding: 0,
          }}
        >
          <p
            style={{
              color: `#fff`,
            }}
          >
            {progress}
          </p>
          <p
            style={{
              color: `#fff`,
            }}
          >
            {time}
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
              padding: 0,
              justifyContent: "center",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                color: isCorrect === "true" ? "#0f0" : "#f00",
                fontSize: 50,
                paddingLeft: "40%",
                textTransform: "uppercase",
              }}
            >
              {isCorrect}
            </h2>
            <h2 style={{ textAlign: "center", color: "#fff", fontSize: 20 }}>
              {explanation}
            </h2>
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
