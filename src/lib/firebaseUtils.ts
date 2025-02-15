import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { PlayerData, GameResult, LeaderboardEntry } from '../types';

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