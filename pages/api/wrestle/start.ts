import type { NextApiRequest, NextApiResponse } from "next";
import { validateMessage } from "@/middleware/farcaster";

async function sendResults(
  res: NextApiResponse
) {
  const imageUrl = `${process.env["HOST"]}/wrestle.jpeg`;
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Vote Recorded</title>
              <meta name="fc:frame" content="vNext">
              <meta property="og:title" content="Vote Recorded">
              <meta property="og:image" content="${imageUrl}">
              <meta name="fc:frame:image" content="${imageUrl}">

              <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/lobby">
              <meta name="fc:frame:button:1" content="Accept Challenge">
  
              </head>
            <body>
              <p>Challenge a wrestler</p>
            </body>
          </html>
        `);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // validate message
      const { fid } = await validateMessage(req, res);
        await sendResults(res);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error generating image");
    }
  } else {
    // Handle any non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
