import { createClient } from "@supabase/supabase-js";
import { IQuiz } from "../../types/types";
import FarcasterWrapper from "./FarcasterWrapper";
import PageContainer from "./PageContainer";

const supabase = createClient(
  process.env["SUPABASE_URL"] ?? ``,
  process.env["SUPABASE_ANON_KEY"] ?? ``
);

async function getQuizzes() {
  try {
    const { data, error } = await supabase.from("quiz").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching quizzes", error);
  }
}

export default async function Page() {
  const quizzes = await getQuizzes();

  return (
    <FarcasterWrapper>
      <div className="flex justify-center">
        <PageContainer quizzes={quizzes as IQuiz[]} />
      </div>
    </FarcasterWrapper>
  );
}
