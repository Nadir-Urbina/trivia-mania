"use client"

import Link from 'next/link'
import Leaderboard from '../components/Leaderboard'

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen p-4 bg-gradient-primary">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-white hover:opacity-90 transition-opacity"
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
            Back to Game
          </Link>
        </div>
        <Leaderboard />
      </div>
    </main>
  )
} 