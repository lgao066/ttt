import { Board, Player, Move, PlayerMove } from '../types/game';

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

// Get all potential winning lines that include a specific square
const getWinningLinesForSquare = (square: number): number[][] => {
  return WINNING_COMBINATIONS.filter(combo => combo.includes(square));
};

export const checkWinner = (board: Board): Player | null => {
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

const MAX_DEPTH = 7; // Increased depth for better lookahead
const MAX_PIECES = 4;

type GameHistory = {
  X: PlayerMove[];
  O: PlayerMove[];
};

// Check if a move would create a fork (multiple winning opportunities)
const countWinningOpportunities = (board: Board, player: Player): number => {
  let opportunities = 0;
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    const line = [board[a], board[b], board[c]];
    const playerCount = line.filter(cell => cell === player).length;
    const emptyCount = line.filter(cell => cell === null).length;
    if (playerCount === 2 && emptyCount === 1) {
      opportunities++;
    }
  }
  return opportunities;
};

// Check if a position is part of multiple potential winning lines
const getPositionStrategicValue = (board: Board, position: number, player: Player): number => {
  let value = 0;
  const winningLines = getWinningLinesForSquare(position);
  
  for (const line of winningLines) {
    const [a, b, c] = line;
    const lineContents = [board[a], board[b], board[c]];
    const playerCount = lineContents.filter(cell => cell === player).length;
    const opponentCount = lineContents.filter(cell => cell !== null && cell !== player).length;
    
    if (opponentCount === 0) value += playerCount + 1; // Potential winning line
    if (playerCount === 0 && opponentCount === 2) value += 5; // Must block
  }
  
  return value;
};

const evaluateBoard = (
  board: Board,
  depth: number,
  history: GameHistory,
  currentPlayer: Player
): number => {
  const winner = checkWinner(board);
  if (winner === 'O') return 1000 - depth;
  if (winner === 'X') return -1000 + depth;

  let score = 0;
  const botPieces = getPlayerPieces(board, 'O');
  const playerPieces = getPlayerPieces(board, 'X');

  // Evaluate immediate threats and opportunities
  const botWinOpportunities = countWinningOpportunities(board, 'O');
  const playerWinOpportunities = countWinningOpportunities(board, 'X');
  
  score += botWinOpportunities * 15;
  score -= playerWinOpportunities * 20; // Prioritize blocking opponent's opportunities

  // Evaluate each position's strategic value
  for (let i = 0; i < 9; i++) {
    if (board[i] === 'O') {
      score += getPositionStrategicValue(board, i, 'O');
    } else if (board[i] === 'X') {
      score -= getPositionStrategicValue(board, i, 'X');
    }
  }

  // Consider piece age and position
  if (history.O.length > 0) {
    const oldestBotPiece = history.O[0].index;
    const newestBotPiece = history.O[history.O.length - 1].index;
    
    // Protect newer pieces in strategic positions
    if (board[4] === 'O' && newestBotPiece === 4) score += 8;
    if ([0, 2, 6, 8].includes(newestBotPiece) && board[newestBotPiece] === 'O') score += 5;
    
    // Consider moving older pieces from weak positions
    if (oldestBotPiece !== 4 && ![0, 2, 6, 8].includes(oldestBotPiece)) {
      const oldPieceValue = getPositionStrategicValue(board, oldestBotPiece, 'O');
      if (oldPieceValue < 2) score -= 3; // Encourage moving weak pieces
    }
  }

  // Counter opponent's strategy
  if (history.X.length > 0) {
    const playerNewestPiece = history.X[history.X.length - 1].index;
    const playerNewestValue = getPositionStrategicValue(board, playerNewestPiece, 'X');
    if (playerNewestValue > 3) score -= 10; // Strongly consider countering strong opponent moves
  }

  // Piece formation evaluation
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    const line = [board[a], board[b], board[c]];
    const oCount = line.filter(cell => cell === 'O').length;
    const xCount = line.filter(cell => cell === 'X').length;
    const emptyCount = line.filter(cell => cell === null).length;

    // Stronger defensive scoring
    if (xCount === 2 && emptyCount === 1) score -= 25;
    if (xCount === 3) score -= 50;
    
    // Offensive scoring
    if (oCount === 2 && emptyCount === 1) score += 20;
    if (oCount === 3) score += 40;
  }

  return score;
};

