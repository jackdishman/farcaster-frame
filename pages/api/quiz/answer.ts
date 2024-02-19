import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSubmission,
  getQuestion,
  getQuestions,
  updateSubmission,
} from "@/middleware/supabase";
import { ISubmission, IQuestion } from "@/app/types/types";
import { validateMessage } from "@/middleware/farcaster";
import { getElapsedTimeString } from "@/middleware/helpers";

function sendResponse(
  isCorrect: boolean,
  res: NextApiResponse,
  quizId: string,
  currentQuestion: IQuestion,
  elapsedTime: string,
  progress: string
) {
  //   get next question
  const nextQuestionLink = `${process.env["HOST"]}/api/quiz/question?quiz_id=${quizId}&question_id=${currentQuestion.next_question_id}`;
  const resultsLink = `${process.env["HOST"]}/api/quiz/results?quiz_id=${quizId}`;
  const imageUrl = `${process.env["HOST"]}/api/quiz/image-result?correct=${isCorrect}&explanation=${currentQuestion.explanation}&time=${elapsedTime}&progress=${progress}`;
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
        res
      );

      if (!quizId) {
        return res.status(400).send("Missing quiz_id");
      }
      //   get submissions
      let submission: ISubmission | undefined = await createSubmission(
        quizId,
        fid.toString() || ""
      );

      if(!submission) {
        return res.status(500).send("Error creating submission");
      }

      const elapsedTimeString = getElapsedTimeString(submission?.created_at, submission?.time_completed);

      //   get question
      console.log(`pre currentQuestion `, quizId, questionId)
      const currentQuestion = await getQuestion(quizId, questionId);
      console.log(`currentQuestion`, currentQuestion)
      if (!currentQuestion) {
        return res.status(404).send("Question not found");
      }

      // get quiz length
      const questions = await getQuestions(quizId);
      if (!questions) {
        return res.status(500).send("Error fetching questions");
      }

      console.log(`findIndex`, questions.findIndex((q) => q.id === questionId))

      const progress = (submission.answers ? submission.answers.length : 0) + 1 + `/` + questions.length

      //   check if question is already answered
      if (submission && submission.answers) {
        const previousAnswer = submission.answers.find(
          (a) => a.question_id === questionId
        );
        if (previousAnswer) {
          sendResponse(previousAnswer.isCorrect, res, quizId, currentQuestion, elapsedTimeString, progress);
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
        sendResponse(isCorrect, res, quizId, currentQuestion, elapsedTimeString, progress);
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
