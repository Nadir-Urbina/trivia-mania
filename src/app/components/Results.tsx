import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"
import Link from 'next/link'

interface ResultsProps {
  score: number
  totalQuestions: number
  onRestart: () => void
  userData: { fullName: string; email: string }
  totalTime: number
}

export default function Results({ score, totalQuestions, onRestart, userData, totalTime }: ResultsProps) {
  const percentage = (score / totalQuestions) * 100

  // Trigger confetti effect
  if (percentage > 70) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-primary mb-4">
        Game Over, {userData.fullName}!
      </h2>
      <p className="text-2xl text-primary mb-4">
        You scored {score} out of {totalQuestions}
      </p>
      <p className="text-xl text-primary mb-6">
        Total time: {formatTime(totalTime)}
      </p>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-primary-accent h-2.5 rounded-full" 
          style={{ width: `${(score / totalQuestions) * 100}%` }}
        />
      </div>

      <p className="text-xl text-primary mb-8">Keep practicing!</p>
      
      <button
        onClick={onRestart}
        className="bg-primary-accent text-white px-8 py-3 rounded-lg font-semibold mb-4 hover:opacity-90 transition-opacity"
      >
        Play Again
      </button>
      
      <div>
        <Link 
          href="/leaderboard"
          className="text-primary-accent hover:underline transition-all"
        >
          View Leaderboard
        </Link>
      </div>
    </div>
  )
}

