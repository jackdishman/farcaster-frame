export interface IQuiz {
    created_at: string
    description: string | null
    id: number
    title: string | null
}

export interface ISubmission {
    answers: IAnswerEntry[] | null
    created_at: string
    id: number
    quiz_id: number | null
    fid: string | null
    score: number | null
}

export interface IAnswerEntry {
    question_id: string
    answer: string
    isCorrect: boolean
}

export interface IQuestion {
    id: string
    text: string
    option_1: string
    option_2: string
    option_3: string
    option_4: string
    answer: string
    explanation: string
    next_question_id: string
}
