"use client"

import { getAllPlayersData } from '@/lib/firebaseUtils'
import { useState, useRef, useEffect } from 'react'

type TimeRange = 'week' | 'month' | 'all'

export default function DownloadPlayersData() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const downloadCSV = async (timeRange: TimeRange) => {
    try {
      setIsProcessing(true)
      setShowDropdown(false)
      
      // Get all players
      const allPlayers = await getAllPlayersData()
      
      // Filter players based on the selected time range
      const filteredPlayers = filterPlayersByTimeRange(allPlayers, timeRange)
      
      // Define CSV headers
      const headers = ['Full Name', 'Email', 'Company Name', 'Role', 'Last Played']
      
      // Convert data to CSV format
      const csvData = filteredPlayers.map(player => [
        player.fullName,
        player.email,
        player.companyName,
        player.role,
        player.lastPlayedAt ? new Date(player.lastPlayedAt).toLocaleString() : ''
      ])
      
      // Combine headers and data
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n')
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      // Add time range to filename
      const timeRangeText = timeRange === 'all' ? 'all_time' : `last_${timeRange}`
      link.setAttribute('href', url)
      link.setAttribute('download', `players_data_${timeRangeText}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert(`Successfully downloaded data for ${filteredPlayers.length} players`)
    } catch (error) {
      console.error('Error downloading data:', error)
      alert('Error downloading data. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Helper function to filter players by time range
  const filterPlayersByTimeRange = (players: any[], timeRange: TimeRange) => {
    if (timeRange === 'all') {
      return players
    }
    
    const now = new Date()
    let cutoffDate = new Date()
    
    if (timeRange === 'week') {
      // Set cutoff date to 1 week ago
      cutoffDate.setDate(now.getDate() - 7)
    } else if (timeRange === 'month') {
      // Set cutoff date to 1 month ago
      cutoffDate.setMonth(now.getMonth() - 1)
    }
    
    return players.filter(player => {
      // If no lastPlayedAt, include in all time ranges
      if (!player.lastPlayedAt) return true
      
      // Convert to Date object if it's not already
      const lastPlayed = player.lastPlayedAt instanceof Date 
        ? player.lastPlayedAt 
        : new Date(player.lastPlayedAt)
        
      return lastPlayed >= cutoffDate
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isProcessing}
        className="bg-primary-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
      >
        {isProcessing ? 'Processing...' : 'Download Players Data'}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1 rounded-md bg-white shadow-xs">
            <button
              onClick={() => downloadCSV('week')}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
            >
              Last Week
            </button>
            <button
              onClick={() => downloadCSV('month')}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
            >
              Last Month
            </button>
            <button
              onClick={() => downloadCSV('all')}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
            >
              All Time
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 