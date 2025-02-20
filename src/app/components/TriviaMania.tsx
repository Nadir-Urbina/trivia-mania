"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Question from "./Question"
import Results from "./Results"
import Timer from "./Timer"
import { shuffleArray } from "../utils/shuffleArray"
import { getQuestions } from "@/sanity/lib/client"
import { Question as SanityQuestion } from "@/sanity/types/question"

interface TriviaManiaProp {
  playerData: {
    fullName: string
    email: string
    companyName: string
    role: string
  }
  onGameComplete: (score: number, timeInSeconds: number) => void
}

const QUESTIONS_PER_GAME = 7

export default function TriviaMania({ playerData, onGameComplete }: TriviaManiaProp) {
  const [gameQuestions, setGameQuestions] = useState<SanityQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [totalTime, setTotalTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const allQuestions = await getQuestions()
        const shuffled = shuffleArray([...allQuestions])
        setGameQuestions(shuffled.slice(0, QUESTIONS_PER_GAME))
      } catch (error) {
        console.error("Error fetching questions:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTotalTime((prevTime) => prevTime + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  const validateAnswer = (question: SanityQuestion, answer: string | boolean): boolean => {
    switch (question.type) {
      case 'multipleChoice':
        return answer === question.correctAnswer
      case 'boolean':
        return String(answer).toLowerCase() === String(question.correctAnswer).toLowerCase()
      case 'text':
        const userAnswer = String(answer).toLowerCase().trim()
        const correctAnswer = question.correctAnswer.toLowerCase()
        const acceptableAnswers = question.acceptableAnswers?.map(a => a.toLowerCase()) || []
        return userAnswer === correctAnswer || acceptableAnswers.includes(userAnswer)
      default:
        return false
    }
  }

  const handleAnswer = (answer: string | boolean) => {
    const currentQuestion = gameQuestions[currentQuestionIndex]
    const isCorrect = validateAnswer(currentQuestion, answer)
    
    console.log({
      questionNumber: currentQuestionIndex + 1,
      question: currentQuestion.question,
      userAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: isCorrect,
      type: currentQuestion.type
    })

    if (isCorrect) setScore(score + 1)

    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setGameOver(true)
      setIsTimerRunning(false)
      onGameComplete(score + (isCorrect ? 1 : 0), totalTime)
    }
  }

  const restartGame = async () => {
    setIsLoading(true)
    try {
      const allQuestions = await getQuestions()
      const shuffled = shuffleArray([...allQuestions])
      setGameQuestions(shuffled.slice(0, QUESTIONS_PER_GAME))
      setCurrentQuestionIndex(0)
      setScore(0)
      setGameOver(false)
      setTotalTime(0)
      setIsTimerRunning(true)
    } catch (error) {
      console.error("Error restarting game:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>Loading questions...</div>
  if (gameQuestions.length === 0) return <div>No questions available</div>

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-center mb-6 text-primary">ATS Trivia Mania!</h1>
        <p className="text-center mb-4">Welcome, {playerData.fullName}!</p>
        <div className="mb-4 flex justify-center">
          <Timer time={totalTime} />
        </div>
        {!gameOver ? (
          <Question
            question={gameQuestions[currentQuestionIndex]}
            onAnswer={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={gameQuestions.length}
          />
        ) : (
          <Results
            score={score}
            totalQuestions={gameQuestions.length}
            onRestart={restartGame}
            userData={playerData}
            totalTime={totalTime}
          />
        )}
      </motion.div>
    </div>
  )
}

