import { uploadQuiz } from "@/middleware/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { quiz, questions } = req.body;
    if (!quiz || !questions) {
      return res.status(400).send("Missing quiz or questions");
    }
    try {
      console.log(quiz);
      const newQuiz = await uploadQuiz(quiz, questions);
      if (!newQuiz) throw new Error("Error uploading quiz");
      // return newQuiz.id in body
      res.status(200).json({ id: newQuiz.id });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error uploading quiz");
    }
  } else {
    // Handle any non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
