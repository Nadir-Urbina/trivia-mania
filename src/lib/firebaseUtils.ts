import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

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

export const saveGameResult = async (result: GameResult) => {
  try {
    await addDoc(collection(db, 'gameResults'), {
      ...result,
      playedAt: Timestamp.now()
    });
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
    let constraints = [];
    
    if (daily) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      constraints.push(where('playedAt', '>=', today));
    }

    const q = query(
      collection(db, 'gameResults'),
      ...constraints,
      orderBy('score', 'desc'),
      orderBy('timeInSeconds', 'asc'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      playerName: doc.data().playerName,
      companyName: doc.data().companyName,
      score: doc.data().score,
      timeInSeconds: doc.data().timeInSeconds,
      playedAt: doc.data().playedAt.toDate(),
      ...doc.data()
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
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