"use client";

import { IQuiz } from "@/types/types";
import React from "react";
import QuizBuilder from "./QuizBuilder";
import QuizList from "./QuizList";

interface IProps {
  quizzes: IQuiz[];
}

export default function PageContainer(props: IProps) {
  const { quizzes } = props;
  const [toggle, setToggle] = React.useState(false);
  return (
    <div className="w-96 px-4">
      <TabToggle setToggle={setToggle} toggle={toggle} />
      {toggle ? <QuizList quizzes={quizzes} /> : <QuizBuilder />}
    </div>
  );
}

interface IToggleProps {
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const TabToggle = (props: IToggleProps) => {
  const { toggle, setToggle } = props;
  return (
    <div className="flex items-center">
      <div className="relative bg-gray-300 w-full rounded-full h-8">
        <div
          className={`absolute left-0 top-0 rounded-full h-12 transition-all duration-300 ${toggle ? "w-1/2" : "w-full"}`}
        ></div>
        <button
          onClick={() => setToggle(false)}
          className={`absolute left-0 w-1/2 h-full flex items-center justify-center text-white font-bold transition-all duration-300 rounded-full ${!toggle ? "z-10 bg-blue-700" : "bg-transparent"}`}
        >
          Create a Quiz
        </button>
        <button
          onClick={() => setToggle(true)}
          className={`absolute right-0 w-1/2 h-full flex items-center justify-center text-white font-bold transition-all duration-300 rounded-full ${toggle ? "z-10 bg-blue-700" : "bg-transparent"}`}
        >
          View Quizzes
        </button>
      </div>
    </div>
  );
};
