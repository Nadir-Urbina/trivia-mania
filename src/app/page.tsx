"use client"

import { useState } from "react"
import Link from 'next/link'
import TriviaMania from "./components/TriviaMania"
import InitialForm from "./components/InitialForm"
import Leaderboard from "./components/Leaderboard"
import { savePlayerData, saveGameResult, PlayerData } from "@/lib/firebaseUtils"

export default function Home() {
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
        email: playerData.email,
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
            Admin Panel
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
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
            <InitialForm onSubmit={handleStartGame} />
          ) : (
            <TriviaMania 
              playerData={playerData!} 
              onGameComplete={handleGameComplete}
            />
          )}
        </div>
      </div>
    </main>
  )
}

