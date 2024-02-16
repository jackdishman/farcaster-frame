// import type { NextApiRequest, NextApiResponse } from "next";
// import { validateMessage } from "@/middleware/farcaster";
// import { getChallenges } from "@/middleware/wrestle.ts";

// async function sendChallengeRequest(
//   res: NextApiResponse,
//   matchId: number
// ) {
//   const imageUrl = `${process.env["HOST"]}/wrestle.jpeg`;
//   res.setHeader("Content-Type", "text/html");
//   res.status(200).send(`
//           <!DOCTYPE html>
//           <html>
//             <head>
//               <title>Vote Recorded</title>
//               <meta name="fc:frame" content="vNext">
//               <meta property="og:title" content="Vote Recorded">
//               <meta property="og:image" content="${imageUrl}">
//               <meta name="fc:frame:image" content="${imageUrl}">

//               <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/wrestle/accept?id=${matchId}">
//               <meta name="fc:frame:button:1" content="Accept Challenge">

//               <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/wrestle/reject?id=${matchId}">
//               <meta name="fc:frame:button:2" content="Reject Challenge">

//               <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/wrestle/propose?id=${matchId}">
//               <meta name="fc:frame:button:2" content="Propose New Challenge">
            
//               </head>
//             <body>
//               <p>Challenge a wrestler</p>
//             </body>
//           </html>
//         `);
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "POST") {
//     try {
//       // validate message
//       const { fid } = await validateMessage(req, res);

//         //check for challenges
//         const match = await getChallenges(fid);
//         console.log(match);

//         await sendChallengeRequest(res, fid);
//         return

//         if (match) {
//           // if there is a match, send challenge request
//         //   await sendChallengeRequest(res, fid);

//         } else {
//           // if there is no match, send the challenge
//           res.status(200).send(`
//           <!DOCTYPE html>
//           <html>
//             <head>
//               <title>Challenge a Wrestler</title>
//               <meta name="fc:frame" content="vNext">
//               <meta property="og:title" content="Challenge a Wrestler">
//               <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/wrestle/start">
//               <meta name="fc:frame:button:1" content="Challenge a Wrestler">
//             </head>
//             <body>
//               <p>Challenge a wrestler</p>
//             </body>
//           </html>
//         `);
//         }

//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Error generating image");
//     }
//   } else {
//     // Handle any non-POST requests
//     res.setHeader("Allow", ["POST"]);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
