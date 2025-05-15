"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from "framer-motion"
import { getLeaderboard } from '@/lib/firebaseUtils'
import { format } from 'date-fns'
import DownloadPlayersData from './DownloadPlayersData'
import ClearPlayersData from './ClearPlayersData'

interface LeaderboardEntry {
  id: string
  playerName: string
  companyName: string
  score: number
  timeInSeconds: number
  playedAt: Date
  archived?: boolean
}

export default function Leaderboard({ initialIsDaily = false }) {
  const [results, setResults] = useState<LeaderboardEntry[]>([])
  const [isDaily, setIsDaily] = useState(initialIsDaily)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Use useCallback to memoize the loadLeaderboard function
  const loadLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('Loading leaderboard data, daily mode:', isDaily)
      const data = await getLeaderboard(isDaily)
      console.log('Leaderboard data loaded, count:', data.length, data)
      
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
  }, [isDaily])

  // Trigger a refresh
  const handleRefresh = useCallback(() => {
    console.log('Refreshing leaderboard...')
    setRefreshTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard, refreshTrigger])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/delete-game-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        const data = await res.json();
        alert('Failed to delete: ' + (data.error || res.statusText));
      } else {
        handleRefresh();
      }
    } catch (err) {
      alert('Error deleting record: ' + (err as Error).message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Leaderboard</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setIsDaily(!isDaily)}
            className="bg-primary-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            {isDaily ? "Show All Time" : "Show Daily"}
          </button>
          <DownloadPlayersData />
          <ClearPlayersData archiveMode={true} onDataCleared={handleRefresh} />
        </div>
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
                  <p className="text-sm text-gray-500">{result.companyName}</p>
                  <p className="text-sm text-gray-500">Score: {result.score}</p>
                  <p className="text-xs text-gray-400">
                    {format(result.playedAt, 'MMM d, yyyy - h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-primary-accent font-mono">
                  {formatTime(result.timeInSeconds)}
                </span>
                <button
                  onClick={() => handleDelete(result.id)}
                  className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs font-semibold"
                  title="Delete this record"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 