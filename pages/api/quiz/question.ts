import type { NextApiRequest, NextApiResponse } from "next";
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import {
  createSubmission,
  getQuestion,
  getQuestions,
  updateSubmission,
} from "@/helpers";
import { ISubmission } from "@/app/types/types";

const HUB_URL = process.env["HUB_URL"];
const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const quizId = req.query["quiz_id"] as string;
      const questionId = req.query["question_id"] as string;

      // validate message
      let validatedMessage: Message | undefined = undefined;
      try {
        const frameMessage = Message.decode(
          Buffer.from(req.body?.trustedData?.messageBytes || "", "hex")
        );
        const result = await client?.validateMessage(frameMessage);
        if (result && result.isOk() && result.value.valid) {
          validatedMessage = result.value.message;
        }
        // Also validate the frame url matches the expected url
        let urlBuffer = validatedMessage?.data?.frameActionBody?.url || [];
        const urlString = Buffer.from(urlBuffer).toString("utf-8");
        if (
          validatedMessage &&
          !urlString.startsWith(process.env["HOST"] || "")
        ) {
          return res.status(400).send(`Invalid frame url: ${urlBuffer}`);
        }
      } catch (e) {
        return res.status(400).send(`Failed to validate message: ${e}`);
      }

      // If HUB_URL is not provided, don't validate and fall back to untrusted data
      let fid = 0,
        buttonId = 0,
        inputText = "";
      if (client) {
        buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
        fid = validatedMessage?.data?.fid || 0;
        inputText = Buffer.from(
          validatedMessage?.data?.frameActionBody?.inputText || []
        ).toString("utf-8");
      } else {
        fid = req.body?.untrustedData?.fid || 0;
        buttonId = req.body?.untrustedData?.buttonIndex || 0;
        inputText = req.body?.untrustedData?.inputText || "";
      }
      console.log(`fid`, fid);
      console.log(`input text`, inputText);

      if (!quizId) {
        return res.status(400).send("Missing quiz_id");
      }

      // IF no questionId, then send the first question and create a new submission entry (if does not exist)
      let submission: ISubmission | undefined = await createSubmission(
        quizId,
        req.body?.untrustedData?.fid || ""
      );
      if (!questionId) {
        // get first question
        const questions = await getQuestions(quizId);
        if (!questions || questions.length === 0) {
          return res.status(404).send("No questions found");
        }
        const question = questions[0];
        const imageUrl = `${process.env["HOST"]}/api/quiz/image-question?text=${question.text}`;
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
                    }/api/quiz/question?quiz_id=${quizId}&question_id=${
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
        return;
      }

      //   get question
      const currentQuestion = await getQuestion(quizId, questionId);
      if (!currentQuestion) {
        return res.status(404).send("Question not found");
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

      // IF no next_question_id, then return the results
      if (!currentQuestion.next_question_id) {
        // TODO: return results
        return res.status(200).send("No more questions found");
      }

      // send next question
      try {
        // get next question
        const nextQuestion = await getQuestion(
          quizId,
          currentQuestion.next_question_id
        );
        if (!nextQuestion) {
          return res.status(404).send("No more questions found");
        }
        const imageUrl = `${process.env["HOST"]}/api/quiz/image-question?text=${nextQuestion.text}`;
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
                    }/api/quiz/question?quiz_id=${quizId}&question_id=${
          nextQuestion.id
        }">
                    <meta name="fc:frame:button:1" content="${
                      nextQuestion.option_1
                    }">
                    <meta name="fc:frame:button:2" content="${
                      nextQuestion.option_2
                    }">
                    ${
                      nextQuestion.option_3
                        ? `<meta name="fc:frame:button:3" content="${nextQuestion.option_3}">`
                        : ""
                    }
                    ${
                      nextQuestion.option_4
                        ? `<meta name="fc:frame:button:4" content="${nextQuestion.option_4}">`
                        : ""
                    }
                  </head>
                  <body>
                    <p>${nextQuestion.text}</p>
                  </body>
                </html>
              `);
        return;
      } catch (error) {
        console.error(error);
        res.status(500).send("Error generating image");
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
