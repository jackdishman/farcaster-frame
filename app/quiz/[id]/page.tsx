import { Metadata, ResolvingMetadata } from "next";
import { getQuiz } from "@/middleware/supabase";
import { getFnameByFid } from "@/middleware/airstack";
import FarcasterWrapper from "../FarcasterWrapper";
import Layout from "../Layout";

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
      metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
    };
  }

  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/quiz/image?title=${quiz.title}&description=${quiz.description}`;
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["NEXT_PUBLIC_HOST"]}/api/quiz/question?quiz_id=${id}&question_id=${quiz.first_question_id}`,
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
    metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const quiz = await getQuiz(params.id);
  if (!quiz) {
    return (
      <div>
        <h1>Quiz not found</h1>
      </div>
    );
  }

  const fname = quiz.proctor_fid ? await getFnameByFid(quiz.proctor_fid) : "";

  return (
    <FarcasterWrapper>
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
          <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
            <h1 className="text-4xl">{quiz.title}</h1>
            <h6 className="text-xl">{quiz.description}</h6>
            <p>
              by {fname} ({quiz.proctor_fid})
            </p>
            <img
              src={
                process.env[`NEXT_PUBLIC_HOST`] +
                `/api/quiz/image?title=${quiz.title}&description=${quiz.description}`
              }
            />
          </main>
        </div>
      </Layout>
    </FarcasterWrapper>
  );
}
