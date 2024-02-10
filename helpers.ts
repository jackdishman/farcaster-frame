import { createClient } from "@supabase/supabase-js";
import { IQuiz } from "./app/types/types";

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
  