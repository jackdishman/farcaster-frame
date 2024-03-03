import type { NextApiRequest, NextApiResponse } from "next";
import { validateMessage } from "@/middleware/farcaster";

async function sendResults(res: NextApiResponse, fid: string, quizId: string) {
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/quiz/image-leaderboard?fid=${fid}&quiz_id=${quizId}`;
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Vote Recorded</title>
              <meta property="og:title" content="Vote Recorded">
              <meta property="og:image" content="${imageUrl}">
              <meta name="fc:frame" content="vNext">
              <meta name="fc:frame:image" content="${imageUrl}">

              <meta property="fc:frame:button:1" content="Give feedback" />
              <meta property="fc:frame:button:1:action" content="link" />
              <meta property="fc:frame:button:1:target" content="https://warpcast.com/dish" />  

              <meta property="fc:frame:button:2" content="Source Code" />
              <meta property="fc:frame:button:2:action" content="link" />
              <meta property="fc:frame:button:2:target" content="https://github.com/jackdishman/farcaster-frame" />  

              <meta property="fc:frame:button:3" content="Create Quiz & Stats" />
              <meta property="fc:frame:button:3:action" content="link" />
              <meta property="fc:frame:button:3:target" content="${process.env.NEXT_PUBLIC_HOST}/quiz" />

              </head>
            <body>
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
      const quizId = req.query["quiz_id"] as string;
      // validate message
      const { fid } = await validateMessage(req, res);
      if (!quizId) {
        return res.status(400).send("Missing quiz_id");
      }
      await sendResults(res, fid.toString(), quizId);
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
