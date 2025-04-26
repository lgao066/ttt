# Tic Tac Toe with 4-Piece Limit

A modern implementation of Tic Tac Toe with a unique twist - each player can have a maximum of 4 pieces on the board. When a player places their 4th piece, if it doesn't create a winning combination, their oldest piece is removed.

## Features

- Single-player mode against an AI bot
- Two-player mode for local multiplayer
- Network play support for playing over local network
- 4-piece limit mechanic
- Modern UI with React and Tailwind CSS
- Responsive design for mobile and desktop

## Game Rules

1. Players take turns placing X's and O's on the board
2. Each player can have up to 4 pieces on the board
3. When placing a 4th piece:
   - If it creates a winning combination, that player wins
   - If not, their oldest piece is removed from the board
4. First player to get three in a row wins

## Technical Stack

- Next.js 15.3.1
- React 19
- TypeScript
- Tailwind CSS
- Turbopack

## Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/lgao/ttt.git
   cd ttt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the game:
   - Local: http://localhost:3001
   - Network: http://[your-ip]:3001

## Network Play

To play over the local network:
1. Start the server with `npm run dev`
2. Find your computer's IP address
3. On other devices in the same network, visit `http://[your-ip]:3001`

## Contributing

Feel free to submit issues and enhancement requests!
