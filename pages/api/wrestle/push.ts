import type { NextApiRequest, NextApiResponse } from "next";
import { validateMessage } from "@/middleware/farcaster";
import { getChallengeById, updateChallenge } from "@/middleware/wrestle.ts";

async function sendWrestle(
  res: NextApiResponse,
  matchId: string,
  opponent_fname: string,
  challenger_fname: string,
  opponent_score: number,
  challenger_score: number,
  created_at: string,
  opponent_start_time: string
) {

  let timeLeft = `30 seconds`;
  const MATCH_DURATION = 30 * 1000;
  const matchTime = opponent_start_time === null ? new Date(created_at).getTime() : new Date(opponent_start_time).getTime();
  console.log(`matchTime`, matchTime)
  const currentTime = new Date().getTime();
  const timeElapsed = currentTime - matchTime;
  const timeRemaining = MATCH_DURATION - timeElapsed;
  timeLeft = `${Math.floor(timeRemaining / 1000)} seconds`;
  console.log(`timeLeft`, timeLeft)

  // send results page if the match is over
  if (timeRemaining <= 0) {
    const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/wrestle.jpeg`;
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Match ended!</title>
        <meta name="fc:frame" content="vNext">
        <meta property="og:title" content="Vote Recorded">
        <meta property="og:image" content="${imageUrl}">
        <meta name="fc:frame:image" content="${imageUrl}">

        <meta name="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/wrestle/results?matchId=${matchId}">
        <meta name="fc:frame:button:1" content="DONE">
      
        </head>
      <body>
        <p>Challenge a wrestler</p>
      </body>
    </html>
  `);
    return;
  }

  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/wrestle/active-match?opponent_fname=${opponent_fname}&challenger_fname=${challenger_fname}&opponent_score=${opponent_score}&challenger_score=${challenger_score}&time_left=${timeLeft}`;
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
    const { matchId } = req.query;
    try {
      // validate message
      const { fid } = await validateMessage(req, res);
      const match = await getChallengeById(Number(matchId));

      if (!match) {
        res.status(404).send("Match not found");
        return;
      }

      let updatedMatch;
      // check who is playing (challenger or opponent)
      if (fid === Number(match.challenger_fid)) {
        // if the challenger is playing, send the challenge
        updatedMatch = await updateChallenge(match.id, match.challenger_score + 1, match.opponent_score);
      } else if (fid === Number(match.opponent_fid)) {
        // if the opponent is playing, send the challenge
        updatedMatch = await updateChallenge(match.id, match.challenger_score, match.opponent_score + 1);
      } else {
        res.status(403).send("You are not part of this match");
      }

      if (!updatedMatch) {
        res.status(500).send("Error updating match");
        return;
      }

      await sendWrestle(
        res,
        match.id.toString(),
        match.opponent_fname,
        match.challenger_fname,
        updatedMatch.opponent_score,
        updatedMatch.challenger_score,
        updatedMatch.created_at,
        updatedMatch.opponent_start_time
      );

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
