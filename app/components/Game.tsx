'use client';

import { useState, useEffect } from 'react';
import { GameState, Player, PlayerMove } from '../types/game';
import Board from './Board';
import { checkWinner, getBotMove, WINNING_COMBINATIONS } from '../utils/gameLogic';

const MAX_PIECES = 4;

type GameMode = 'single' | 'two-player';

const Game: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    gameOver: false,
    moveHistory: {
      X: [],
      O: [],
    },
  });

  const [winningCombination, setWinningCombination] = useState<number[] | null>(null);

  useEffect(() => {
    // Bot's turn in single-player mode
    if (gameMode === 'single' && gameState.currentPlayer === 'O' && !gameState.gameOver) {
      console.log('Bot is thinking...'); // Debug log
      const timeoutId = setTimeout(() => {
        const botMove = getBotMove([...gameState.board]);
        console.log('Bot chose move:', botMove); // Debug log
        if (botMove !== -1) {
          handleMove(botMove);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState.currentPlayer, gameState.gameOver, gameMode]);

  const findWinningCombination = (board: (Player | null)[]): number[] | null => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return combination;
      }
    }
    return null;
  };

  const handleMove = (index: number) => {
    // Prevent moves if game mode is not selected
    if (!gameMode) return;
    
    // In single-player mode, prevent player from making moves for O
    if (gameMode === 'single' && gameState.currentPlayer === 'O') return;
    
    if (gameState.board[index] || gameState.gameOver) return;

    const newBoard = [...gameState.board];
    const currentPlayerMoves = [...gameState.moveHistory[gameState.currentPlayer]];
    
    // Add the new piece
    const newMove: PlayerMove = {
      index,
      timestamp: Date.now(),
    };
    newBoard[index] = gameState.currentPlayer;
    currentPlayerMoves.push(newMove);

    // Check for winner after placing the piece
    const winner = checkWinner(newBoard);
    const winCombo = winner ? findWinningCombination(newBoard) : null;

    // If we have 4 pieces and no winner, remove the oldest piece
    if (currentPlayerMoves.length > MAX_PIECES - 1 && !winner) {
      const oldestMove = currentPlayerMoves[0];
      newBoard[oldestMove.index] = null;
      currentPlayerMoves.shift();
    }
    
    setWinningCombination(winCombo);
    setGameState(prevState => ({
      board: newBoard,
      currentPlayer: prevState.currentPlayer === 'X' ? 'O' : 'X',
      winner,
      gameOver: winner !== null,
      moveHistory: {
        ...prevState.moveHistory,
        [prevState.currentPlayer]: currentPlayerMoves,
      },
    }));
  };

  const resetGame = () => {
    setGameState({
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      gameOver: false,
      moveHistory: {
        X: [],
        O: [],
      },
    });
    setWinningCombination(null);
  };

  const getGameStatus = () => {
    if (gameState.winner) {
      return `Player ${gameState.winner} wins!`;
    } else {
      const modeText = gameMode === 'single' ? 
        (gameState.currentPlayer === 'X' ? 'Your turn' : "Bot's turn") :
        `Player ${gameState.currentPlayer}'s turn`;
      return modeText;
    }
  };

  if (!gameMode) {
    return (
      <div className="flex flex-col items-center gap-8 p-8">
        <h1 className="text-4xl font-bold text-gray-800">Tic Tac Toe</h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setGameMode('single')}
            className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg
              hover:bg-blue-700 transition-colors duration-200 min-w-[200px]"
          >
            Play vs Bot
          </button>
          <button
            onClick={() => setGameMode('two-player')}
            className="px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg
              hover:bg-green-700 transition-colors duration-200 min-w-[200px]"
          >
            Two Players
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-gray-800">Tic Tac Toe</h1>
      <div className="text-xl font-semibold text-gray-700">{getGameStatus()}</div>
      <Board
        board={gameState.board}
        onSquareClick={handleMove}
        winningCombination={winningCombination}
      />
      <div className="flex gap-4">
        <button
          onClick={resetGame}
          className="px-6 py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg
            hover:bg-blue-700 transition-colors duration-200"
        >
          New Game
        </button>
        <button
          onClick={() => {
            setGameMode(null);
            resetGame();
          }}
          className="px-6 py-2 text-lg font-semibold text-white bg-gray-600 rounded-lg
            hover:bg-gray-700 transition-colors duration-200"
        >
          Change Mode
        </button>
      </div>
    </div>
  );
};

export default Game; 