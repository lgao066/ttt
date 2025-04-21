'use client';

import { Cell } from '../types/game';

interface SquareProps {
  value: Cell;
  onClick: () => void;
  isWinningSquare?: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare = false }) => {
  return (
    <button
      className={`w-20 h-20 border-2 border-gray-300 text-4xl font-bold flex items-center justify-center
        transition-colors duration-200 hover:bg-gray-100
        ${isWinningSquare ? 'bg-green-200 hover:bg-green-300' : 'bg-white'}
        ${value === 'X' ? 'text-blue-600' : 'text-red-600'}`}
      onClick={onClick}
      disabled={value !== null}
    >
      {value}
    </button>
  );
};

export default Square; 