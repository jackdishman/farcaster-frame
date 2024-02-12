import type { NextApiRequest, NextApiResponse } from "next";
import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import {
  createSubmission,
  getQuestion,
  updateSubmission,
} from "@/middleware/supabase";
import { ISubmission, IQuestion } from "@/app/types/types";
import { validateMessage } from "@/middleware/farcaster";

const HUB_URL = process.env["HUB_URL"];
const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;

function sendResponse(
  isCorrect: boolean,
  res: NextApiResponse,
  quizId: string,
  currentQuestion: IQuestion
) {
  //   get next question
  const nextQuestionLink = `${process.env["HOST"]}/api/quiz/question?quiz_id=${quizId}&question_id=${currentQuestion.next_question_id}`;
  const resultsLink = `${process.env["HOST"]}/api/quiz/results?quiz_id=${quizId}`;
  const imageUrl = `${process.env["HOST"]}/api/quiz/image-result?correct=${isCorrect}&explanation=${currentQuestion.explanation}`;
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
            <meta name="fc:frame:post_url" content="${
              currentQuestion.next_question_id ? nextQuestionLink : resultsLink
            }">
            <meta name="fc:frame:button:1" content="Next question">
            </head>
            <body>
            <p></p>
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
      const questionId = req.query["question_id"] as string;

      // validate message
      const { fid, buttonId, inputText } = await validateMessage(
        req,
        res,
        client
      );

      if (!quizId) {
        return res.status(400).send("Missing quiz_id");
      }
      //   get submissions
      let submission: ISubmission | undefined = await createSubmission(
        quizId,
        fid.toString() || ""
      );

      //   get question
      const currentQuestion = await getQuestion(quizId, questionId);
      if (!currentQuestion) {
        return res.status(404).send("Question not found");
      }

      //   check if question is already answered
      if (submission && submission.answers) {
        const previousAnswer = submission.answers.find(
          (a) => a.question_id === questionId
        );
        if (previousAnswer) {
          sendResponse(previousAnswer.isCorrect, res, quizId, currentQuestion);
          return;
        }
      }

      // check if answer is correct
      let isCorrect = false;
      //   handle multiple choice
      if (currentQuestion.answer === `option_${buttonId}`) {
        isCorrect = true;
      }
      // handle text input
      if (
        currentQuestion.answer.toUpperCase().trim() ===
        inputText.toUpperCase().trim()
      ) {
        isCorrect = true;
      }

      // update submission entry
      console.log(`isCorrect`, isCorrect);
      try {
        if (!submission) {
          throw new Error("Submission not found");
        }
        submission = await updateSubmission(
          fid.toString(),
          submission,
          questionId,
          inputText,
          isCorrect
        );
      } catch (error) {
        console.error("Error updating submission", error);
        return res.status(500).send("Error updating submission");
      }
      try {
        if (!submission) {
          res.status(500).send("No submission found");
        }
        // send next question
        sendResponse(isCorrect, res, quizId, currentQuestion);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error checking previously answered");
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