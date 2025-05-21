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

interface PaginatedResponse {
  results: LeaderboardEntry[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export default function Leaderboard({ initialIsDaily = false }) {
  const [results, setResults] = useState<LeaderboardEntry[]>([])
  const [allResults, setAllResults] = useState<LeaderboardEntry[]>([])
  const [isDaily, setIsDaily] = useState(initialIsDaily)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [archiveFilter, setArchiveFilter] = useState<'active' | 'archived' | 'all'>('active')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 20

  // Use useCallback to memoize the loadLeaderboard function
  const loadLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('Loading leaderboard data, daily mode:', isDaily, 'archive filter:', archiveFilter, 'page:', currentPage)
      const data = await getLeaderboard(isDaily, archiveFilter, currentPage, pageSize)
      console.log('Leaderboard data loaded:', data)
      
      setResults(data.results)
      
      // Store all results for search functionality
      if (currentPage === 1) {
        // Fetch all results for search functionality
        const allData = await getLeaderboard(isDaily, archiveFilter, 1, 1000) // Fetch a large number to get all
        setAllResults(allData.results)
      }
      
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isDaily, archiveFilter, currentPage, pageSize])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      // If search is cleared, reset to normal pagination
      loadLeaderboard()
      return
    }
    
    // Search in all results
    const lowerQuery = query.toLowerCase()
    const filteredResults = allResults.filter(result => {
      const playerName = result.playerName || '';
      const companyName = result.companyName || '';
      
      return playerName.toLowerCase().includes(lowerQuery) || 
             companyName.toLowerCase().includes(lowerQuery);
    })
    
    // Update the results with filtered data
    setResults(filteredResults.slice(0, pageSize))
    setTotalCount(filteredResults.length)
    setTotalPages(Math.ceil(filteredResults.length / pageSize))
    setCurrentPage(1)
  }, [allResults, loadLeaderboard, pageSize])

  // Trigger a refresh
  const handleRefresh = useCallback(() => {
    console.log('Refreshing leaderboard...')
    setRefreshTrigger(prev => prev + 1)
    setSearchQuery('')
  }, [])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard, refreshTrigger])

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1)
    setSearchQuery('')
  }, [isDaily, archiveFilter])

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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    if (searchQuery) {
      // If searching, handle pagination manually
      const lowerQuery = searchQuery.toLowerCase()
      const filteredResults = allResults.filter(result => {
        const playerName = result.playerName || '';
        const companyName = result.companyName || '';
        
        return playerName.toLowerCase().includes(lowerQuery) || 
               companyName.toLowerCase().includes(lowerQuery);
      })
      
      const startIndex = (page - 1) * pageSize
      setResults(filteredResults.slice(startIndex, startIndex + pageSize))
      setCurrentPage(page)
    } else {
      // Normal pagination
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-primary">Leaderboard</h2>
      </div>
      
      {/* Search input */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by player or company name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => handleSearch('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <svg className="w-4 h-4 text-gray-500 hover:text-gray-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            {totalCount} {totalCount === 1 ? 'result' : 'results'} found for "{searchQuery}"
          </p>
        )}
      </div>
      
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-2 sm:mb-0">
          <button
            onClick={() => setArchiveFilter('active')}
            className={`px-3 py-1 text-sm font-medium ${
              archiveFilter === 'active' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setArchiveFilter('archived')}
            className={`px-3 py-1 text-sm font-medium ${
              archiveFilter === 'archived' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Archived
          </button>
          <button
            onClick={() => setArchiveFilter('all')}
            className={`px-3 py-1 text-sm font-medium ${
              archiveFilter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsDaily(!isDaily)}
            className="bg-primary-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            {isDaily ? "Show All Time" : "Show Daily"}
          </button>
          <DownloadPlayersData />
          
          {/* Only show Archive button if not viewing archived records */}
          {archiveFilter !== 'archived' && (
            <ClearPlayersData archiveMode={true} onDataCleared={handleRefresh} />
          )}
          
          {/* Show a disabled button for better UI continuity when viewing archived records */}
          {archiveFilter === 'archived' && (
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
            >
              Archive Players Data
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? `No results found for "${searchQuery}"` : "No scores yet!"}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {results.map((result, index) => {
              // Calculate global ranking based on page number and index, unless searching
              const globalRanking = searchQuery 
                ? 0 // Don't show ranking when searching
                : (currentPage - 1) * pageSize + index + 1;
              
              return (
                <div
                  key={result.id}
                  className={`flex items-center justify-between p-4 rounded-lg mb-2 ${
                    result.archived 
                      ? 'bg-gray-100 border border-gray-300' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {!searchQuery && (
                      <span className="text-xl font-bold text-primary-accent">{globalRanking}</span>
                    )}
                    <div>
                      <div className="flex items-center">
                        <p className="font-semibold text-primary">{result.playerName}</p>
                        {result.archived && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                            Archived
                          </span>
                        )}
                      </div>
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
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Previous
              </button>
              
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalCount} total entries)
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 