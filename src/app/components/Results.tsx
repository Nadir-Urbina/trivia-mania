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
  results?: Array<{ question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }>
}

export default function Results({ score, totalQuestions, onRestart, userData, totalTime, results }: ResultsProps) {
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
      <div className="mb-4">
        <div className="inline-block bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-md font-medium">
          You'll find your results in your email too!
        </div>
      </div>
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

      {results && results.length > 0 && (
        <div className="overflow-x-auto mb-8">
          <table className="mx-auto min-w-full border border-gray-200 rounded-lg text-left text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 border-b-2 border-primary-accent">Question</th>
                <th className="px-3 py-2 border-b-2 border-primary-accent">Your Answer</th>
                <th className="px-3 py-2 border-b-2 border-primary-accent">Correct Answer</th>
                <th className="px-3 py-2 border-b-2 border-primary-accent text-center">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={r.isCorrect ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-3 py-2 border-b border-gray-200">{r.question}</td>
                  <td className="px-3 py-2 border-b border-gray-200">{r.userAnswer}</td>
                  <td className="px-3 py-2 border-b border-gray-200">{r.correctAnswer}</td>
                  <td className="px-3 py-2 border-b border-gray-200 text-center font-bold" style={{ color: r.isCorrect ? '#388e3c' : '#d32f2f' }}>
                    {r.isCorrect ? '✔️' : '❌'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

