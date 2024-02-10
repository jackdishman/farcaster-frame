import { createClient } from "@supabase/supabase-js";
import { IQuestion, IQuiz, ISubmission } from "./app/types/types";

const supabase = createClient(
    process.env["SUPABASE_URL"] ?? ``,
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? ``
  );
  
export async function getQuiz(quizId: string): Promise<IQuiz | undefined> {
    try {
      const { data, error } = await supabase
        .from("quiz")
        .select("*")
        .eq("id", quizId);
      if (error) throw error;
      console.log(data);
      return data[0] as unknown as IQuiz;
    } catch (error) {
      console.error("Error fetching quizzes", error);
    }
  }
  
export async function getQuestions(quizId: string): Promise<IQuestion[] | undefined> {
    try {
      const { data, error } = await supabase
        .from("question")
        .select("*")
        .eq("quiz_id", quizId);
      if (error) throw error;
      console.log(data);
      return data as unknown as IQuestion[];
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  }

  export async function createSubmission(quizId: string, fid: string): Promise<ISubmission | undefined> {
    try {
      // check if exists first
      const { data: existingSubmission, error: existingSubmissionError } = await supabase
        .from("submissions")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("fid", fid).single();
      if (existingSubmissionError) throw existingSubmissionError;
      if (existingSubmission && existingSubmission.length > 0) {
        return existingSubmission[0] as unknown as ISubmission;
      }
      const { data, error } = await supabase
        .from("submission")
        .insert([{ quiz_id: quizId, fid, answers: {} }]).select("*").single();
      if (error) throw error;;
      return data[0] as unknown as ISubmission;
    } catch (error) {
      console.error("Error creating submission", error);
    }
  }

  export async function getQuestion(quizId: string, questionId?: string): Promise<IQuestion | undefined> {
    try {
      const { data, error } = await supabase
        .from("question")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("id", questionId)
        .order('id', {ascending: true});
      if (error) throw error;
      console.log(data);
      return data[0] as unknown as IQuestion;
    } catch (error) {
      console.error("Error fetching question", error);
    }
  }