export const minimax = (
  board: Board,
  player: Player,
  history: GameHistory,
  depth: number = 0,
  isMaximizing: boolean = true,
  alpha: number = -Infinity,
  beta: number = Infinity
): Move => {
  // Base cases
  if (checkWinner(board) || depth >= MAX_DEPTH) {
    return { index: -1, score: evaluateBoard(board, depth, history, player) };
  }

  const currentPlayer = isMaximizing ? 'O' : 'X';
  const playerPieces = getPlayerPieces(board, currentPlayer);
  const emptySquares = getEmptySquares(board);
  let bestMove: Move = { index: -1, score: isMaximizing ? -Infinity : Infinity };

  // Early game strategy
  if (depth === 0) {
    // Take center if available
    if (board[4] === null) return { index: 4, score: 100 };
    
    // If opponent has center, take a corner
    if (board[4] === 'X') {
      for (const corner of [0, 2, 6, 8]) {
        if (board[corner] === null) return { index: corner, score: 80 };
      }
    }
  }

  // Sort moves by preliminary evaluation for better alpha-beta pruning
  const moveScores = emptySquares.map(index => ({
    index,
    score: getPositionStrategicValue(board, index, currentPlayer)
  }));
  
  if (isMaximizing) {
    moveScores.sort((a, b) => b.score - a.score);
  } else {
    moveScores.sort((a, b) => a.score - b.score);
  }

  // If we have less than MAX_PIECES pieces, consider placing a new one
  if (playerPieces.length < MAX_PIECES) {
    for (const { index } of moveScores) {
      board[index] = currentPlayer;
      const newHistory = {
        ...history,
        [currentPlayer]: [...history[currentPlayer], { index, timestamp: Date.now() }]
      };
      
      const score = minimax(board, player, newHistory, depth + 1, !isMaximizing, alpha, beta).score;
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
  } else {
    // Sort pieces by strategic value for smarter piece movement
    const piecesToConsiderMoving = [...history[currentPlayer]]
      .sort((a, b) => {
        const valueA = getPositionStrategicValue(board, a.index, currentPlayer);
        const valueB = getPositionStrategicValue(board, b.index, currentPlayer);
        return valueA - valueB; // Move least valuable pieces first
      })
      .map(move => move.index)
      .filter(index => board[index] === currentPlayer);

    for (const oldIndex of piecesToConsiderMoving) {
      for (const { index: newIndex } of moveScores) {
        board[oldIndex] = null;
        board[newIndex] = currentPlayer;
        
        const newHistory = {
          ...history,
          [currentPlayer]: history[currentPlayer].map(move =>
            move.index === oldIndex ? { ...move, index: newIndex } : move
          )
        };
        
        const score = minimax(board, player, newHistory, depth + 1, !isMaximizing, alpha, beta).score;
        
        board[oldIndex] = currentPlayer;
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
  }

  return bestMove;
};

export const getBotMove = (board: Board, history: GameHistory): number => {
  // First, check if we can win immediately
  const botPieces = getPlayerPieces(board, 'O');
  const emptySquares = getEmptySquares(board);
  
  // Check for immediate win
  for (const index of emptySquares) {
    const testBoard = [...board];
    testBoard[index] = 'O';
    if (checkWinner(testBoard) === 'O') {
      return index;
    }
  }
  
  // Check for necessary blocks
  for (const index of emptySquares) {
    const testBoard = [...board];
    testBoard[index] = 'X';
    if (checkWinner(testBoard) === 'X') {
      return index;
    }
  }

  // If no immediate win or necessary block, use minimax
  const move = minimax(board, 'O', history);
  if (move.index === -1) {
    // Fallback strategy if no good move found
    const preferredMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (const index of preferredMoves) {
      if (board[index] === null) return index;
    }
    return emptySquares[0];
  }
  return move.index;
}; 