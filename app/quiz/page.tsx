import { createClient } from "@supabase/supabase-js";
import { IQuiz } from "../../types/types";
import FarcasterWrapper from "./FarcasterWrapper";
import QuizBuilder from "./QuizBuilder";

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
    <div>
      <FarcasterWrapper>
        <h1 className="text-2xl">Quizzes</h1>
        <QuizBuilder />
        {quizzes &&
          quizzes.map((quiz: IQuiz) => (
            <ul key={quiz.id}>
              <li>{quiz.title}</li>
              <li>{quiz.description}</li>
            </ul>
          ))}
      </FarcasterWrapper>
    </div>
  );
}
