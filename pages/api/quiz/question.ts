import type { NextApiRequest, NextApiResponse } from 'next';
import {getSSLHubRpcClient, Message} from "@farcaster/hub-nodejs";

const HUB_URL = process.env['HUB_URL']
const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const quizId = req.query['quiz_id']
            const questionId = req.query['question_id']
            const answer = req.body['answer']
            console.log(`req query`, req.query)
            console.log(`req body`, req.body)
            // if (!quizId || !questionId || !answer) {
            //     return res.status(400).send('Missing quiz data');
            // }
            // validate message
            let validatedMessage : Message | undefined = undefined;
            try {
                const frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
                const result = await client?.validateMessage(frameMessage);
                console.log(`validateMessage result` ,result)
                if (result && result.isOk() && result.value.valid) {
                    validatedMessage = result.value.message;
                }
                // Also validate the frame url matches the expected url
                let urlBuffer = validatedMessage?.data?.frameActionBody?.url || [];
                const urlString = Buffer.from(urlBuffer).toString('utf-8');
                if (validatedMessage && !urlString.startsWith(process.env['HOST'] || '')) {
                    return res.status(400).send(`Invalid frame url: ${urlBuffer}`);
                }
            } catch (e)  {
                return res.status(400).send(`Failed to validate message: ${e}`);
            }

            // If HUB_URL is not provided, don't validate and fall back to untrusted data
            let fid = 0, buttonId = 0;
            if (client) {
                buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
                fid = validatedMessage?.data?.fid || 0;
            } else {
                fid = req.body?.untrustedData?.fid || 0;
                buttonId = req.body?.untrustedData?.buttonIndex || 0;
            }

            console.log(fid, buttonId, quizId, questionId, answer)

            // check if answer is correct
            // let { data, error } = await supabase.from("question").select("*").eq('id', questionId);
            // if (error) {
            //     console.error("Error fetching question", error);
            //     return res.status(500).send('Error fetching question');
            // }

            // Create a new submission if none exists
            // { data, error } = await supabase.from("submission").select("*").eq('fid', fid).eq('quiz_id', quizId);
            // if (error) {
            //     console.error("Error fetching submissions", error);
            //     return res.status(500).send('Error fetching submissions');
            // }
            // if (data.length === 0) {
            //     const { data, error } = await supabase.from("submission").insert([{fid, quiz_id: quizId}]);
            //     if (error) {
            //         console.error("Error creating submission", error);
            //         return res.status(500).send('Error creating submission');
            //     }
            // }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error generating image');
        }
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
