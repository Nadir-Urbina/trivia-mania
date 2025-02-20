"use client"

import { useState } from "react"
import Link from 'next/link'
import TriviaMania from "./components/TriviaMania"
import InitialForm from "./components/InitialForm"
import Leaderboard from "./components/Leaderboard"
import { savePlayerData, saveGameResult } from "@/lib/firebaseUtils"

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false)
  const [playerData, setPlayerData] = useState<{
    fullName: string;
    email: string;
    companyName: string;
    role: string;
  } | null>(null)

  const handleStartGame = async (data: { 
    fullName: string; 
    email: string; 
    companyName: string; 
    role: string;
  }) => {
    try {
      await savePlayerData({
        fullName: data.fullName,
        email: data.email,
        companyName: data.companyName,
        role: data.role,
        acknowledgeMarketing: true,
      })
      
      setPlayerData(data)
      setGameStarted(true)
    } catch (error) {
      console.error("Error saving player data:", error)
    }
  }

  const handleGameComplete = async (score: number, timeInSeconds: number) => {
    if (!playerData) return

    try {
      await saveGameResult({
        playerName: playerData.fullName,
        companyName: playerData.companyName,
        score,
        timeInSeconds
      })
    } catch (error) {
      console.error("Error saving game result:", error)
    }
  }

  return (
    <main className="min-h-screen p-4 bg-gradient-primary">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-6">
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

