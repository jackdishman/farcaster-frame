"use client";

import { IQuestionBuilder, IQuizBuilder } from "@/types/types";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFarcaster } from "./FarcasterContext";
import { toast } from "react-toastify";

// Explicitly define the option keys as part of IQuestionBuilder keys
const optionKeys: (keyof IQuestionBuilder)[] = [
  "option_1",
  "option_2",
  "option_3",
  "option_4",
];

export default function QuizBuilder() {
  const { fid } = useFarcaster();
  const router = useRouter();
  const [disabled, setDisabled] = useState(false);
  useEffect(() => {
    setQuiz({ ...quiz, proctor_fid: fid });
  }, [fid]);
  const [quiz, setQuiz] = useState<IQuizBuilder>({
    description: null,
    title: null,
    proctor_fid: null,
  });
  console.log(quiz);
  const [questions, setQuestions] = useState<IQuestionBuilder[]>([]);

  useEffect(() => {
    if (!quiz.title || !quiz.description || questions.length < 1) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [quiz.title, quiz.description, questions.length]);

  const handleQuestionChange = (
    index: number,
    field: keyof IQuestionBuilder,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", option_1: "", option_2: "", answer: "", explanation: "" },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const buildQuiz = async () => {
    if (disabled) {
      toast.error("Title, description, and at least one question is required.");
      return;
    }
    if (!quiz.proctor_fid) {
      toast.error("Please sign into Farcaster to create a quiz.");
      return;
    }
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_HOST + `/api/quiz/builder/uploadQuiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quiz, questions }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const quizId = data.id;
        router.push(`/quiz/${quizId}`);
      } else {
        console.error("Error uploading quiz");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">Build a Quiz</h1>
      <div className="w-full max-w-md">
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Quiz Title
          </label>
          <input
            id="title"
            type="text"
            value={quiz.title || ""}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="Title"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description of Quiz
          </label>
          <input
            id="description"
            type="text"
            value={quiz.description || ""}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="Description"
          />
        </div>
        {questions.map((question, index) => (
          <div key={index} className="mb-6 border p-4 rounded">
            <div className="mb-4">
              <label
                htmlFor={`question-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Question {index + 1}
              </label>
              <input
                id={`question-${index}`}
                type="text"
                value={question.text}
                onChange={(e) =>
                  handleQuestionChange(index, "text", e.target.value)
                }
                className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="Question"
              />
            </div>
            {optionKeys.map((option, optionIndex) => (
              <div key={option} className="mb-4">
                <label
                  htmlFor={`${option}-${index}`}
                  className="block text-sm font-medium text-gray-700"
                >{`Option ${option.split("_")[1]}`}</label>
                <input
                  id={`${option}-${index}`}
                  type="text"
                  value={question[option] || ""}
                  onChange={(e) =>
                    handleQuestionChange(index, option, e.target.value)
                  }
                  className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder={`Option ${option.split("_")[1]}`}
                />
                {/* Mark as correct answer */}
                <div className="flex items-center mt-2">
                  <input
                    id={`answer-${option}-${index}`}
                    type="radio"
                    name={`answer-${index}`}
                    value={option}
                    checked={question.answer === option}
                    onChange={() =>
                      handleQuestionChange(index, "answer", option)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`answer-${option}-${index}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Correct answer?
                  </label>
                </div>
              </div>
            ))}
            <div className="mb-4">
              <label
                htmlFor={`explanation-${index}`}
                className="block text-sm font-medium text-gray-700"
              >
                Explanation
              </label>
              <textarea
                id={`explanation-${index}`}
                value={question.explanation}
                onChange={(e) =>
                  handleQuestionChange(index, "explanation", e.target.value)
                }
                className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="Explanation"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700 transition duration-200"
              >
                Remove Question
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-around">
          <button
            type="button"
            onClick={addQuestion}
            className="mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            Add Question
          </button>
          {/* save button */}
          <button
            type="button"
            className={`mt-4 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-700 transition duration-200 ${disabled && "opacity-50 cursor-not-allowed"}`}
            onClick={buildQuiz}
            disabled={!quiz.title || !quiz.description || questions.length < 1}
          >
            Save Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
