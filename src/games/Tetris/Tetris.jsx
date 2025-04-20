import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

const width = 10;
const height = 20;

// Tetris shapes
const TETROMINOS = {
  I: [
    [0, 'I', 0, 0],
    [0, 'I', 0, 0],
    [0, 'I', 0, 0],
    [0, 'I', 0, 0]
  ],
  J: [
    [0, 'J', 0],
    [0, 'J', 0],
    ['J', 'J', 0]
  ],
  L: [
    [0, 'L', 0],
    [0, 'L', 0],
    [0, 'L', 'L']
  ],
  O: [
    ['O', 'O'],
    ['O', 'O']
  ],
  S: [
    [0, 'S', 'S'],
    ['S', 'S', 0]
  ],
  T: [
    [0, 'T', 0],
    ['T', 'T', 'T']
  ],
  Z: [
    ['Z', 'Z', 0],
    [0, 'Z', 'Z']
  ]
};

// Random tetromino
const randomTetromino = () => {
  const keys = Object.keys(TETROMINOS);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return { key: randKey, shape: TETROMINOS[randKey] };
};

// Rotate matrix
const rotate = (matrix) =>
  matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());

// Check collision
const checkCollision = (grid, shape, { x, y }) => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newY = y + row;
        const newX = x + col;
        if (
          newX < 0 ||
          newX >= width ||
          newY >= height ||
          (newY >= 0 && grid[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

const TetrisBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(${width}, 30px);
  grid-template-rows: repeat(${height}, 30px);
  background-color: ${({ theme }) => theme.colors.tetris.background};
  border: 2px solid ${({ theme }) => theme.colors.tetris.grid};
`;

const Cell = styled.div`
  width: 30px;
  height: 30px;
  background-color: ${({ $value, theme }) =>
    $value ? theme.colors.tetris[$value.toLowerCase()] : theme.colors.tetris.grid};
`;

const Tetris = () => {
  const [grid, setGrid] = useState(
    Array.from({ length: height }, () => Array(width).fill(0))
  );
  const [current, setCurrent] = useState(randomTetromino());
  const [position, setPosition] = useState({ x: 3, y: 0 });
  // Drop timing for Tetris
  const normalDropTime = 1000;
  const fastDropTime = 50;
  const [dropTime, setDropTime] = useState(normalDropTime);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);

  // Merge and clear
  const mergeAndClear = (newGrid) => {
    let cleared = 0;
    const resultGrid = newGrid.reduce((acc, row) => {
      if (row.every(cell => cell)) {
        cleared++;
        acc.unshift(Array(width).fill(0));
      } else {
        acc.push(row);
      }
      return acc;
    }, []);
    if (cleared) setScore(prev => prev + cleared * 100);
    setGrid(resultGrid);
  };

  // Drop piece
  const drop = () => {
    if (!checkCollision(grid, current.shape, { x: position.x, y: position.y + 1 })) {
      setPosition(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      // merge
      const newGrid = grid.map(row => [...row]);
      current.shape.forEach((rowArr, r) =>
        rowArr.forEach((cell, c) => {
          if (cell) {
            const newY = position.y + r;
            const newX = position.x + c;
            if (newY >= 0) {
              newGrid[newY][newX] = current.key;
            }
          }
        })
      );
      mergeAndClear(newGrid);
      const next = randomTetromino();
      setCurrent(next);
      setPosition({ x: 3, y: 0 });

      // Check if the new piece would immediately collide (game over)
      // Check if any of the top rows are filled, which would cause collision with new piece
      const topRowsFilled = newGrid.slice(0, 2).some(row => row.some(cell => cell));
      
      if (topRowsFilled) {
        console.log("Game over detected: pieces reached top of board");
        setGameOver(true);
        setDropTime(null);
      }
    }
  };

  // Pause and restart controls
  const handlePause = () => setPaused(p => !p);
  const handleRestart = () => {
    setGrid(Array.from({ length: height }, () => Array(width).fill(0)));
    setCurrent(randomTetromino());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setDropTime(normalDropTime);
  };

  useEffect(() => {
    if (dropTime && !gameOver && !paused) {
      const timer = setInterval(drop, dropTime);
      return () => clearInterval(timer);
    }
  }, [dropTime, current, position, grid, gameOver, paused]);

  useEffect(() => {
    let dropTimeout;
    const handleKeyDown = (e) => {
      if ([
        'ArrowLeft',
        'ArrowRight',
        'ArrowDown',
        'ArrowUp',
        'Escape',
        ' ' // Spacebar
      ].includes(e.key)) e.preventDefault();
      if (gameOver) return;
      if (paused) return;
      switch (e.key) {
        case 'ArrowLeft':
          if (!checkCollision(grid, current.shape, { x: position.x - 1, y: position.y })) {
            setPosition(prev => ({ ...prev, x: prev.x - 1 }));
          }
          break;
        case 'ArrowRight':
          if (!checkCollision(grid, current.shape, { x: position.x + 1, y: position.y })) {
            setPosition(prev => ({ ...prev, x: prev.x + 1 }));
          }
          break;
        case 'ArrowDown':
          setDropTime(fastDropTime);
          break;
        case 'ArrowUp':
          const rotated = rotate(current.shape);
          if (!checkCollision(grid, rotated, { x: position.x, y: position.y })) {
            setCurrent(prev => ({ ...prev, shape: rotated }));
            // Immediately drop one row on rotation to prevent stalling
            drop();
          }
          break;
        case 'Escape':
          handlePause();
          break;
        case ' ':
          handleRestart();
          break;
        default:
          break;
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown') {
        setDropTime(normalDropTime);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (dropTimeout) clearTimeout(dropTimeout);
    };
  }, [current, position, grid, gameOver, paused]);

  // Prepare grid with current tetromino overlay
  const displayGrid = grid.map(row => [...row]);
  current.shape.forEach((rowArr, r) =>
    rowArr.forEach((val, c) => {
      if (val) {
        const y = position.y + r;
        const x = position.x + c;
        if (y >= 0 && y < height && x >= 0 && x < width) {
          displayGrid[y][x] = current.key;
        }
      }
    })
  );

  return (
    <GameContainer>
      <h2>Tetris</h2>
      <p>Score: {score}</p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <button onClick={handlePause}>{paused ? 'Resume' : 'Pause'}</button>
        <button onClick={handleRestart}>Restart</button>
      </div>
      {paused && <div style={{ color: 'orange', fontWeight: 'bold' }}>Paused</div>}
      <TetrisBoard>
        {displayGrid.map((row, y) =>
          row.map((cell, x) => <Cell key={`${y}-${x}`} $value={cell} />)
        )}
      </TetrisBoard>
      {gameOver && (
        <div style={{ color: 'red', fontWeight: 'bold', marginTop: 16 }}>
          Game Over<br />
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
    </GameContainer>
  );
};

export default Tetris;
