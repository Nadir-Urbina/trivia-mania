"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface InitialFormProps {
  onSubmit: (formData: { fullName: string; email: string }) => void
}

export default function InitialForm({ onSubmit }: InitialFormProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fullName && email && acknowledged) {
      onSubmit({ fullName, email })
    }
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
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
            <label className="block text-primary mb-2">Company Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
            className="w-full bg-primary-accent text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  )
}

