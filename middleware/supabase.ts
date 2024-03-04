import { createClient } from "@supabase/supabase-js";
import {
  IAnswerEntry,
  IQuestion,
  IQuestionBuilder,
  IQuiz,
  IQuizBuilder,
  ISubmission,
} from "../types/types";

const supabase = createClient(
  process.env["SUPABASE_URL"] ?? ``,
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? ``
);

export async function getQuiz(quizId: string): Promise<IQuiz | undefined> {
  try {
    const { data, error } = await supabase
      .from("quiz")
      .select("*")
      .eq("id", quizId)
      .single();
    if (error) throw error;
    return data as IQuiz;
  } catch (error) {
    console.error("Error fetching quizzes", error);
  }
}

export async function getQuestions(
  quizId: string
): Promise<IQuestion[] | undefined> {
  try {
    const { data, error } = await supabase
      .from("question")
      .select("*")
      .eq("quiz_id", quizId)
      .order("id", { ascending: true });
    if (error) throw error;
    return data as unknown as IQuestion[];
  } catch (error) {
    console.error("Error fetching questions", error);
  }
}

export async function createSubmission(
  quizId: string,
  fid: string
): Promise<ISubmission | undefined> {
  try {
    // check if exists first
    const { data: existingSubmission, error: existingSubmissionError } =
      await supabase
        .from("submissions")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("fid", fid)
        .single();
    if (existingSubmissionError) throw existingSubmissionError;
    if (existingSubmission) {
      return existingSubmission as ISubmission;
    }
  } catch (error) {
    console.error("Error creating submission", error);
  }
  try {
    const { data, error } = await supabase
      .from("submissions")
      .insert([{ quiz_id: quizId, fid }])
      .select();
    if (error) throw error;
    return data[0] as ISubmission;
  } catch (error) {
    console.error("Error creating submission", error);
  }
}

export async function getQuestion(
  quizId: string,
  questionId: string
): Promise<IQuestion | undefined> {
  console.log(`getQuestion`, quizId, questionId);
  try {
    const { data, error } = await supabase
      .from("question")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("id", questionId)
      .single();
    if (error) throw error;
    return data as IQuestion;
  } catch (error) {
    console.error("Error fetching question", error);
  }
}

export async function updateSubmission(
  fid: string,
  submissionState: ISubmission,
  questionId: string,
  answer: string,
  isCorrect: boolean
): Promise<ISubmission | undefined> {
  const answerEntry: IAnswerEntry = {
    question_id: questionId,
    answer,
    isCorrect,
  };
  const answers = submissionState.answers
    ? [...submissionState.answers, answerEntry]
    : [answerEntry];
  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({ answers })
      .eq("id", submissionState.id)
      .eq("fid", fid)
      .select();
    if (error) throw error;
    return data[0] as ISubmission;
  } catch (error) {
    console.error("Error updating submission", error);
  }
}

export async function updateSubmissionScore(
  submissionId: number,
  score: number
): Promise<ISubmission | undefined> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({ score, time_completed: new Date().toISOString() })
      .eq("id", submissionId)
      .select();
    if (error) throw error;
    return data[0] as ISubmission;
  } catch (error) {
    console.error("Error updating submission", error);
  }
}

export async function getSubmissions(
  quizId: string
): Promise<ISubmission[] | undefined> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("score", { ascending: false });
    if (error) throw error;
    return data as unknown as ISubmission[];
  } catch (error) {
    console.error("Error fetching submissions", error);
  }
}

export async function uploadQuiz(
  quiz: IQuizBuilder,
  questions: IQuestionBuilder[]
): Promise<IQuiz | undefined> {
  try {
    // add quiz
    const { data, error } = await supabase.from("quiz").insert(quiz).select();
    if (error) throw error;
    // use quiz id to add questions
    const newQuiz = data[0] as IQuiz;
    const questionData = questions.map((question) => {
      return {
        ...question,
        quiz_id: newQuiz.id,
      };
    });
    const { data: questionDataResponse, error: questionDataError } =
      await supabase.from("question").upsert(questionData).select();
    if (questionDataError) throw questionDataError;
    // get first question ID and update quiz first_question_id on quiz table
    const firstQuestionId = questionDataResponse[0].id;
    const { data: updatedQuiz, error: updatedQuizError } = await supabase
      .from("quiz")
      .update({ first_question_id: firstQuestionId })
      .eq("id", newQuiz.id)
      .select();
    if (updatedQuizError) throw updatedQuizError;
    return updatedQuiz[0] as IQuiz;
  } catch (error) {
    console.error("Error uploading quiz", error);
  }
}
