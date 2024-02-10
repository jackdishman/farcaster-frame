import type { NextApiRequest, NextApiResponse } from 'next';
import {getSSLHubRpcClient, Message} from "@farcaster/hub-nodejs";
import { createSubmission, getQuestions } from '@/helpers';
import { ISubmission } from '@/app/types/types';

const HUB_URL = process.env['HUB_URL']
const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const quizId = req.query['quiz_id'] as string
            const questionId = req.query['question_id']

            if(!quizId) {
                return res.status(400).send('Missing quiz_id');
            }

            // IF no questionId, then send the first question and create a new submission entry (if does not exist)
            let submission:ISubmission | undefined = undefined;
            if(!questionId) {
                submission = await createSubmission(quizId, req.body?.untrustedData?.fid || '');
                console.log(`submission`, submission)
                // get first question
                const questions = await getQuestions(quizId);
                if (!questions || questions.length === 0) {
                    return res.status(404).send('No questions found');
                }
                const question = questions[0];
                const imageUrl = `${process.env['HOST']}/api/quiz/image-question?text=${question.text}`;
                res.setHeader('Content-Type', 'text/html');
                res.status(200).send(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Vote Recorded</title>
                    <meta property="og:title" content="Vote Recorded">
                    <meta property="og:image" content="${imageUrl}">
                    <meta name="fc:frame" content="vNext">
                    <meta name="fc:frame:image" content="${imageUrl}">
                    <meta name="fc:frame:post_url" content="${process.env['HOST']}/api/quiz/question?quiz_id=${quizId}&question_id=${question.id}">
                    <meta name="fc:frame:button:1" content="${question.option_1}">
                    <meta name="fc:frame:button:2" content="${question.option_2}">
                    ${question.option_3 ? `<meta name="fc:frame:button:3" content="${question.option_3}">` : ''}
                    ${question.option_4 ? `<meta name="fc:frame:button:4" content="${question.option_4}">` : ''}
                  </head>
                  <body>
                    <p>${question.text}</p>
                  </body>
                </html>
              `);
              return;
            }

            // get next question and update submission entry

            const questions = await getQuestions(quizId);
            if (!questions || questions.length === 0) {
                return res.status(404).send('No questions found');
            }
            const question = questions[0];
            // IF questionId, then check if the answer is correct and update the submission entry

            console.log(`req query`, req.query)
            console.log(`req body`, req.body)
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
