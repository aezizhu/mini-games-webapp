import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';
import Matter from 'matter-js';

// Table and game constants
const WIDTH = 400;
const HEIGHT = 600;
const BALL_RADIUS = 12;
const FLIPPER_LENGTH = 90;
const FLIPPER_WIDTH = 18;
const FLIPPER_Y = HEIGHT - 60;
const FLIPPER_OFFSET = 80;
const FLIPPER_ANGLE_LIMIT = Math.PI / 5; // ~36 deg
const FLIPPER_SPEED = 0.22; // radians per frame
const BUMPER_RADIUS = 28;
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

function PinballGame() {
  const canvasRef = useRef(null);
  const engine = useRef(null);
  const renderReq = useRef(null);
  const ballRef = useRef(null);
  const flippersRef = useRef({ left: null, right: null });
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [lost, setLost] = useState(false);
  const [flipperState, setFlipperState] = useState({ left: false, right: false });
  const [initialized, setInitialized] = useState(false);
  const bumperHit = useRef({});

  // Initialize Matter.js world and objects
  useEffect(() => {
    engine.current = Matter.Engine.create();
    const world = engine.current.world;
    // Walls
    const walls = [
      Matter.Bodies.rectangle(WIDTH / 2, -8, WIDTH, 16, { isStatic: true }),
      Matter.Bodies.rectangle(-8, HEIGHT / 2, 16, HEIGHT, { isStatic: true }),
      Matter.Bodies.rectangle(WIDTH + 8, HEIGHT / 2, 16, HEIGHT, { isStatic: true }),
      Matter.Bodies.rectangle(WIDTH / 2, HEIGHT + 8, WIDTH, 16, { isStatic: true, label: 'bottom' })
    ];
    Matter.World.add(world, walls);
    // Bumpers
    bumpers.forEach((b, i) => {
      const bumper = Matter.Bodies.circle(b.x, b.y, BUMPER_RADIUS, {
        isStatic: true,
        label: 'bumper_' + i
      });
      Matter.World.add(world, bumper);
    });
    setInitialized(true);
    return () => {
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine.current);
    };
  }, []);

  // Launch ball and flippers
  function launchBall() {
    const world = engine.current.world;
    setScore(0);
    setLost(false);
    setPlaying(true);
    // Remove old ball and flippers
    Matter.Composite.clear(world, false, true);
    // Walls and bumpers already exist
    // Ball
    const ball = Matter.Bodies.circle(WIDTH / 2, HEIGHT - 100, BALL_RADIUS, {
      restitution: 0.7,
      friction: 0.005,
      label: 'ball'
    });
    ballRef.current = ball;
    Matter.World.add(world, ball);
    // Flippers
    const leftFlipper = Matter.Bodies.rectangle(
      WIDTH / 2 - FLIPPER_OFFSET,
      FLIPPER_Y,
      FLIPPER_LENGTH,
      FLIPPER_WIDTH,
      { label: 'leftFlipper', chamfer: { radius: 8 }, collisionFilter: { group: -1 } }
    );
    const rightFlipper = Matter.Bodies.rectangle(
      WIDTH / 2 + FLIPPER_OFFSET,
      FLIPPER_Y,
      FLIPPER_LENGTH,
      FLIPPER_WIDTH,
      { label: 'rightFlipper', chamfer: { radius: 8 }, collisionFilter: { group: -1 } }
    );
    // Flipper pivots (constraints)
    const leftPivot = Matter.Constraint.create({
      bodyA: leftFlipper,
      pointB: { x: WIDTH / 2 - FLIPPER_OFFSET, y: FLIPPER_Y },
      length: 0,
      stiffness: 1
    });
    const rightPivot = Matter.Constraint.create({
      bodyA: rightFlipper,
      pointB: { x: WIDTH / 2 + FLIPPER_OFFSET, y: FLIPPER_Y },
      length: 0,
      stiffness: 1
    });
    Matter.World.add(world, [leftFlipper, rightFlipper, leftPivot, rightPivot]);
    flippersRef.current = { left: leftFlipper, right: rightFlipper };
    // Reset bumper hit state
    bumperHit.current = {};
  }

  // Flipper control
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
    // eslint-disable-next-line
  }, [playing, initialized]);

  // Physics and animation loop
  useEffect(() => {
    if (!initialized) return;
    const world = engine.current.world;
    function animate() {
      // Flipper control logic
      const left = flippersRef.current.left;
      const right = flippersRef.current.right;
      if (left && right) {
        // Left flipper
        let leftAngle = flipperState.left ? -FLIPPER_ANGLE_LIMIT : 0;
        Matter.Body.setAngle(left, leftAngle);
        Matter.Body.setAngularVelocity(left, 0);
        // Right flipper
        let rightAngle = flipperState.right ? FLIPPER_ANGLE_LIMIT : 0;
        Matter.Body.setAngle(right, Math.PI - rightAngle);
        Matter.Body.setAngularVelocity(right, 0);
      }
      Matter.Engine.update(engine.current, 1000 / 60);
      draw();
      renderReq.current = requestAnimationFrame(animate);
    }
    if (playing) {
      renderReq.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(renderReq.current);
    // eslint-disable-next-line
  }, [playing, flipperState, initialized]);

  // Collision events
  useEffect(() => {
    if (!initialized) return;
    const world = engine.current.world;
    const ball = ballRef.current;
    function handleCollision(event) {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        // Ball hits bumper
        [bodyA, bodyB].forEach((b, idx) => {
          if (b.label && b.label.startsWith('bumper_')) {
            const bumperIdx = b.label.split('_')[1];
            if (!bumperHit.current[bumperIdx]) {
              bumperHit.current[bumperIdx] = true;
              setScore(s => s + BUMPER_POINTS);
              setTimeout(() => { bumperHit.current[bumperIdx] = false; }, 400);
            }
          }
        });
        // Ball falls out
        if ((bodyA.label === 'ball' && bodyB.label === 'bottom') || (bodyB.label === 'ball' && bodyA.label === 'bottom')) {
          setPlaying(false);
          setLost(true);
        }
      });
    }
    Matter.Events.on(engine.current, 'collisionStart', handleCollision);
    return () => {
      Matter.Events.off(engine.current, 'collisionStart', handleCollision);
    };
    // eslint-disable-next-line
  }, [initialized]);

  // Canvas rendering
  function draw() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Table border
    ctx.save();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 7;
    ctx.strokeRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
    // Bumpers
    bumpers.forEach((b, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, BUMPER_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#ffeb3b';
      ctx.shadowColor = '#fbc02d';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.restore();
    });
    // Flippers
    const left = flippersRef.current.left;
    const right = flippersRef.current.right;
    if (left) {
      drawFlipper(ctx, left);
    }
    if (right) {
      drawFlipper(ctx, right);
    }
    // Ball
    const ball = ballRef.current;
    if (ball) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#aaa';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    }
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
  }

  // Draw flipper helper
  function drawFlipper(ctx, flipper) {
    ctx.save();
    ctx.translate(flipper.position.x, flipper.position.y);
    ctx.rotate(flipper.angle);
    ctx.fillStyle = flipper.label === 'leftFlipper' ? '#2196f3' : '#e91e63';
    ctx.fillRect(-FLIPPER_LENGTH / 2, -FLIPPER_WIDTH / 2, FLIPPER_LENGTH, FLIPPER_WIDTH);
    ctx.restore();
  }

  return (
    <GameContainer>
      <h2>3D Pinball (Matter.js)</h2>
      <PinballCanvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
      <Controls>
        <button onClick={launchBall} disabled={playing}>Launch Ball</button>
        <span style={{ color: '#666' }}>Controls: ← → for flippers, Space to launch</span>
      </Controls>
    </GameContainer>
  );
}

export default PinballGame;
