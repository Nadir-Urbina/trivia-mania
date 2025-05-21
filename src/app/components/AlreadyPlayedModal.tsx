"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface AlreadyPlayedModalProps {
  onClose: () => void
  playerName: string
}

export default function AlreadyPlayedModal({ onClose, playerName }: AlreadyPlayedModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
      >
        <div className="text-center">
          <div className="mb-4">
            <span className="inline-block p-3 bg-yellow-100 text-yellow-500 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-primary mb-2">
            Hello again, {playerName}!
          </h3>
          
          <p className="text-gray-600 mb-3">
            We're thrilled to see your enthusiasm for our trivia game! 
          </p>

          <p className="text-gray-600 mb-3">
            Your score for today has already been recorded in our leaderboard.
          </p>
          
          <p className="text-gray-600 mb-6">
            Please come back tomorrow for another exciting round of trivia fun!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/leaderboard"
              className="px-4 py-2 bg-primary-accent text-white rounded-lg hover:opacity-90 transition-colors"
            >
              View Your Score
            </Link>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 