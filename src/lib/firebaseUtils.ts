import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';

export interface PlayerData {
  fullName: string;
  email: string;
  companyName: string;
  role: string;
  acknowledgeMarketing?: boolean;
}

export interface GameResult {
  playerName: string;
  companyName: string;
  email: string;
  score: number;
  timeInSeconds: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  companyName: string;
  score: number;
  timeInSeconds: number;
  playedAt: Date;
}

export const savePlayerData = async (playerData: PlayerData) => {
  try {
    await addDoc(collection(db, 'players'), {
      ...playerData,
      lastPlayedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving player data:', error);
    throw error;
  }
};

export const saveGameResult = async (data: {
  playerName: string;
  companyName: string;
  email: string;
  score: number;
  timeInSeconds: number;
  archived?: boolean;
}) => {
  try {
    console.log('Saving game result:', data);
    
    const gameResultRef = collection(db, 'gameResults');
    const docRef = await addDoc(gameResultRef, {
      playerName: data.playerName,
      companyName: data.companyName,
      email: data.email,
      score: data.score,
      timeInSeconds: data.timeInSeconds,
      playedAt: serverTimestamp(),
      archived: false // Always set to false for new entries
    });
    
    console.log('Game result saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving game result:', error);
    throw error;
  }
};

export const canPlayerPlay = async (email: string): Promise<boolean> => {
  try {
    // Get the start of today (midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // First check the players collection
    const playersQuery = query(
      collection(db, 'players'),
      where('email', '==', email),
      where('lastPlayedAt', '>', startOfToday),
      limit(1)
    );

    const playersSnapshot = await getDocs(playersQuery);
    
    // If found in players collection, player already played today
    if (!playersSnapshot.empty) {
      return false;
    }

    // Also check the gameResults collection
    const gameResultsQuery = query(
      collection(db, 'gameResults'),
      where('email', '==', email),
      where('playedAt', '>', startOfToday),
      limit(1)
    );

    const gameResultsSnapshot = await getDocs(gameResultsQuery);
    
    // If found in either collection, player already played today
    return gameResultsSnapshot.empty;
  } catch (error) {
    console.error('Error checking player status:', error);
    throw error;
  }
};

export const getLeaderboard = async (
  daily: boolean = true, 
  archiveFilter: 'active' | 'archived' | 'all' = 'active',
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    console.log('Getting leaderboard, daily mode:', daily, 'archive filter:', archiveFilter, 'page:', page, 'pageSize:', pageSize);
    
    // Create a reference to the gameResults collection
    const gameResultsRef = collection(db, 'gameResults');
    
    // Base query without archive filtering
    let q;
    
    // Apply different query based on archive filter
    if (archiveFilter === 'all') {
      // Don't filter by archive status
      q = query(
        gameResultsRef,
        orderBy('score', 'desc')
      );
    } else {
      // Filter by specific archive status
      const isArchived = archiveFilter === 'archived';
      q = query(
        gameResultsRef,
        where('archived', '==', isArchived),
        orderBy('score', 'desc')
      );
    }
    
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} records for leaderboard`);
    
    // Get all documents
    let results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        playerName: data.playerName,
        companyName: data.companyName,
        score: data.score,
        timeInSeconds: data.timeInSeconds,
        playedAt: data.playedAt?.toDate(),
        archived: data.archived
      };
    });
    
    // If daily mode, filter in memory instead of in the query
    if (daily) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      results = results.filter(item => {
        return item.playedAt && item.playedAt >= today;
      });
    }
    
    // Sort by score and time
    results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeInSeconds - b.timeInSeconds;
    });
    
    // Total count before pagination
    const totalCount = results.length;
    
    // Apply pagination in memory
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = results.slice(startIndex, startIndex + pageSize);
    
    return {
      results: paginatedResults,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page
    };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return {
      results: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page
    };
  }
};

export const getAllPlayersData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'players'));
    return querySnapshot.docs.map(doc => ({
      fullName: doc.data().fullName,
      email: doc.data().email,
      companyName: doc.data().companyName,
      role: doc.data().role,
      lastPlayedAt: doc.data().lastPlayedAt?.toDate(),
      id: doc.id,
    }));
  } catch (error) {
    console.error('Error fetching players data:', error);
    throw error;
  }
};

export async function getArchivedPlayersData() {
  try {
    const q = query(
      collection(db, 'gameResults'),
      where('archived', '==', true),
      orderBy('archivedAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching archived players data:', error)
    return []
  }
} 