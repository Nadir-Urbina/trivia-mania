"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { canPlayerPlay } from "@/lib/firebaseUtils"
import AlreadyPlayedModal from "./AlreadyPlayedModal"

interface InitialFormProps {
  onSubmit: (formData: {
    fullName: string
    email: string
    companyName: string
    role: string
  }) => void
}

export default function InitialForm({ onSubmit }: InitialFormProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [role, setRole] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAlreadyPlayedModal, setShowAlreadyPlayedModal] = useState(false)
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Check if the email has already been used today
  const checkEmail = async (emailToCheck: string) => {
    if (!emailToCheck || emailToCheck.trim() === '' || !emailToCheck.includes('@')) {
      return;
    }

    setIsCheckingEmail(true);
    try {
      const canPlay = await canPlayerPlay(emailToCheck);
      setHasPlayedToday(!canPlay);
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Debounce the email check to prevent too many API calls
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Reset hasPlayedToday when email is cleared
    if (!newEmail || newEmail.trim() === '') {
      setHasPlayedToday(false);
      return;
    }
    
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set a new timeout to check the email after the user stops typing
    const newTimeoutId = setTimeout(() => {
      checkEmail(newEmail);
    }, 500); // 500ms debounce
    
    setTimeoutId(newTimeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (fullName && email && companyName && role && acknowledged && !hasPlayedToday) {
      setIsLoading(true)
      
      try {
        // Double-check if player has already played today
        const canPlay = await canPlayerPlay(email)
        
        if (canPlay) {
          // If they can play, proceed with the game
          onSubmit({ fullName, email, companyName, role })
        } else {
          // If they have already played, show the modal
          setHasPlayedToday(true)
          setShowAlreadyPlayedModal(true)
        }
      } catch (error) {
        console.error("Error checking player status:", error)
        // If there's an error, let them play anyway
        onSubmit({ fullName, email, companyName, role })
      } finally {
        setIsLoading(false)
      }
    } else if (hasPlayedToday) {
      // If they've already played, show the modal
      setShowAlreadyPlayedModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowAlreadyPlayedModal(false)
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      {showAlreadyPlayedModal && (
        <AlreadyPlayedModal 
          onClose={handleCloseModal}
          playerName={fullName || "there"}
        />
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          Welcome to Trivia Mania!
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-primary mb-2">Full Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-primary mb-2">Company Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-primary mb-2">Role</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-primary mb-2">Company Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-lg"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {isCheckingEmail && (
              <p className="text-sm text-blue-500 mt-1">Checking email...</p>
            )}
            {hasPlayedToday && !isCheckingEmail && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  It looks like you've already played today! 
                  Come back tomorrow for another round. 😊
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              required 
            />
            <label className="text-sm text-primary">
              I acknowledge that I'll receive information about ATS Products and Services
            </label>
          </div>

          <button 
            type="submit"
            className={`w-full py-2 rounded-lg transition-opacity ${
              hasPlayedToday 
                ? 'bg-gray-400 text-white opacity-50 cursor-not-allowed' 
                : 'bg-primary-accent text-white hover:opacity-90'
            }`}
            disabled={isLoading || hasPlayedToday}
          >
            {isLoading ? "Checking..." : hasPlayedToday ? "Already Played Today" : "Start Game"}
          </button>
          
          {hasPlayedToday && (
            <div className="mt-2 text-center">
              <Link 
                href="/leaderboard"
                className="text-primary-accent hover:underline"
              >
                View Leaderboard
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

