import type { NextApiRequest, NextApiResponse } from "next";
import { validateMessage } from "@/middleware/farcaster";
import { getChallengeById, getChallenges, startOpponentWrestle } from "@/middleware/wrestle.ts";
import { IMatch } from "@/types/wrestle";

async function acceptChallenge(res: NextApiResponse, matchId: number) {
  
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
    const { matchId } = req.query;
    try {
      // validate message
      const { fid } = await validateMessage(req, res);

    // get match and validate
    const match = await getChallengeById(Number(matchId));

    if(!match) {
      res.status(500).send("Error finding match");
      return
    }
    // check if the match is for the user
    if (fid !== Number(match.opponent_fid)) {
      res.status(403).send("You are not part of this match");
      return;
    }
    await startOpponentWrestle(match.id);
    await acceptChallenge(res, match.id);
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
