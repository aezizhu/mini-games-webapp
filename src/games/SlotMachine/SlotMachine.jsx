import React, { useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

const SYMBOLS = ['🍒', '🍋', '🔔', '🍀', '💎', '7️⃣'];
const REEL_COUNT = 50;
const INITIAL_BALANCE = 100;
const SPIN_COST = 10;
const WIN_MULTIPLIER = 5;

const Machine = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 32px 0 24px 0;
`;

const Reel = styled.div`
  width: 32px;
  height: 32px;
  background: #fff;
  border: 2px solid #aaa;
  border-radius: 8px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const Result = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 16px;
  color: ${({ win }) => (win ? 'green' : 'red')};
`;

const SlotMachine = () => {
  const [reels, setReels] = useState(Array(REEL_COUNT).fill(SYMBOLS[0]));
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [result, setResult] = useState('');
  const [win, setWin] = useState(false);

  // Spin the reels (fix: use lastReels for result check)
  const spin = () => {
    if (spinning || balance < SPIN_COST) return;
    setSpinning(true);
    setBalance(b => b - SPIN_COST);
    setResult('');
    setWin(false);

    let spinCount = 12;
    let lastReels = [];
    let interval = setInterval(() => {
      const newReels = Array(REEL_COUNT).fill().map(() => {
        return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      });
      setReels(newReels);
      lastReels = newReels;
      spinCount--;
      if (spinCount === 0) {
        clearInterval(interval);
        setSpinning(false);
        setTimeout(() => checkWin(lastReels), 100);
      }
    }, 60);
  };

  // Check if all reels are the same (use final reels, not state)
  const checkWin = (finalReels) => {
    if (finalReels.every(r => r === finalReels[0])) {
      setResult('You Win!');
      setWin(true);
      setBalance(b => b + SPIN_COST * WIN_MULTIPLIER);
    } else {
      setResult('Try Again!');
      setWin(false);
    }
  };

  const reset = () => {
    setBalance(INITIAL_BALANCE);
    setResult('');
    setWin(false);
    setReels(Array(REEL_COUNT).fill(SYMBOLS[0]));
  };

  return (
    <GameContainer>
      <h2>Slot Machine (50 Reels)</h2>
      <div>Balance: ${balance}</div>
      <Machine>
        {reels.map((symbol, i) => (
          <Reel key={i}>{symbol}</Reel>
        ))}
      </Machine>
      <button onClick={spin} disabled={spinning || balance < SPIN_COST}>
        {spinning ? 'Spinning...' : 'Spin (-$10)'}
      </button>
      <button onClick={reset} style={{ marginLeft: 16 }}>
        Reset
      </button>
      {result && <Result win={win}>{result}</Result>}
      {balance < SPIN_COST && <div style={{ color: 'red', marginTop: 8 }}>Not enough balance!</div>}
    </GameContainer>
  );
};

export default SlotMachine;
