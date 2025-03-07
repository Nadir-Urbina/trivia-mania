import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Question as SanityQuestion } from "@/sanity/types/question"
import { cn } from "@/lib/utils" // Assuming you have a utility function for class names
import { useEffect } from "react"

interface QuestionProps {
  question: SanityQuestion
  onAnswer: (answer: string | boolean) => void
  questionNumber: number
  totalQuestions: number
}

export default function Question({ question, onAnswer, questionNumber, totalQuestions }: QuestionProps) {
  // Add a style tag to the document to override any global hover styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .no-hover-effect {
        -webkit-tap-highlight-color: transparent !important;
        outline: none !important;
      }
      .no-hover-effect:hover, 
      .no-hover-effect:focus, 
      .no-hover-effect:active {
        background-color: white !important;
        color: #1f2937 !important;
        border-color: #d1d5db !important;
        outline: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const renderAnswers = () => {
    switch (question.type) {
      case 'multipleChoice':
        return question.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => onAnswer(answer)}
            className="no-hover-effect w-full p-4 mb-2 text-center border border-gray-300 rounded-lg bg-white text-gray-800"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              outline: 'none'
            }}
          >
            {answer}
          </button>
        ))
      
      case 'boolean':
        return (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onAnswer(true)} 
              className="no-hover-effect w-full p-4 text-center border border-gray-300 rounded-lg bg-white text-gray-800"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                outline: 'none'
              }}
            >
              True
            </button>
            <button 
              onClick={() => onAnswer(false)} 
              className="no-hover-effect w-full p-4 text-center border border-gray-300 rounded-lg bg-white text-gray-800"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                outline: 'none'
              }}
            >
              False
            </button>
          </div>
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

