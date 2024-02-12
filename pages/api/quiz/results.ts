import type { NextApiRequest, NextApiResponse } from "next";
import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import {
  createSubmission,
  getQuestions,
  updateSubmissionScore,
} from "@/middleware/supabase";
import { ISubmission } from "@/app/types/types";
import { validateMessage } from "@/middleware/farcaster";
import { getElapsedTimeString } from "@/middleware/helpers";

const HUB_URL = process.env["HUB_URL"];
const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;

async function sendResults(
  res: NextApiResponse,
  percentage: number,
  quizId: string,
    elapsedTime: string
) {
  const imageUrl = `${process.env["HOST"]}/api/quiz/image-question?text=${
    "You scored " + percentage + " percent correct"
  }&time=${elapsedTime}`;
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Vote Recorded</title>
              <meta property="og:title" content="Vote Recorded">
              <meta property="og:image" content="${imageUrl}">
              <meta name="fc:frame" content="vNext">
              <meta name="fc:frame:image" content="${imageUrl}">
              <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/quiz/question?quiz_id=${quizId}&show_results=true">
  }">
              <meta name="fc:frame:button:1" content="Done">
            </head>
            <body>
              <p>You scored ${percentage}%</p>
              <p>Elapsed time: ${elapsedTime}</p>
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
      const quizId = req.query["quiz_id"] as string;

      // validate message
      const { fid } = await validateMessage(req, res, client);

      if (!quizId) {
        return res.status(400).send("Missing quiz_id");
      }

      let submission: ISubmission | undefined = await createSubmission(
        quizId,
        fid.toString() || ""
      );

      // if already completed, return results
      if (submission && submission.score) {
        const elapsedTime = getElapsedTimeString(submission.created_at, submission.time_completed);
        sendResults(res, submission.score, quizId, elapsedTime);
        return;
      }

      const questions = await getQuestions(quizId);
      if (!questions || questions.length === 0) {
        return res.status(404).send("No questions found");
      }

      // calculate percentage correct
      if (
        !submission ||
        !submission.answers ||
        submission.answers.length === 0
      ) {
        throw new Error("Submission not found");
      }
      const percentage = Math.round(
        (submission.answers.filter((answer) => answer.isCorrect).length /
          submission.answers.length) *
          100
      );
      // update submission score with percentage
      try {
        submission = await updateSubmissionScore(submission.id, percentage);
        if(!submission) res.status(500).send("Error updating submission score");
        } catch (error) {
        console.error("Error updating submission score", error);
        return res.status(500).send("Error updating submission score");
      } finally {
        const elapsedTime = submission ? getElapsedTimeString(submission.created_at, submission.time_completed) : `0:00`;
        sendResults(res, percentage, quizId, elapsedTime);

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
