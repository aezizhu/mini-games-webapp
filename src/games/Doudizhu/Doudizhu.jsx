import React, { useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

const SUITS = ['♠', '♥', '♣', '♦'];
const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const JOKERS = ['Black Joker', 'Red Joker'];
const PLAYER_NAMES = ['You', 'Robot A', 'Robot B'];
const DIFFICULTIES = [
  { label: 'Easy', value: 'easy' },
  { label: 'Normal', value: 'normal' },
  { label: 'Hard', value: 'hard' },
];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(`${rank}${suit}`);
    }
  }
  deck.push(...JOKERS);
  return deck;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Hand = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
`;

const Card = styled.div`
  padding: 4px 8px;
  border-radius: 5px;
  background: #fff;
  border: 1px solid #aaa;
  font-size: 1.2rem;
  min-width: 32px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const PlayerLabel = styled.div`
  font-weight: bold;
  margin-top: 10px;
`;

const DifficultySelect = styled.div`
  margin-bottom: 18px;
  display: flex;
  gap: 12px;
`;

const Doudizhu = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [hands, setHands] = useState([[], [], []]);
  const [landlord, setLandlord] = useState(null);
  const [bottom, setBottom] = useState([]);
  const [stage, setStage] = useState('difficulty'); // difficulty, deal, chooseLandlord, play
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState([]);
  const [history, setHistory] = useState([]);

  // Start game after selecting difficulty
  const startGame = () => {
    setStage('deal');
  };

  // Deal cards
  const deal = () => {
    const deck = shuffle(createDeck());
    const handA = deck.slice(0, 17);
    const handB = deck.slice(17, 34);
    const handC = deck.slice(34, 51);
    const bottomCards = deck.slice(51);
    setHands([handA, handB, handC]);
    setBottom(bottomCards);
    setLandlord(null);
    setStage('chooseLandlord');
    setCurrent(0);
    setHistory([]);
    setSelected([]);
  };

  // Choose landlord: for now, always let the user be landlord
  const chooseLandlord = () => {
    const newHands = [...hands];
    newHands[0] = [...newHands[0], ...bottom];
    setHands(newHands);
    setLandlord(0);
    setStage('play');
    setCurrent(0);
    setSelected([]);
  };

  // Play a card (only single card for demo)
  const play = () => {
    if (selected.length === 0) return;
    const myHand = hands[0].filter(c => !selected.includes(c));
    setHands([myHand, hands[1], hands[2]]);
    setHistory([...history, { player: 0, cards: selected }]);
    setSelected([]);
    setCurrent(1);
    setTimeout(robotPlay, 800);
  };

  // Robot logic: play random single card (difficulty placeholder)
  const robotPlay = () => {
    let idx = current;
    if (idx === 0) idx = 1;
    const hand = hands[idx];
    if (hand.length === 0) return;
    let card;
    if (difficulty === 'easy') {
      card = hand[Math.floor(Math.random() * hand.length)];
    } else if (difficulty === 'normal') {
      card = hand[0]; // Always play first card
    } else {
      // Hard: play highest card
      card = hand.slice().sort((a, b) => {
        const rankA = RANKS.indexOf(a.replace(/[^\dJQKA]+/, ''));
        const rankB = RANKS.indexOf(b.replace(/[^\dJQKA]+/, ''));
        return rankB - rankA;
      })[0];
    }
    const newHands = [...hands];
    newHands[idx] = hand.filter(c => c !== card);
    setHands(newHands);
    setHistory(h => [...h, { player: idx, cards: [card] }]);
    setCurrent((idx + 1) % 3);
    if ((idx + 1) % 3 !== 0) {
      setTimeout(robotPlay, 800);
    }
  };

  // Select/deselect cards
  const toggleCard = card => {
    setSelected(sel => sel.includes(card) ? sel.filter(c => c !== card) : [...sel, card]);
  };

  // New game
  const restart = () => {
    setStage('difficulty');
    setHands([[], [], []]);
    setLandlord(null);
    setBottom([]);
    setHistory([]);
    setSelected([]);
    setCurrent(0);
  };

  // UI rendering
  return (
    <GameContainer>
      <h2>Doudizhu (Landlord)</h2>
      <button onClick={restart}>Restart</button>
      {stage === 'difficulty' && (
        <div>
          <DifficultySelect>
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                style={{ fontWeight: difficulty === d.value ? 'bold' : 'normal' }}
                onClick={() => setDifficulty(d.value)}
              >
                {d.label}
              </button>
            ))}
          </DifficultySelect>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
      {stage === 'deal' && <button onClick={deal}>Deal</button>}
      {stage === 'chooseLandlord' && (
        <div>
          <div>Bottom cards: <Hand>{bottom.map(c => <Card key={c}>{c}</Card>)}</Hand></div>
          <button onClick={chooseLandlord}>Be Landlord</button>
        </div>
      )}
      <div style={{ marginTop: 20 }}>
        {hands.map((hand, idx) => (
          <div key={idx}>
            <PlayerLabel>
              {PLAYER_NAMES[idx]}{landlord === idx ? ' (Landlord)' : ''}
              {current === idx && stage === 'play' ? ' ← Turn' : ''}
            </PlayerLabel>
            <Hand>
              {idx === 0
                ? hand.map(card => (
                    <Card
                      key={card}
                      style={{
                        background: selected.includes(card) ? '#ffd' : '#fff',
                        border: selected.includes(card) ? '2px solid orange' : '#aaa',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleCard(card)}
                    >
                      {card}
                    </Card>
                  ))
                : hand.map((_, i) => <Card key={i}>🂠</Card>)}
            </Hand>
          </div>
        ))}
      </div>
      {stage === 'play' && current === 0 && (
        <div style={{ margin: '12px 0' }}>
          <button onClick={play} disabled={selected.length === 0}>Play Selected</button>
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <b>History:</b>
        {history.map((h, i) => (
          <div key={i}>{PLAYER_NAMES[h.player]}: {h.cards.join(', ')}</div>
        ))}
      </div>
    </GameContainer>
  );
};

export default Doudizhu;
