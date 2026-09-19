export enum GameState {
  GAME_READY = 0,
  GAME_START = 1,
  STATE_OVER = 2,
}

export enum BirdState {
  BIRD_NORMAL = 0,
  BIRD_UP = 1,
  BIRD_FALL = 2,
  BIRD_DEAD_FALL = 3,
  BIRD_DEAD = 4,
}

export enum PipeType {
  TYPE_TOP_NORMAL = 0,
  TYPE_TOP_HARD = 1,
  TYPE_BOTTOM_NORMAL = 2,
  TYPE_BOTTOM_HARD = 3,
  TYPE_HOVER_NORMAL = 4,
  TYPE_HOVER_HARD = 5,
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameStats {
  score: number;
  bestScore: number;
  gameState: GameState;
  gamesPlayed: number;
  soundEnabled: boolean;
}

export interface ScoreHistoryItem {
  id: string;
  score: number;
  date: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredScore?: number;
  requiredGames?: number;
  category: 'score' | 'games';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export type GameMode = 'arcade' | 'crash';

export type CrashRoundState = 'betting' | 'flying' | 'cashed_out' | 'crashed';

export interface CrashHistoryItem {
  id: string;
  multiplier: number;
  won: boolean;
  winAmountCents: number;
  betAmountCents: number;
  timestamp: string;
}

export type PilotMode = 'manual' | 'ai';
