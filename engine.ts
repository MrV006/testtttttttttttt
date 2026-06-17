import { Chess, Move } from 'chess.js';
import { PIECE_VALUES, MST, OPENING_BOOK } from './constants';
import { EngineResult } from './types';

// Utility to reverse array for black
const reverseArray = (arr: number[][]) => arr.slice().reverse();

const evaluateBoard = (game: Chess): number => {
  let totalEvaluation = 0;
  const board = game.board();

  // Basic Material and Position
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = PIECE_VALUES[piece.type] || 0;
        
        // Position bonus (simplified)
        let positionBonus = 0;
        if (piece.type === 'p') {
          positionBonus = piece.color === 'w' ? MST.p[i][j] : reverseArray(MST.p)[i][j];
        } else if (piece.type === 'n') {
          positionBonus = piece.color === 'w' ? MST.n[i][j] : reverseArray(MST.n)[i][j];
        } else {
             // Central control bonus for others
             if (i > 2 && i < 5 && j > 2 && j < 5) positionBonus = 10;
        }

        totalEvaluation += piece.color === 'w' ? (value + positionBonus) : -(value + positionBonus);
      }
    }
  }

  // Bonus for castling rights and king safety
  // (Simplified for performance)
  
  return totalEvaluation;
};

// Minimax with Alpha-Beta Pruning
const minimax = (
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number => {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  const moves = game.moves();

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getBestMove = (game: Chess, depth: number = 3): EngineResult => {
  // 1. Check Opening Book
  const fen = game.fen();
  if (OPENING_BOOK[fen]) {
    const bookMoves = OPENING_BOOK[fen];
    const randomMove = bookMoves[Math.floor(Math.random() * bookMoves.length)];
    return { bestMove: randomMove, evaluation: 0 };
  }

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return { bestMove: null, evaluation: 0 };

  // Sort moves to improve Alpha-Beta pruning (captures first)
  moves.sort((a, b) => {
      const scoreA = (a.flags.includes('c') ? 10 : 0) + (a.flags.includes('p') ? 5 : 0);
      const scoreB = (b.flags.includes('c') ? 10 : 0) + (b.flags.includes('p') ? 5 : 0);
      return scoreB - scoreA;
  });

  let bestMoveFound: string | null = null;
  let bestValue = game.turn() === 'w' ? -Infinity : Infinity;

  // We loop here to get the move string associated with the best value
  for (const move of moves) {
    game.move(move.san);
    const boardValue = minimax(game, depth - 1, -Infinity, Infinity, game.turn() === 'w');
    game.undo();

    if (game.turn() === 'w') {
      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMoveFound = move.san;
      }
    } else {
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMoveFound = move.san;
      }
    }
  }

  return {
    bestMove: bestMoveFound || moves[0].san,
    evaluation: bestValue
  };
};

export const analyzeMoveQuality = (
    prevFen: string, 
    playedMoveSan: string, 
    bestMoveSan: string
): { quality: 'Best' | 'Good' | 'Inaccuracy' | 'Blunder' | 'Book'; scoreDiff: number } => {
    if (playedMoveSan === bestMoveSan) return { quality: 'Best', scoreDiff: 0 };

    const game = new Chess(prevFen);
    
    // Eval best move
    game.move(bestMoveSan);
    const bestEval = evaluateBoard(game);
    game.undo();

    // Eval played move
    try {
        game.move(playedMoveSan);
        const playedEval = evaluateBoard(game);
        game.undo();

        // Calculate diff (absolute value because perspective depends on turn)
        const turnMultiplier = game.turn() === 'w' ? 1 : -1;
        const diff = (bestEval - playedEval) * turnMultiplier;

        if (diff < 20) return { quality: 'Good', scoreDiff: diff };
        if (diff < 100) return { quality: 'Inaccuracy', scoreDiff: diff };
        return { quality: 'Blunder', scoreDiff: diff };
    } catch (e) {
        return { quality: 'Blunder', scoreDiff: 1000 };
    }
};

export const generateExplanation = (
    game: Chess, 
    move: Move | null, 
    quality: string
): string => {
    if (!move) return 'بازی شروع شد.';
    
    const isCheck = game.inCheck();
    const isMate = game.isCheckmate();
    const pieceName = getPieceName(move.piece);
    const captured = move.captured ? ` و ${getPieceName(move.captured)} حریف را زد` : '';
    
    let text = `${quality === 'Best' ? 'حرکت عالی!' : quality === 'Blunder' ? 'اشتباه بزرگ!' : ''} `;
    text += `${pieceName} به خانه ${move.to} رفت${captured}.`;

    if (isMate) return text + " مات! بازی تمام شد.";
    if (isCheck) return text + " کیش!";
    
    if (move.flags.includes('k') || move.flags.includes('q')) return text + " شاه قلعه‌گیری کرد تا امنیت بیشتری داشته باشد.";
    if (quality === 'Blunder') return text + " این حرکت باعث از دست دادن برتری یا مهره می‌شود.";
    if (quality === 'Best') return text + " این بهترین پاسخ ممکن در این وضعیت بود.";

    // Simple positional reasoning
    if ((move.to === 'e4' || move.to === 'd4' || move.to === 'e5' || move.to === 'd5') && !move.captured) {
        return text + " کنترل مرکز صفحه را در دست گرفت.";
    }

    return text;
};

const getPieceName = (p: string) => {
    switch(p) {
        case 'p': return 'سرباز';
        case 'r': return 'رخ';
        case 'n': return 'اسب';
        case 'b': return 'فیل';
        case 'q': return 'وزیر';
        case 'k': return 'شاه';
        default: return 'مهره';
    }
}
