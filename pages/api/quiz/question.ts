import type { NextApiRequest, NextApiResponse } from "next";
import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import {
  createSubmission,
  getQuestion,
  getQuestions,
} from "@/middleware/supabase";
import { IAnswerEntry, IQuestion, ISubmission } from "@/app/types/types";
import { validateMessage } from "@/middleware/farcaster";
import { getElapsedTimeString } from "@/middleware/helpers";

const HUB_URL = process.env["HUB_URL"];
const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;

async function sendResults(
  res: NextApiResponse,
  percentage: number,
  quizId: string,
  elapsedTime: string,
  progress: string
) {
  const imageUrl = `${process.env["HOST"]}/api/quiz/image-question?text=${
    "You scored " + percentage + " percent correct"
  }&time=${elapsedTime}&progress=${progress}`;
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
              <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/quiz/question?quiz_id=${quizId}">
  }">
              <meta name="fc:frame:button:1" content="Done">
            </head>
            <body>
              <p>You scored ${percentage}%</p>
            </body>
          </html>
        `);
}

async function skipQuestionResponse(
  previousAnswer: IAnswerEntry,
  question: IQuestion,
  quizId: string,
  progress: string,
  elapsedTime: string,
  res: NextApiResponse
) {
  console.log(`skipping question response`)
  const text = `Question ${question.text}: you answered ${previousAnswer.isCorrect ? "correctly" : "incorrectly"}`;
  const imageUrl = `${process.env["HOST"]}/api/quiz/image-question?text=${text}&time=${elapsedTime}&progress=${progress}`;
  const nextQuestionLink = `${process.env["HOST"]}/api/quiz/question?quiz_id=${quizId}&question_id=${question.next_question_id}`;
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vote Recorded</title>
            <meta property="og:title" content="Vote Recorded">
            <meta property="og:image" content="${imageUrl}">
            <meta name="fc:frame:image" content="${imageUrl}">
            <meta name="fc:frame" content="vNext">
            <meta name="fc:frame:post_url" content="${nextQuestionLink}">
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
      const { fid } = await validateMessage(req, res, client);

      if (!quizId) {
        return res.status(400).send("Missing quiz_id");
      }

      let submission: ISubmission | undefined = await createSubmission(
        quizId,
        fid.toString() || ""
      );

      if (!submission) {
        return res.status(404).send("submission not found");
      }
      const elapsedTime = getElapsedTimeString(
        submission.created_at,
        submission.time_completed
      );

      const questions = await getQuestions(quizId);
      if (!questions || questions.length === 0) {
        return res.status(404).send("No questions found");
      }
      const progress =
        (submission.answers ? submission.answers.length : 0) +
        1 +
        `/` +
        questions.length;

      // if already completed, return results
      if (submission && submission.score) {
        sendResults(res, submission.score, quizId, elapsedTime, progress);
        return;
      }

      const question = await getQuestion(quizId, questionId);

      // completed all questions
      if (!question) {
        if (!submission.score) {
          return res.status(500).send("Error fetching questions");
        }
        sendResults(res, submission.score, quizId, elapsedTime, progress);
        return;
      }

      // check if question has already been completed in submission
      const previousAnswer = submission.answers
        ? submission.answers.find((a) => a.question_id === questionId) || null
        : null;
      if (submission.answers && previousAnswer) {
        console.log(`skipping question response because already answered`)
        console.log(previousAnswer)
        skipQuestionResponse(
          previousAnswer,
          question,
          quizId,
          progress,
          elapsedTime,
          res
        );
        return
      }

      console.log(`should not get here on repeat`)

      // send question
      const imageUrl = `${process.env["HOST"]}/api/quiz/image-question?text=${question.text}&time=${elapsedTime}&progress=${progress}`;
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
                      process.env["HOST"]
                    }/api/quiz/answer?quiz_id=${quizId}&question_id=${
        question.id
      }">
                    <meta name="fc:frame:button:1" content="${
                      question.option_1
                    }">
                    <meta name="fc:frame:button:2" content="${
                      question.option_2
                    }">
                    ${
                      question.option_3
                        ? `<meta name="fc:frame:button:3" content="${question.option_3}">`
                        : ""
                    }
                    ${
                      question.option_4
                        ? `<meta name="fc:frame:button:4" content="${question.option_4}">`
                        : ""
                    }
                  </head>
                  <body>
                    <p>${question.text}</p>
                  </body>
                </html>
              `);

      // IF no next_question_id, then return the results
      // if (!question.next_question_id) {
      //   // calculate percentage correct
      //   if (
      //     !submission ||
      //     !submission.answers ||
      //     submission.answers.length === 0
      //   ) {
      //     throw new Error("Submission not found");
      //   }
      //   const percentage = Math.round(
      //     (submission.answers.filter((answer) => answer.isCorrect).length /
      //       submission.answers.length) *
      //       100
      //   );
      //   // update submission score with percentage
      //   try {
      //     submission = await updateSubmissionScore(submission.id, percentage);
      //   } catch (error) {
      //     console.error("Error updating submission score", error);
      //     return res.status(500).send("Error updating submission score");
      //   }
      //   sendResults(res, percentage, quizId, elapsedTime, progress);
      //   return;
      // }
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
