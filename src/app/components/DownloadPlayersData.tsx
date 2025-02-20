"use client"

import { getAllPlayersData } from '@/lib/firebaseUtils'

export default function DownloadPlayersData() {
  const downloadCSV = async () => {
    try {
      const players = await getAllPlayersData()
      
      // Define CSV headers
      const headers = ['Full Name', 'Email', 'Company Name', 'Role', 'Last Played']
      
      // Convert data to CSV format
      const csvData = players.map(player => [
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
      link.setAttribute('href', url)
      link.setAttribute('download', `players_data_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading data:', error)
      alert('Error downloading data. Please try again.')
    }
  }

  return (
    <button
      onClick={downloadCSV}
      className="bg-primary-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
    >
      Download Players Data
    </button>
  )
} 