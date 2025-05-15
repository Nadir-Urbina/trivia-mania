"use client"

import { useState, useEffect } from "react"
import { getCategories } from "@/sanity/lib/client"
import { Category } from "@/sanity/types/question"
import Link from "next/link"
import CategoryStats from "./components/CategoryStats"

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allCategories = await getCategories()
        setCategories(allCategories)
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCategories()
  }, [])

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleSelectAll = () => {
    setSelectedCategories(categories.map(cat => cat._id))
  }

  const handleClearAll = () => {
    setSelectedCategories([])
  }

  const getUrlWithCategories = () => {
    const baseUrl = "/game"
    if (selectedCategories.length === 0) return baseUrl
    
    const categoryParams = selectedCategories.join(",")
    return `${baseUrl}?categories=${categoryParams}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Trivia Admin Panel</h1>
          
          <div className="flex space-x-2">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Back to Home
            </Link>
            <Link
              href="/leaderboard"
              className="px-4 py-2 bg-primary-accent text-white rounded-md hover:opacity-90 transition"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
        
        <CategoryStats />
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Categories for Game</h2>
          
          <div className="mb-4 flex space-x-2">
            <button 
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Select All
            </button>
            <button 
              onClick={handleClearAll}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categories.map(category => (
              <div key={category._id} className="flex items-center p-3 border rounded-md">
                <input
                  type="checkbox"
                  id={category._id}
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => handleCategoryToggle(category._id)}
                  className="mr-3 h-5 w-5"
                />
                <label htmlFor={category._id} className="flex-1">
                  <span className="font-medium">{category.title}</span>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  )}
                </label>
              </div>
            ))}
          </div>
          
          {categories.length === 0 && (
            <p className="text-gray-500 italic">No categories found. Add categories in Sanity Studio.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Start Game</h2>
          <p className="mb-4">
            {selectedCategories.length === 0 
              ? "No categories selected. The game will use all available questions." 
              : `Selected ${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'}.`}
          </p>
          
          <Link 
            href={getUrlWithCategories()}
            className="inline-block px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition"
          >
            Start Trivia Game
          </Link>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sanity Studio Management</h2>
          <p className="mb-4">
            To create or edit categories and questions, open Sanity Studio:
          </p>
          
          <Link 
            href="/studio"
            className="inline-block px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition"
          >
            Open Sanity Studio
          </Link>
        </div>
      </div>
    </div>
  )
} 