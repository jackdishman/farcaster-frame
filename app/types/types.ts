export interface IQuiz {
    created_at: string
    description: string | null
    id: number
    title: string | null
}

export interface ISubmissions {
    answers: {} | null
    created_at: string
    id: number
    quiz_id: number | null
    student_name: string | null
}

export interface IQuestion {
    id: string
    text: string
    option1: string
    option2: string
    option3: string
    option4: string
    correctAnswer: number
    explanation: string
}
