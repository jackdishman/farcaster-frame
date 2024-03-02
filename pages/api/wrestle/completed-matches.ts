import type { NextApiRequest, NextApiResponse } from "next";
import { validateMessage } from "@/middleware/farcaster";

async function sendResults(res: NextApiResponse) {
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/wrestle/completed-matches-image`;
  console.log("image url", imageUrl);
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Wrestling Leaderboard</title>
              <meta property="og:title" content="arm wrestle leaderboard">
              <meta property="og:image" content="${imageUrl}">
              <meta name="fc:frame" content="vNext">
              <meta name="fc:frame:image" content="${imageUrl}">

              <meta name="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/wrestle/start">
              <meta name="fc:frame:button:1" content="Return">

              <meta property="fc:frame:button:2" content="Give feedback" />
              <meta property="fc:frame:button:2:action" content="link" />
              <meta property="fc:frame:button:2:target" content="https://warpcast.com/dish" />  

              </head>
            <body>
            </body>
          </html>
        `);
        return
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // validate message
    //   await validateMessage(req, res);
      await sendResults(res);
      return
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
