import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

const cols = 20;
const rows = 20;
const normalSpeed = 120;
const fastSpeed = 40;

const getRandomFood = (snake) => {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
  } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
  return newFood;
};

const SnakeBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(${cols}, 20px);
  grid-template-rows: repeat(${rows}, 20px);
  background-color: ${({ theme }) => theme.colors.snake.background};
  gap: 1px;
`;

const Cell = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${({ $value, theme }) =>
    $value === 'snake'
      ? theme.colors.snake.snake
      : $value === 'food'
      ? theme.colors.snake.food
      : theme.colors.snake.background};
`;

const initialSnake = [
  { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
  { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
  { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) }
];

const Snake = () => {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(getRandomFood(initialSnake));
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [speed, setSpeed] = useState(normalSpeed);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Use ref to always get latest direction in tick
  const directionRef = useRef(direction);
  directionRef.current = direction;

  // Prevent 180-degree turns
  const lastDirectionRef = useRef(direction);

  // Pause/Restart handlers
  const handlePause = () => setPaused(p => !p);
  const handleRestart = () => {
    setSnake(initialSnake);
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    lastDirectionRef.current = { x: 1, y: 0 };
    setFood(getRandomFood(initialSnake));
    setSpeed(normalSpeed);
    setScore(0);
    setGameOver(false);
    setPaused(false);
  };

  // Main game loop
  useEffect(() => {
    if (gameOver || paused) return;
    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const dir = directionRef.current;
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        // Wall collision
        if (
          newHead.x < 0 || newHead.x >= cols ||
          newHead.y < 0 || newHead.y >= rows
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        let grow = (newHead.x === food.x && newHead.y === food.y);
        let newSnake = [newHead, ...prevSnake];
        if (!grow) {
          newSnake.pop();
        } else {
          setScore(s => s + 1);
          setFood(getRandomFood(newSnake));
        }
        return newSnake;
      });
      lastDirectionRef.current = directionRef.current;
    }, speed);
    return () => clearInterval(interval);
  }, [speed, gameOver, paused, food]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = e => {
      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', ' '].includes(e.key)
      ) e.preventDefault();
      if (gameOver) return;
      if (paused) return;

      let nextDir;
      switch (e.key) {
        case 'ArrowLeft':
          nextDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          nextDir = { x: 1, y: 0 };
          break;
        case 'ArrowUp':
          nextDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          nextDir = { x: 0, y: 1 };
          setSpeed(fastSpeed);
          break;
        case 'Escape':
          handlePause();
          return;
        case ' ':
          handleRestart();
          return;
        default:
          return;
      }
      // Prevent 180-degree turn
      const last = lastDirectionRef.current;
      if (nextDir && !(nextDir.x === -last.x && nextDir.y === -last.y)) {
        setDirection(nextDir);
        directionRef.current = nextDir;
      }
    };
    const handleKeyUp = e => {
      if (e.key === 'ArrowDown') setSpeed(normalSpeed);
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, paused]);

  return (
    <GameContainer>
      <h2>Snake</h2>
      <p>Score: {score}</p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <button onClick={handlePause}>{paused ? 'Resume' : 'Pause'}</button>
        <button onClick={handleRestart}>Restart</button>
      </div>
      {paused && <div style={{ color: 'orange', fontWeight: 'bold' }}>Paused</div>}
      <SnakeBoard>
        {Array.from({ length: rows }).map((_, y) =>
          Array.from({ length: cols }).map((__, x) => {
            const isSnake = snake.some(seg => seg.x === x && seg.y === y);
            const isFood = food.x === x && food.y === y;
            const cellValue = isSnake ? 'snake' : isFood ? 'food' : null;
            return <Cell key={`${x}-${y}`} $value={cellValue} />;
          })
        )}
      </SnakeBoard>
      {gameOver && (
        <div style={{ color: 'red', fontWeight: 'bold', marginTop: 16 }}>
          Game Over<br />
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
    </GameContainer>
  );
};

export default Snake;
