import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Question as SanityQuestion } from "@/sanity/types/question"

interface QuestionProps {
  question: SanityQuestion
  onAnswer: (answer: string | boolean) => void
  questionNumber: number
  totalQuestions: number
}

export default function Question({ question, onAnswer, questionNumber, totalQuestions }: QuestionProps) {
  const renderAnswers = () => {
    switch (question.type) {
      case 'multipleChoice':
        return question.answers.map((answer, index) => (
          <Button
            key={index}
            onClick={() => onAnswer(answer)}
            className="w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-purple-100"
            variant="outline"
          >
            {answer}
          </Button>
        ))
      
      case 'boolean':
        return (
          <>
            <Button onClick={() => onAnswer(true)} variant="outline">True</Button>
            <Button onClick={() => onAnswer(false)} variant="outline">False</Button>
          </>
        )
      
      case 'text':
        // Implement text input if needed
        return <div>Text input not implemented yet</div>
    }
  }

  return (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Question {questionNumber} of {totalQuestions}
      </h2>
      <p className="text-lg mb-6 text-gray-700">{question.question}</p>
      <div className="grid grid-cols-1 gap-4">
        {renderAnswers()}
      </div>
    </motion.div>
  )
}

