import { Move } from 'chess.js';

export type GameMode = 'menu' | 'play' | 'review' | 'learn';

export interface AnalysisResult {
  score: number;
  bestMove: string;
  explanation: string;
  quality?: 'Best' | 'Good' | 'Inaccuracy' | 'Blunder' | 'Book';
}

export interface HistoryStep {
  fen: string;
  move: Move | null;
  analysis: AnalysisResult | null;
  turn: 'w' | 'b';
}

export interface LearningModule {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string;
}

export interface EngineResult {
    bestMove: string | null;
    evaluation: number;
}