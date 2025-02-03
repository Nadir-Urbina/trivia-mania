export interface PlayerData {
  fullName: string;
  email: string;
  acknowledgeMarketing: boolean;
  lastPlayedAt?: Date;
}

export interface GameResult {
  playerEmail: string;
  playerName: string;
  score: number;
  timeInSeconds: number;
  playedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  timeInSeconds: number;
  playedAt: Date;
} 