import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

const cols = 20;
const rows = 20;
const initialSpeed = 200;

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

const Snake = () => {
  const initialSnake = [
    { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) },
  ];

  const [snake, setSnake] = useState(initialSnake);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(getRandomFood(initialSnake));
  const [speed, setSpeed] = useState(initialSpeed);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const handlePause = () => setPaused(p => !p);
  const handleRestart = () => {
    setSnake(initialSnake);
    setDirection({ x: 1, y: 0 });
    setFood(getRandomFood(initialSnake));
    setSpeed(initialSpeed);
    setScore(0);
    setGameOver(false);
    setPaused(false);
  };

  const moveSnake = useCallback(() => {
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= cols ||
      newHead.y < 0 ||
      newHead.y >= rows
    ) {
      setGameOver(true);
      setSpeed(null);
      return;
    }

    // Self collision
    if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      setGameOver(true);
      setSpeed(null);
      return;
    }

    let newSnake = [newHead, ...snake];
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore(s => s + 1);
      setFood(getRandomFood(newSnake));
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  }, [snake, direction, food]);

  // Game loop
  useEffect(() => {
    if (speed && !gameOver && !paused) {
      const timer = setInterval(moveSnake, speed);
      return () => clearInterval(timer);
    }
  }, [moveSnake, speed, gameOver, paused]);

  // Controls
  useEffect(() => {
    const handleKeyDown = e => {
      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', ' '].includes(
          e.key
        )
      ) e.preventDefault();
      if (gameOver) return;
      if (paused) return;

      switch (e.key) {
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
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
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, paused]);

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
