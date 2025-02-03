import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface QuestionProps {
  question: {
    question: string
    answers: string[]
    correctAnswer: string
  }
  onAnswer: (isCorrect: boolean) => void
  questionNumber: number
  totalQuestions: number
}

export default function Question({ question, onAnswer, questionNumber, totalQuestions }: QuestionProps) {
  return (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Question {questionNumber} of {totalQuestions}
      </h2>
      <p className="text-lg mb-6 text-gray-700">{question.question}</p>
      <div className="grid grid-cols-1 gap-4">
        {question.answers.map((answer, index) => (
          <Button
            key={index}
            onClick={() => onAnswer(answer === question.correctAnswer)}
            className="w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-purple-100"
            variant="outline"
          >
            {answer}
          </Button>
        ))}
      </div>
    </motion.div>
  )
}

