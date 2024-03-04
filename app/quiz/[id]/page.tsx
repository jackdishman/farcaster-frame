import { Metadata, ResolvingMetadata } from "next";
import { getQuiz, getSubmissions } from "@/middleware/supabase";
import { getFnameByFid } from "@/middleware/airstack";
import FarcasterWrapper from "../FarcasterWrapper";
import ShareQuiz from "./ShareQuiz";
import SubmissionList from "./SubmissionList";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

async function getQuizSubmissions(quizId: string) {
  try {
    const res = await getSubmissions(quizId);
    return res;
  } catch (error) {
    console.error("Error fetching submissions", error);
  }
}

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
  const submissions = await getQuizSubmissions(params.id);

  return (
    <FarcasterWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
          <h1 className="text-4xl">{quiz.title}</h1>
          <h6 className="text-xl">{quiz.description}</h6>
          <p>
            by {fname} ({quiz.proctor_fid})
          </p>
          {/* copy quiz to clipboard */}
          <div className="my-4 w-full">
            <ShareQuiz quiz={quiz} />
          </div>
          <img
            src={
              process.env[`NEXT_PUBLIC_HOST`] +
              `/api/quiz/image?title=${quiz.title}&description=${quiz.description}`
            }
          />
          {/* quiz stats */}
          <div className="my-4 w-full">
            <h2>Quiz Stats</h2>
            {submissions && submissions.length > 0 ? (
              <SubmissionList submissions={submissions} />
            ) : (
              <p>No submissions yet</p>
            )}
          </div>
        </main>
      </div>
    </FarcasterWrapper>
  );
}
