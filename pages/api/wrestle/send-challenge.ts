import type { NextApiRequest, NextApiResponse } from "next";
import { validateMessage } from "@/middleware/farcaster";
import { createChallenge } from "@/middleware/wrestle.ts";
import { getFnameByFid, getFidByFname } from "@/middleware/airstack";

async function sendChallengeRequest(res: NextApiResponse, matchId: number) {
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/wrestle.jpeg`;
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

              <meta name="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/wrestle/push?matchId=${matchId}">
              <meta name="fc:frame:button:1" content="WRESTLE 💪">
            
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
      const { fid, inputText } = await validateMessage(req, res);

      //   get fname from fid
      const challenger_fname = await getFnameByFid(fid.toString());

      // validate opponent and get opponent fid
      const opponent_fname = inputText.replace("@", "").trim();
      const opponent_fid = await getFidByFname(opponent_fname);

      // add to db
      const match = await createChallenge(
        fid,
        challenger_fname,
        opponent_fid,
        opponent_fname
      );

      if(!match || match.length === 0) {
        res.status(500).send("Error finding match");
        return
      } 

      await sendChallengeRequest(res, match[0].id);
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
