import { validateMessage } from "@/middleware/farcaster";
import type { NextApiRequest, NextApiResponse } from "next";

async function sendChart(res: NextApiResponse, fid: string) {
    const imageUrl = `${process.env["HOST"]}/api/followers/graph-image?fid=${fid}`;
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Generate a Graph</title>
                <meta name="fc:frame" content="vNext">
                <meta property="og:title" content="Generate a Graph">
                <meta property="og:image" content="${imageUrl}">
                <meta name="fc:frame:image" content="${imageUrl}">

                <meta property="fc:frame:button:1" content="View Graph" />
                <meta property="fc:frame:button:1:action" content="link" />
                <meta property="fc:frame:button:1:target" content="${process.env.HOST}/followers/${fid}" />  
      
                </head>
              <body>
                <p>Challenge a wrestler</p>
              </body>
            </html>
          `);
      
}

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
 if (req.method === "POST") {
    try {
        const vRes = await validateMessage(req, res);
        const fid = vRes?.fid.toString();

        await sendChart(res, fid);
    
    } catch (error) {
        console.error("Error fetching followers", error);
        return null;
    }
    } else {
        res.status(405).send("Method not allowed");
    }
}