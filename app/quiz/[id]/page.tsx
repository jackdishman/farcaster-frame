import { Metadata, ResolvingMetadata } from "next";
import { IQuiz } from "@/app/types/types";
import { getQuiz } from "@/middleware/supabase";

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
  const quiz = await getQuiz(id);
  if (!quiz) {
    return {
      title: "Quiz not found",
      openGraph: {
        title: "Quiz not found",
        description: "Quiz not found",
      },
      metadataBase: new URL(process.env["HOST"] || ""),
    };
  }

  const imageUrl = `${process.env["HOST"]}/api/quiz/image?title=${quiz.title}&description=${quiz.description}`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["HOST"]}/api/quiz/question?quiz_id=${id}&question_id=${quiz.first_question_id}`,
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": `Start ${quiz.title}`,
  };

  return {
    title: quiz.title,
    openGraph: {
      title: quiz.title ?? `Quiz ${id}`,
      description: quiz.description ?? `Quiz ${id}`,
      images: [{ url: imageUrl }],
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
        <img
          src={
            process.env[`HOST`] +
            `/api/quiz/image?title=${quiz.title}&description=${quiz.description}`
          }
        />
        <img
          src={
            process.env[`HOST`] +
            `/api/quiz/image-question?text=${`In what year was the USS constitution created and for how long did it sail?`}&time=12mins&progress=${"1/10"}`
          }
        />
        <img
          src={
            process.env[`HOST`] +
            `/api/quiz/image-result?explanation=${`In what year was the USS constitution created and for how long did it sail?`}&time=12mins&progress=${"1/10"}&correct=${true}`
          }
        />
      </main>
    </div>
  );
}
