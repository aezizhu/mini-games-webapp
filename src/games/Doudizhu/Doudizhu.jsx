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

const Table = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 440px;
  position: relative;
`;

const PlayerRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-end;
`;

const CenterArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 18px 0;
`;

const Hand = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  margin: 10px 0;
  overflow-x: auto;
  max-width: 95vw;
  padding-bottom: 6px;
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
  user-select: none;
  transition: transform 0.15s;
`;

const CardBack = styled(Card)`
  background: #eee;
  color: #bbb;
`;

const PlayerArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
`;

const PlayerLabel = styled.div`
  font-weight: bold;
  margin-bottom: 6px;
`;

const PlayedCards = styled.div`
  min-height: 32px;
  margin-bottom: 4px;
  font-size: 1.1rem;
  color: #333;
`;

const LandlordMark = styled.span`
  color: #d2691e;
  font-size: 1.2em;
  margin-left: 4px;
`;

const BottomCards = styled.div`
  display: flex;
  gap: 6px;
  margin: 8px 0 12px 0;
`;

const DifficultySelect = styled.div`
  margin-bottom: 18px;
  display: flex;
  gap: 12px;
`;

// --- Helper: Card value for comparison ---
function getCardValue(card) {
  if (card === 'Black Joker') return 16;
  if (card === 'Red Joker') return 17;
  const rank = card.replace(/[^\dJQKA]+/, '');
  return RANKS.indexOf(rank);
}

// --- Helper: Group cards by rank ---
function groupByRank(cards) {
  const map = {};
  for (const card of cards) {
    const rank = card.replace(/[^\dJQKA]+/, '');
    map[rank] = (map[rank] || 0) + 1;
  }
  return map;
}

// --- Parse hand type ---
function parseHandType(cards) {
  if (cards.length === 0) return null;
  const map = groupByRank(cards);
  const ranks = Object.keys(map).map(r => getCardValue(r + SUITS[0])).sort((a, b) => a - b);
  const counts = Object.values(map).sort((a, b) => b - a);
  // Rocket
  if (cards.length === 2 && cards.includes('Black Joker') && cards.includes('Red Joker')) {
    return { type: 'rocket' };
  }
  // Bomb
  if (cards.length === 4 && counts[0] === 4) {
    const rankVal = getCardValue(cards.find(c => map[c.replace(/[^\dJQKA]+/, '')] === 4));
    return { type: 'bomb', value: rankVal };
  }
  // Single
  if (cards.length === 1) return { type: 'single', value: getCardValue(cards[0]) };
  // Pair
  if (cards.length === 2 && counts[0] === 2) return { type: 'pair', value: getCardValue(cards[0]) };
  // Triple
  if (cards.length === 3 && counts[0] === 3) return { type: 'triple', value: getCardValue(cards[0]) };
  // Triple with attachments
  if (cards.length === 4 && counts[0] === 3 && counts[1] === 1) {
    return { type: 'triple1', value: getCardValue(cards.find(c => map[c.replace(/[^\dJQKA]+/, '')] === 3)) };
  }
  if (cards.length === 5 && counts[0] === 3 && counts[1] === 2) {
    return { type: 'triple2', value: getCardValue(cards.find(c => map[c.replace(/[^\dJQKA]+/, '')] === 3)) };
  }
  // Four with two singles or two pairs
  if (cards.length === 6 && counts[0] === 4 && (counts[1] === 1 && counts[2] === 1 || counts[1] === 2)) {
    return { type: 'four2', value: getCardValue(cards.find(c => map[c.replace(/[^\dJQKA]+/, '')] === 4)) };
  }
  // Straight (min 5, no 2 or jokers)
  if (cards.length >= 5 && counts.every(c => c === 1)) {
    const vals = cards.map(getCardValue).sort((a, b) => a - b);
    if (vals[vals.length - 1] < 12) {
      let ok = true;
      for (let i = 1; i < vals.length; i++) {
        if (vals[i] !== vals[i - 1] + 1) ok = false;
      }
      if (ok) return { type: 'straight', value: vals[0], len: vals.length };
    }
  }
  // Double straight (min 3 pairs)
  if (cards.length >= 6 && cards.length % 2 === 0 && counts.every(c => c === 2)) {
    const vals = Object.keys(map).map(r => map[r] === 2 ? getCardValue(r + SUITS[0]) : 0).filter(v => v).sort((a, b) => a - b);
    if (vals[vals.length - 1] < 12) {
      let ok = true;
      for (let i = 1; i < vals.length; i++) {
        if (vals[i] !== vals[i - 1] + 1) ok = false;
      }
      if (ok) return { type: 'doubleStraight', value: vals[0], len: vals.length };
    }
  }
  // Plane without attachments (min 2 triples)
  if (cards.length >= 6 && cards.length % 3 === 0 && counts.every(c => c === 3)) {
    const vals = Object.keys(map).map(r => getCardValue(r + SUITS[0])).sort((a, b) => a - b);
    if (vals[vals.length - 1] < 12) return { type: 'plane', value: vals[0], len: vals.length / 3 };
  }
  return null;
}

// --- Compare two hands ---
function compareHands(last, next) {
  if (!next) return false;
  if (!last) return true;
  if (next.type === 'rocket') return true;
  if (next.type === 'bomb' && last.type !== 'bomb') return true;
  if (next.type !== last.type) return false;
  if ((next.type === 'straight' || next.type === 'doubleStraight') && next.len !== last.len) return false;
  if (next.type === 'plane' && next.len !== last.len) return false;
  return (next.value > last.value);
}

const Doudizhu = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [hands, setHands] = useState([[], [], []]);
  const [landlord, setLandlord] = useState(null);
  const [bottom, setBottom] = useState([]);
  const [stage, setStage] = useState('difficulty'); // difficulty, play
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState([]);
  const [history, setHistory] = useState([[], [], []]); // [[cards], [cards], [cards]]
  const [played, setPlayed] = useState([[], [], []]); // last played for each
  const [lastHand, setLastHand] = useState(null); // last valid played hand
  const [callScores, setCallScores] = useState([null, null, null]); // bids for landlord

  // Start game after selecting difficulty
  const startGame = () => {
    const deck = shuffle(createDeck());
    const handA = deck.slice(0, 17);
    const handB = deck.slice(17, 34);
    const handC = deck.slice(34, 51);
    const bottomCards = deck.slice(51);
    setHands([handA, handB, handC]);
    setBottom(bottomCards);
    setCallScores([null, null, null]);
    setLandlord(null);
    setStage('call');
    setCurrent(0);
    setHistory([[], [], []]);
    setSelected([]);
    setPlayed([[], [], []]);
    setLastHand(null);
  };

  // Bidding logic
  const userCall = score => {
    const cs = [...callScores]; cs[0] = score; setCallScores(cs);
    if (1 < 3) setTimeout(() => nextCall(1, cs), 300);
    else finishCall(cs);
  };
  const nextCall = (idx, cs) => {
    setCurrent(idx);
    setTimeout(() => robotCall(idx, cs), 500);
  };
  const robotCall = (idx, cs) => {
    const score = Math.floor(Math.random() * 4); // 0=Pass,1-3
    const ncs = [...cs]; ncs[idx] = score; setCallScores(ncs);
    if (idx < 2) return nextCall(idx + 1, ncs);
    finishCall(ncs);
  };
  const finishCall = cs => {
    const max = Math.max(...cs);
    const idx = max > 0 ? cs.indexOf(max) : 0;
    const newHands = [...hands];
    newHands[idx] = [...newHands[idx], ...bottom];
    setHands(newHands);
    setLandlord(idx);
    setStage('play');
    setCurrent(idx);
  };

  // Play a card (with rule check)
  const play = () => {
    if (selected.length === 0) return;
    const handType = parseHandType(selected);
    if (!handType) {
      alert('Invalid hand type!');
      return;
    }
    if (!compareHands(lastHand, handType)) {
      alert('You must play a higher valid hand!');
      return;
    }
    const myHand = hands[0].filter(c => !selected.includes(c));
    const newHands = [myHand, hands[1], hands[2]];
    const newPlayed = [...played];
    newPlayed[0] = [...selected];
    setHands(newHands);
    setHistory(h => [
      [...h[0], selected],
      h[1],
      h[2],
    ]);
    setSelected([]);
    setPlayed(newPlayed);
    setLastHand(handType);
    setCurrent(1);
    setTimeout(() => robotPlay(1, newHands, newPlayed, handType), 900);
  };

  // Pass (skip turn)
  const pass = () => {
    setPlayed(p => { const np = [...p]; np[0] = []; return np; });
    setCurrent(1);
    setTimeout(() => robotPlay(1, hands, played, lastHand), 900);
  };

  // Robot logic: play valid hand or pass
  const robotPlay = (idx, curHands, curPlayed, curLastHand) => {
    // Try to find a valid hand to beat curLastHand
    const hand = curHands[idx];
    // Try all singles
    let found = null;
    for (let i = 0; i < hand.length; ++i) {
      const t = parseHandType([hand[i]]);
      if (compareHands(curLastHand, t)) {
        found = [hand[i]];
        break;
      }
    }
    // Try all pairs
    if (!found) {
      for (let i = 0; i < hand.length; ++i) {
        for (let j = i + 1; j < hand.length; ++j) {
          if (hand[i].replace(/[^\dJQKA]+/, '') === hand[j].replace(/[^\dJQKA]+/, '')) {
            const t = parseHandType([hand[i], hand[j]]);
            if (compareHands(curLastHand, t)) {
              found = [hand[i], hand[j]];
              break;
            }
          }
        }
        if (found) break;
      }
    }
    // TODO: add more hand types (triple, bomb, straight, etc)
    if (found) {
      const newHands = [...curHands];
      newHands[idx] = hand.filter(c => !found.includes(c));
      const newPlayed = [...curPlayed];
      newPlayed[idx] = [...found];
      setHands(newHands);
      setPlayed(newPlayed);
      setLastHand(parseHandType(found));
      setCurrent((idx + 1) % 3);
      setTimeout(() => {
        if ((idx + 1) % 3 !== 0) robotPlay((idx + 1) % 3, newHands, newPlayed, parseHandType(found));
      }, 900);
    } else {
      // Pass
      const newPlayed = [...curPlayed];
      newPlayed[idx] = [];
      setPlayed(newPlayed);
      setCurrent((idx + 1) % 3);
      setTimeout(() => {
        if ((idx + 1) % 3 !== 0) robotPlay((idx + 1) % 3, curHands, newPlayed, curLastHand);
      }, 900);
    }
  };

  // Check win
  if (hands.some(h => h.length === 0)) {
    setTimeout(() => alert('Game Over!'), 300);
  }

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
    setHistory([[], [], []]);
    setSelected([]);
    setCurrent(0);
    setPlayed([[], [], []]);
    setLastHand(null);
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
      {stage === 'call' && (
        <div style={{ margin: '16px 0' }}>
          <div>Call Scores: {callScores.map((s,i) => <span key={i} style={{ marginRight: 8 }}>{PLAYER_NAMES[i]}: {s == null ? '-' : s === 0 ? 'Pass' : s}</span>)}</div>
          {current === 0 ? (
            <div style={{ marginTop: 8 }}>
              {[1,2,3].map(s => <button key={s} onClick={() => userCall(s)}>Call {s}</button>)}
              <button onClick={() => userCall(0)}>Pass</button>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>{PLAYER_NAMES[current]} is calling...</div>
          )}
        </div>
      )}
      {stage === 'play' && (
        <Table>
          {/* Top robot */}
          <PlayerRow>
            <PlayerArea>
              <PlayerLabel>
                Robot A{landlord === 1 && <LandlordMark>★</LandlordMark>}
                {current === 1 ? ' ← Turn' : ''}
              </PlayerLabel>
              <PlayedCards>
                {played[1].length > 0 && played[1].map((c, i) => <Card key={i}>{c}</Card>)}
              </PlayedCards>
              <Hand>
                {hands[1].map((_, i) => <CardBack key={i}>🂠</CardBack>)}
              </Hand>
            </PlayerArea>
            {/* Center area: bottom cards */}
            <CenterArea>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Bottom Cards</div>
              <BottomCards>
                {bottom.map((c, i) => <Card key={i}>{c}</Card>)}
              </BottomCards>
            </CenterArea>
            {/* Right robot */}
            <PlayerArea>
              <PlayerLabel>
                Robot B{landlord === 2 && <LandlordMark>★</LandlordMark>}
                {current === 2 ? ' ← Turn' : ''}
              </PlayerLabel>
              <PlayedCards>
                {played[2].length > 0 && played[2].map((c, i) => <Card key={i}>{c}</Card>)}
              </PlayedCards>
              <Hand>
                {hands[2].map((_, i) => <CardBack key={i}>🂠</CardBack>)}
              </Hand>
            </PlayerArea>
          </PlayerRow>
          {/* Your area */}
          <div style={{ marginTop: 40, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <PlayerArea>
              <PlayerLabel>
                You{landlord === 0 && <LandlordMark>★</LandlordMark>}
                {current === 0 ? ' ← Turn' : ''}
              </PlayerLabel>
              <PlayedCards>
                {played[0].length > 0 && played[0].map((c, i) => <Card key={i}>{c}</Card>)}
              </PlayedCards>
              <Hand style={{ maxWidth: '95vw', overflowX: 'auto' }}>
                {hands[0].map(card => (
                  <Card
                    key={card}
                    style={{
                      background: selected.includes(card) ? '#ffd' : '#fff',
                      border: selected.includes(card) ? '2px solid orange' : '#aaa',
                      cursor: 'pointer',
                      transform: hands[0].length > 17 ? 'scale(0.85)' : 'scale(1)',
                    }}
                    onClick={() => toggleCard(card)}
                  >
                    {card}
                  </Card>
                ))}
              </Hand>
              <div style={{ margin: '14px 0' }}>
                <button onClick={play} disabled={selected.length === 0 || current !== 0 || !parseHandType(selected) || !compareHands(lastHand, parseHandType(selected))}>Play Selected</button>
                <button onClick={pass} disabled={current !== 0 || !lastHand}>Pass</button>
              </div>
            </PlayerArea>
          </div>
        </Table>
      )}
    </GameContainer>
  );
};

export default Doudizhu;
