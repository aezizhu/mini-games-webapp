import React, { useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

// Helper to create the initial board
function createBoard() {
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill({ mine: false, revealed: false, flagged: false, adjacent: 0 }));
  // Place mines
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) {
      board[r][c] = { ...board[r][c], mine: true };
      placed++;
    }
  }
  // Calculate adjacent mine counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) count++;
        }
      }
      board[r][c] = { ...board[r][c], adjacent: count };
    }
  }
  return board;
}

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(${COLS}, 32px);
  grid-template-rows: repeat(${ROWS}, 32px);
  gap: 2px;
  background: #444;
  padding: 10px;
  border-radius: 8px;
`;

const Cell = styled.button`
  width: 32px;
  height: 32px;
  background: ${props => props.revealed ? '#ddd' : '#bbb'};
  border: 1px solid #888;
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => props.mine ? 'red' : '#333'};
  cursor: pointer;
  outline: none;
  user-select: none;
  &:active {
    filter: brightness(0.95);
  }
`;

const Status = styled.div`
  margin: 16px 0 8px 0;
  font-size: 1.2rem;
  font-weight: bold;
`;

function Minesweeper() {
  const [board, setBoard] = useState(() => createBoard());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flags, setFlags] = useState(0);

  function reveal(r, c) {
    if (gameOver || board[r][c].revealed || board[r][c].flagged) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    function flood(x, y) {
      if (x < 0 || x >= ROWS || y < 0 || y >= COLS) return;
      if (newBoard[x][y].revealed || newBoard[x][y].flagged) return;
      newBoard[x][y].revealed = true;
      if (newBoard[x][y].adjacent === 0 && !newBoard[x][y].mine) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx !== 0 || dy !== 0) flood(x + dx, y + dy);
          }
        }
      }
    }
    if (newBoard[r][c].mine) {
      newBoard[r][c].revealed = true;
      setBoard(newBoard);
      setGameOver(true);
      setWon(false);
      return;
    }
    flood(r, c);
    // Check win
    let safeCells = 0;
    for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) if (!newBoard[i][j].mine && !newBoard[i][j].revealed) safeCells++;
    if (safeCells === 0) {
      setGameOver(true);
      setWon(true);
    }
    setBoard(newBoard);
  }

  function toggleFlag(e, r, c) {
    e.preventDefault();
    if (gameOver || board[r][c].revealed) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[r][c].flagged = !newBoard[r][c].flagged;
    setBoard(newBoard);
    setFlags(f => newBoard[r][c].flagged ? f + 1 : f - 1);
  }

  function restart() {
    setBoard(createBoard());
    setGameOver(false);
    setWon(false);
    setFlags(0);
  }

  return (
    <GameContainer>
      <h2>Minesweeper</h2>
      <Status>
        {gameOver ? (won ? 'You Win! 🎉' : 'Game Over 💥') : `Mines: ${MINES - flags}`}
      </Status>
      <button onClick={restart} style={{ marginBottom: 8 }}>Restart</button>
      <Board>
        {board.map((row, r) => row.map((cell, c) => (
          <Cell
            key={r + '-' + c}
            revealed={cell.revealed}
            mine={cell.mine && cell.revealed}
            onClick={() => reveal(r, c)}
            onContextMenu={e => toggleFlag(e, r, c)}
            disabled={cell.revealed || gameOver}
          >
            {cell.revealed
              ? (cell.mine ? '💣' : (cell.adjacent > 0 ? cell.adjacent : ''))
              : (cell.flagged ? '🚩' : '')}
          </Cell>
        )))}
      </Board>
      <div style={{ marginTop: 12, color: '#888', fontSize: '0.95rem' }}>
        Left click: Reveal | Right click: Flag/Unflag
      </div>
    </GameContainer>
  );
}

export default Minesweeper;
