"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Question from "./Question"
import Results from "./Results"
import Timer from "./Timer"
import { shuffleArray } from "../utils/shuffleArray"
import { questions as allQuestions } from "../data/questions"

interface TriviaManiaProp {
  playerData: {
    fullName: string
    email: string
  }
  onGameComplete: (score: number, timeInSeconds: number) => void
}

const QUESTIONS_PER_GAME = 7

export default function TriviaMania({ playerData, onGameComplete }: TriviaManiaProp) {
  const [gameQuestions, setGameQuestions] = useState<typeof allQuestions>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [totalTime, setTotalTime] = useState(0)

  const selectRandomQuestions = useCallback(() => {
    const shuffled = shuffleArray([...allQuestions])
    return shuffled.slice(0, QUESTIONS_PER_GAME)
  }, [])

  useEffect(() => {
    setGameQuestions(selectRandomQuestions())
  }, [selectRandomQuestions])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTotalTime((prevTime) => prevTime + 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setScore(score + 1)

    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setGameOver(true)
      setIsTimerRunning(false)
      onGameComplete(score + (isCorrect ? 1 : 0), totalTime)
    }
  }

  const restartGame = () => {
    setGameQuestions(selectRandomQuestions())
    setCurrentQuestionIndex(0)
    setScore(0)
    setGameOver(false)
    setTotalTime(0)
    setIsTimerRunning(true)
  }

  if (gameQuestions.length === 0) return <div>Loading...</div>

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

