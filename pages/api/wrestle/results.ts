import type { NextApiRequest, NextApiResponse } from "next";
import { validateMessage } from "@/middleware/farcaster";
import { getChallengeById, updateChallenge } from "@/middleware/wrestle.ts";

async function sendPendingOpponent(
    res: NextApiResponse,
    opponent_fname: string,
    challenger_fname: string
    ) {
    const imageUrl = `${process.env["HOST"]}/api/wrestle/pending-opponent?opponent_fname=${opponent_fname}&challenger_fname=${challenger_fname}`;
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

        <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/wrestle/completed-matches">
        <meta name="fc:frame:button:1" content="Completed Matches">

        </head>
      <body>
        <p>Challenge a wrestler</p>
      </body>
    </html>
  `);
  }

  async function sendResults(
    res: NextApiResponse,
    matchId: string,
    opponent_fname: string,
    challenger_fname: string,
    opponent_score: number,
    challenger_score: number,
  ) {
    // show winner or loser image
    const imageUrl = `${process.env["HOST"]}/api/wrestle/final-results-image?opponent_fname=${opponent_fname}&challenger_fname=${challenger_fname}&opponent_score=${opponent_score}&challenger_score=${challenger_score}`;
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
  
        <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/wrestle/completed-matches">
        <meta name="fc:frame:button:1" content="Completed Matches">
      
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

      const match = await getChallengeById(Number(matchId));

      if (!match) {
        res.status(404).send("Match not found");
        return;
      }

    //   send results or say waiting on opponent
        if (match.opponent_score && match.challenger_score) {
            await sendResults(
            res,
            matchId as string,
            match.opponent_fname,
            match.challenger_fname,
            match.opponent_score,
            match.challenger_score,
            );
        } else {
            await sendPendingOpponent(
            res,
            match.opponent_fname,
            match.challenger_fname,
            );
        }

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
