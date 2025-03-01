"use client"

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, writeBatch, doc, query, where } from 'firebase/firestore'

interface ClearPlayersDataProps {
  archiveMode?: boolean;
  onDataCleared?: () => void;
}

export default function ClearPlayersData({ 
  archiveMode = true,
  onDataCleared
}: ClearPlayersDataProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const clearData = async () => {
    const confirmMessage = archiveMode 
      ? 'Are you sure you want to archive all player data? Players will still be in the database but marked as archived.'
      : 'Are you sure you want to DELETE all player data? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Only get non-archived documents to archive
      const gameResultsRef = collection(db, 'gameResults');
      const q = query(gameResultsRef, where('archived', '!=', true));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert('No records to archive.');
        return;
      }
      
      const batch = writeBatch(db);
      
      if (archiveMode) {
        // Archive mode - mark documents as archived
        querySnapshot.forEach((document) => {
          const docRef = doc(db, 'gameResults', document.id);
          batch.update(docRef, { 
            archived: true,
            archivedAt: new Date().toISOString()
          });
        });
      } else {
        // Delete mode - remove documents completely
        querySnapshot.forEach((document) => {
          const docRef = doc(db, 'gameResults', document.id);
          batch.delete(docRef);
        });
      }
      
      await batch.commit();
      
      alert(archiveMode 
        ? `${querySnapshot.size} player records have been archived successfully` 
        : `${querySnapshot.size} player records have been deleted successfully`);
      
      // Call the callback to refresh the leaderboard
      if (onDataCleared) {
        onDataCleared();
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={clearData}
      disabled={isProcessing}
      className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isProcessing 
        ? 'Processing...' 
        : archiveMode ? 'Archive Players Data' : 'Clear Players Data'}
    </button>
  );
} 