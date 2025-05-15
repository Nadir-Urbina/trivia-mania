"use client"

import { useEffect, useState } from "react"
import { getQuestions, getCategories } from "@/sanity/lib/client"
import { Category, Question } from "@/sanity/types/question"

export default function CategoryStats() {
  const [categories, setCategories] = useState<Category[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{[key: string]: {
    count: number
    easy: number
    medium: number
    hard: number
    multipleChoice: number
    boolean: number
    text: number
  }}>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCategories, allQuestions] = await Promise.all([
          getCategories(),
          getQuestions()
        ])
        
        setCategories(allCategories)
        setQuestions(allQuestions)
        
        // Calculate stats
        const categoryStats: any = {}
        
        // Initialize stats for each category
        allCategories.forEach(cat => {
          categoryStats[cat._id] = {
            title: cat.title,
            count: 0,
            easy: 0,
            medium: 0,
            hard: 0,
            multipleChoice: 0,
            boolean: 0,
            text: 0
          }
        })
        
        // Add an "Uncategorized" category
        categoryStats["uncategorized"] = {
          title: "Uncategorized",
          count: 0,
          easy: 0,
          medium: 0,
          hard: 0,
          multipleChoice: 0,
          boolean: 0,
          text: 0
        }
        
        // Count questions
        allQuestions.forEach(question => {
          // Check if question has categories
          const questionCategories = question.categories || []
          
          if (questionCategories.length === 0) {
            // Uncategorized
            categoryStats["uncategorized"].count++
            categoryStats["uncategorized"][question.difficulty.toLowerCase()]++
            categoryStats["uncategorized"][question.type]++
          } else {
            // Add to each category this question belongs to
            questionCategories.forEach(cat => {
              if (categoryStats[cat._id]) {
                categoryStats[cat._id].count++
                categoryStats[cat._id][question.difficulty.toLowerCase()]++
                categoryStats[cat._id][question.type]++
              }
            })
          }
        })
        
        setStats(categoryStats)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  if (loading) {
    return <div>Loading category statistics...</div>
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Question Statistics</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-center">Questions</th>
              <th className="py-2 px-4 border-b text-center">Easy</th>
              <th className="py-2 px-4 border-b text-center">Medium</th>
              <th className="py-2 px-4 border-b text-center">Hard</th>
              <th className="py-2 px-4 border-b text-center">Multiple Choice</th>
              <th className="py-2 px-4 border-b text-center">True/False</th>
              <th className="py-2 px-4 border-b text-center">Text</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats).map(([id, data]) => (
              <tr key={id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{data.title}</td>
                <td className="py-2 px-4 border-b text-center">{data.count}</td>
                <td className="py-2 px-4 border-b text-center">{data.easy}</td>
                <td className="py-2 px-4 border-b text-center">{data.medium}</td>
                <td className="py-2 px-4 border-b text-center">{data.hard}</td>
                <td className="py-2 px-4 border-b text-center">{data.multipleChoice}</td>
                <td className="py-2 px-4 border-b text-center">{data.boolean}</td>
                <td className="py-2 px-4 border-b text-center">{data.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>* Questions can belong to multiple categories, so the total count across categories may exceed the actual number of questions.</p>
      </div>
    </div>
  )
} 