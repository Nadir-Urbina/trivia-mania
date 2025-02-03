"use client"

import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { getLeaderboard } from '@/lib/firebaseUtils'
import { format } from 'date-fns'

interface LeaderboardEntry {
  id: string
  playerName: string
  score: number
  timeInSeconds: number
  playedAt: Date
}

export default function Leaderboard({ initialIsDaily = false }) {
  const [results, setResults] = useState<LeaderboardEntry[]>([])
  const [isDaily, setIsDaily] = useState(initialIsDaily)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [isDaily])

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true)
      const data = await getLeaderboard(isDaily)
      // Sort by score (descending) and then by time (ascending)
      const sortedData = data.sort((a, b) => {
        // First compare scores
        if (b.score !== a.score) {
          return b.score - a.score
        }
        // If scores are equal, compare times
        return a.timeInSeconds - b.timeInSeconds
      })
      setResults(sortedData)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Leaderboard</h2>
        <button
          onClick={() => setIsDaily(!isDaily)}
          className="bg-primary-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          {isDaily ? "Show All Time" : "Show Daily"}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No scores yet!</div>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={result.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2"
            >
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold text-primary-accent">{index + 1}</span>
                <div>
                  <p className="font-semibold text-primary">{result.playerName}</p>
                  <p className="text-sm text-gray-500">Score: {result.score}</p>
                  <p className="text-xs text-gray-400">
                    {format(result.playedAt.toDate(), 'MMM d, yyyy - h:mm a')}
                  </p>
                </div>
              </div>
              <span className="text-primary-accent font-mono">
                {formatTime(result.timeInSeconds)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 