import { Board, Player, Move } from '../types/game';

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal
  [2, 4, 6], // Diagonal
];

export const checkWinner = (board: Board): Player | null => {
  // Check for winner
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

export const getEmptySquares = (board: Board): number[] => {
  return board.reduce<number[]>((acc, cell, idx) => {
    if (cell === null) acc.push(idx);
    return acc;
  }, []);
};

export const getPlayerPieces = (board: Board, player: Player): number[] => {
  return board.reduce<number[]>((acc, cell, idx) => {
    if (cell === player) acc.push(idx);
    return acc;
  }, []);
};

const MAX_DEPTH = 5;
const MAX_PIECES = 4;

export const minimax = (
  board: Board,
  player: Player,
  depth: number = 0,
  isMaximizing: boolean = true,
  alpha: number = -Infinity,
  beta: number = Infinity
): Move => {
  const winner = checkWinner(board);
  
  // Base cases
  if (winner === 'X') return { index: -1, score: -10 + depth };
  if (winner === 'O') return { index: -1, score: 10 - depth };
  if (depth >= MAX_DEPTH) return { index: -1, score: 0 };

  const currentPlayer = isMaximizing ? 'O' : 'X';
  const playerPieces = getPlayerPieces(board, currentPlayer);
  const emptySquares = getEmptySquares(board);
  let bestMove: Move = { index: -1, score: isMaximizing ? -Infinity : Infinity };

  // If we have less than MAX_PIECES pieces, just place a new one
  if (playerPieces.length < MAX_PIECES) {
    for (const index of emptySquares) {
      board[index] = currentPlayer;
      const score = minimax(board, player, depth + 1, !isMaximizing, alpha, beta).score;
      board[index] = null;

      if (isMaximizing && score > bestMove.score) {
        bestMove = { index, score };
        alpha = Math.max(alpha, score);
      } else if (!isMaximizing && score < bestMove.score) {
        bestMove = { index, score };
        beta = Math.min(beta, score);
      }

      if (beta <= alpha) break;
    }
  }
  // If we have MAX_PIECES pieces and no win, we need to move the oldest piece
  // The actual removal of the oldest piece is handled in the Game component
  // Here we just consider placing in empty squares
  else {
    for (const newIndex of emptySquares) {
      board[newIndex] = currentPlayer;
      const score = minimax(board, player, depth + 1, !isMaximizing, alpha, beta).score;
      board[newIndex] = null;

      if (isMaximizing && score > bestMove.score) {
        bestMove = { index: newIndex, score };
        alpha = Math.max(alpha, score);
      } else if (!isMaximizing && score < bestMove.score) {
        bestMove = { index: newIndex, score };
        beta = Math.min(beta, score);
      }

      if (beta <= alpha) break;
    }
  }

  return bestMove;
};

export const getBotMove = (board: Board): number => {
  const move = minimax(board, 'O');
  return move.index === -1 ? getEmptySquares(board)[0] : move.index;
}; 