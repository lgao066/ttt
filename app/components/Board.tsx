'use client';

import { Board as BoardType } from '../types/game';
import Square from './Square';
import { WINNING_COMBINATIONS } from '../utils/gameLogic';

interface BoardProps {
  board: BoardType;
  onSquareClick: (index: number) => void;
  winningCombination: number[] | null;
}

const Board: React.FC<BoardProps> = ({ board, onSquareClick, winningCombination }) => {
  const renderSquare = (index: number) => {
    const isWinningSquare = winningCombination?.includes(index) || false;
    
    return (
      <Square
        key={index}
        value={board[index]}
        onClick={() => onSquareClick(index)}
        isWinningSquare={isWinningSquare}
      />
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2 max-w-[400px]">
      {board.map((_, index) => renderSquare(index))}
    </div>
  );
};

export default Board; 