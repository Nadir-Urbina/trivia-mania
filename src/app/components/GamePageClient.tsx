'use client'

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import TriviaMania from "./TriviaMania"
import InitialForm from "./InitialForm"
import { savePlayerData, saveGameResult, PlayerData } from "@/lib/firebaseUtils"

export default function GamePageClient() {
  // Add this for client-side only
  const searchParamsHook = useSearchParams();  
  
  // Only access searchParams on the client to avoid hydration errors
  const categoryParam = typeof window !== 'undefined' ? searchParamsHook.get("categories") : null;
  
  // Parse category IDs from URL params
  const categoryIds = categoryParam ? categoryParam.split(",") : undefined
  
  const [gameStarted, setGameStarted] = useState(false)
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)

  const handleStartGame = async (data: PlayerData) => {
    try {
      await savePlayerData({
        ...data,
        acknowledgeMarketing: true,
      })
      
      setPlayerData(data)
      setGameStarted(true)
    } catch (error) {
      console.error("Error saving player data:", error)
    }
  }

  const handleGameComplete = async (score: number, timeInSeconds: number, results: Array<{ question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }>) => {
    if (!playerData) return

    try {
      await saveGameResult({
        playerName: playerData.fullName,
        companyName: playerData.companyName,
        score,
        timeInSeconds,
        archived: false
      })
      // Send quiz results email
      await fetch('/api/send-quiz-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerData.fullName,
          email: playerData.email,
          score,
          total: results.length,
          results
        })
      })
    } catch (error) {
      console.error("Error saving game result or sending email:", error)
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gradient-primary">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between mb-6">
          <Link 
            href="/admin"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back to Admin
          </Link>
          
          <Link 
            href="/leaderboard"
            className="inline-flex items-center px-4 py-2 bg-primary-accent text-white rounded-lg hover:opacity-90 transition-colors"
          >
            View Leaderboard
            <svg 
              className="w-5 h-5 ml-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </Link>
        </div>
        <div className="flex justify-center">
          {!gameStarted ? (
            <div>
              <InitialForm onSubmit={handleStartGame} />
              {categoryIds && categoryIds.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    Playing with {categoryIds.length} selected {categoryIds.length === 1 ? 'category' : 'categories'}.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <TriviaMania 
              playerData={playerData!} 
              onGameComplete={handleGameComplete}
              categoryIds={categoryIds}
            />
          )}
        </div>
      </div>
    </main>
  )
} 