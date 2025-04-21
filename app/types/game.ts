export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

export type Move = {
  index: number;
  score: number;
};

export type PlayerMove = {
  index: number;
  timestamp: number;
};

export type GameState = {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'Draw' | null;
  gameOver: boolean;
  moveHistory: {
    X: PlayerMove[];
    O: PlayerMove[];
  };
}; 