import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';

export interface PlayerData {
  fullName: string;
  email: string;
  companyName: string;
  role: string;
}

export interface GameResult {
  playerName: string;
  companyName: string;
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
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const q = query(
      collection(db, 'players'),
      where('email', '==', email),
      where('lastPlayedAt', '>', oneHourAgo),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // If empty, player can play
  } catch (error) {
    console.error('Error checking player status:', error);
    throw error;
  }
};

export const getLeaderboard = async (daily: boolean = true) => {
  try {
    console.log('Getting leaderboard, daily mode:', daily);
    
    // Create a reference to the gameResults collection
    const gameResultsRef = collection(db, 'gameResults');
    
    // Simplify the query to just filter by archived status
    const q = query(
      gameResultsRef,
      where('archived', '==', false),
      orderBy('score', 'desc'),
      limit(20)
    );
    
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
    
    return results;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
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