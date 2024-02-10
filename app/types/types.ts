export interface IQuiz {
    created_at: string
    description: string | null
    id: number
    title: string | null
}

export interface ISubmission {
    answers: {} | null
    created_at: string
    id: number
    quiz_id: number | null
    fid: string | null
}

export interface IQuestion {
    id: string
    text: string
    option_1: string
    option_2: string
    option_3: string
    option_4: string
    answer: number
    explanation: string
    next_question_id: string
}
