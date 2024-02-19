import type { NextApiRequest, NextApiResponse } from "next";
import { validateMessage } from "@/middleware/farcaster";
import { getChallenges } from "@/middleware/wrestle.ts";
import { IMatch } from "@/app/types/wrestle";

async function acceptChallenge(res: NextApiResponse, matches: IMatch[]) {
  const imageUrl = `${process.env["HOST"]}/api/wrestle/accept-challenge-image?challenger_fname=${matches[0].challenger_fname}`;
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

              <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/wrestle/accept?matchId=${matches[0].id}">
              <meta name="fc:frame:button:1" content="Accept Challenge">
  
              </head>
            <body>
              <p>Challenge a wrestler</p>
            </body>
          </html>
        `);
}

async function sendRequestForm(res: NextApiResponse) {
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

              <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/wrestle/send-challenge">
              <meta name="fc:frame:input:text" content="Enter username (ex: @dish)">

              <meta name="fc:frame:button:1" content="Challenge">
                
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
      
      //check for challenges
      const allMatches = await getChallenges(fid);
      if(!allMatches || allMatches.length === 0){
        console.log(`no challenges at all`)
        await sendRequestForm(res);
        return
      }
      const matches = allMatches.filter((match: IMatch) => match.opponent_start_time === null);
      console.log(`matches`, matches);
      if(!matches || matches.length === 0){
        // no challenges
        console.log(`no challenges incomplete`)
        await sendRequestForm(res);
        return
      }
      // if there are challenges that are not completed:
      // view challenges
      await acceptChallenge(res, matches);
      
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
