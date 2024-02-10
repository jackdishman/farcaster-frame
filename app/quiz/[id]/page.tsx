import Head from "next/head";
import { Metadata, ResolvingMetadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { IQuiz } from "@/app/types/types";

const supabase = createClient(
  process.env["SUPABASE_URL"] ?? ``,
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? ``
);

async function getQuiz(quizId: string): Promise<IQuiz | undefined> {
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

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;
  const quiz: IQuiz = (await getQuiz(id)) as unknown as IQuiz;

  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["HOST"]}/api/quiz/question?quiz_id=${id}`,
    "fc:frame:image": `${process.env["HOST"]}/api/image?quiz_id=${id}`,
    "fc:frame:button:1": `Take ${quiz.title} quiz`,
  };

  return {
    title: quiz.title,
    openGraph: {
      title: quiz.title ?? `Quiz ${id}`,
      description: quiz.description ?? `Quiz ${id}`,
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["HOST"] || ""),
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const quiz = await getQuiz(params.id);
  console.log(quiz);
  if (!quiz) {
    return (
      <div>
        <h1>Quiz not found</h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-2xl">{quiz.title}</h1>
        <p>{quiz.description}</p>
      </main>
    </div>
  );
}
