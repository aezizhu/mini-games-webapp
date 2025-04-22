import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

// Table and game constants
const WIDTH = 400;
const HEIGHT = 600;
const BALL_RADIUS = 10;
const FLIPPER_LENGTH = 60;
const FLIPPER_WIDTH = 12;
const FLIPPER_Y = HEIGHT - 60;
const FLIPPER_ANGLE = Math.PI / 6; // 30 deg
const FLIPPER_SPEED = 0.25; // radians per frame
const BUMPER_RADIUS = 22;
const BUMPER_POINTS = 100;

const bumpers = [
  { x: 120, y: 180 },
  { x: 280, y: 180 },
  { x: 200, y: 120 }
];

const PinballCanvas = styled.canvas`
  background: radial-gradient(circle at 50% 30%, #e0e0e0 60%, #888 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px #2228;
  display: block;
  margin: 0 auto;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 12px 0;
`;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function PinballGame() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ball, setBall] = useState({ x: WIDTH / 2, y: HEIGHT - 80, vx: 0, vy: 0 });
  const [flippers, setFlippers] = useState({ left: 0, right: 0 }); // angle offset
  const [flipperState, setFlipperState] = useState({ left: false, right: false });
  const [lost, setLost] = useState(false);

  // Launch the ball
  function launchBall() {
    setBall({ x: WIDTH / 2, y: HEIGHT - 80, vx: (Math.random() - 0.5) * 2, vy: -7 });
    setPlaying(true);
    setLost(false);
    setScore(0);
  }

  // Flipper controls
  useEffect(() => {
    function handleKey(e) {
      if (e.code === 'ArrowLeft') setFlipperState(s => ({ ...s, left: e.type === 'keydown' }));
      if (e.code === 'ArrowRight') setFlipperState(s => ({ ...s, right: e.type === 'keydown' }));
      if (e.code === 'Space' && !playing) launchBall();
    }
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, [playing]);

  // Main game loop
  useEffect(() => {
    if (!playing) return;
    let animation;
    function loop() {
      setBall(ball => {
        let { x, y, vx, vy } = ball;
        // Gravity
        vy += 0.18;
        // Move
        x += vx;
        y += vy;
        // Wall collisions
        if (x < BALL_RADIUS) { x = BALL_RADIUS; vx = -vx * 0.9; }
        if (x > WIDTH - BALL_RADIUS) { x = WIDTH - BALL_RADIUS; vx = -vx * 0.9; }
        if (y < BALL_RADIUS) { y = BALL_RADIUS; vy = -vy * 0.9; }
        // Flipper collision (simple)
        // Left flipper
        let leftFlipperX = WIDTH / 2 - 60;
        let leftFlipperA = -FLIPPER_ANGLE + (flipperState.left ? FLIPPER_ANGLE : 0);
        let lfX2 = leftFlipperX + FLIPPER_LENGTH * Math.cos(leftFlipperA);
        let lfY2 = FLIPPER_Y + FLIPPER_LENGTH * Math.sin(leftFlipperA);
        if (y > FLIPPER_Y - 8 && x > leftFlipperX - 8 && x < lfX2 + 8 && vy > 0) {
          vy = -Math.abs(vy) * 0.85 - (flipperState.left ? 2.5 : 0);
          vx += (flipperState.left ? -1.5 : -0.4);
          y = FLIPPER_Y - BALL_RADIUS;
        }
        // Right flipper
        let rightFlipperX = WIDTH / 2 + 60;
        let rightFlipperA = Math.PI + FLIPPER_ANGLE - (flipperState.right ? FLIPPER_ANGLE : 0);
        let rfX2 = rightFlipperX + FLIPPER_LENGTH * Math.cos(rightFlipperA);
        let rfY2 = FLIPPER_Y + FLIPPER_LENGTH * Math.sin(rightFlipperA);
        if (y > FLIPPER_Y - 8 && x < rightFlipperX + 8 && x > rfX2 - 8 && vy > 0) {
          vy = -Math.abs(vy) * 0.85 - (flipperState.right ? 2.5 : 0);
          vx += (flipperState.right ? 1.5 : 0.4);
          y = FLIPPER_Y - BALL_RADIUS;
        }
        // Bumper collisions
        bumpers.forEach(({ x: bx, y: by }) => {
          let dx = x - bx, dy = y - by;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < BALL_RADIUS + BUMPER_RADIUS) {
            let angle = Math.atan2(dy, dx);
            x = bx + Math.cos(angle) * (BALL_RADIUS + BUMPER_RADIUS);
            y = by + Math.sin(angle) * (BALL_RADIUS + BUMPER_RADIUS);
            vx += Math.cos(angle) * 2;
            vy += Math.sin(angle) * 2;
            setScore(s => s + BUMPER_POINTS);
          }
        });
        // Lose condition
        if (y > HEIGHT + BALL_RADIUS) {
          setPlaying(false);
          setLost(true);
        }
        // Clamp
        x = clamp(x, BALL_RADIUS, WIDTH - BALL_RADIUS);
        y = clamp(y, BALL_RADIUS, HEIGHT + BALL_RADIUS);
        return { x, y, vx: clamp(vx, -10, 10), vy: clamp(vy, -12, 12) };
      });
      animation = requestAnimationFrame(loop);
    }
    animation = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animation);
  }, [playing, flipperState]);

  // Draw everything
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Table
    ctx.save();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 7;
    ctx.strokeRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
    // Bumpers
    bumpers.forEach(({ x, y }) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, BUMPER_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ffeb3b';
      ctx.shadowColor = '#fbc02d';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.restore();
    });
    // Flippers
    // Left
    ctx.save();
    ctx.translate(WIDTH / 2 - 60, FLIPPER_Y);
    ctx.rotate(-FLIPPER_ANGLE + (flipperState.left ? FLIPPER_ANGLE : 0));
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(0, -FLIPPER_WIDTH / 2, FLIPPER_LENGTH, FLIPPER_WIDTH);
    ctx.restore();
    // Right
    ctx.save();
    ctx.translate(WIDTH / 2 + 60, FLIPPER_Y);
    ctx.rotate(Math.PI + FLIPPER_ANGLE - (flipperState.right ? FLIPPER_ANGLE : 0));
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(0, -FLIPPER_WIDTH / 2, FLIPPER_LENGTH, FLIPPER_WIDTH);
    ctx.restore();
    // Ball
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#aaa';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
    // Score
    ctx.save();
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#333';
    ctx.fillText('Score: ' + score, 16, 36);
    ctx.restore();
    // Game over
    if (lost) {
      ctx.save();
      ctx.font = 'bold 34px sans-serif';
      ctx.fillStyle = '#e53935';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', WIDTH / 2, HEIGHT / 2);
      ctx.restore();
    }
  }, [ball, flipperState, score, lost]);

  return (
    <GameContainer>
      <h2>3D Pinball (Mini)</h2>
      <PinballCanvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
      <Controls>
        <button onClick={launchBall} disabled={playing}>Launch Ball</button>
        <span style={{ color: '#666' }}>Controls: ← → for flippers, Space to launch</span>
      </Controls>
    </GameContainer>
  );
}

export default PinballGame;
