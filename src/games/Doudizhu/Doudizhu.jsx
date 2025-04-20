import React, { useState, useEffect } from 'react';
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

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 14px 0;
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
  // Group by rank
  const map = groupByRank(cards);
  const rankArr = Object.keys(map);
  const counts = Object.values(map);
  const values = rankArr.map(r => getCardValue(r + SUITS[0])).sort((a, b) => a - b);
  // Rocket
  if (cards.length === 2 && cards.includes('Black Joker') && cards.includes('Red Joker')) return { type: 'rocket' };
  // Bomb
  if (cards.length === 4 && counts.includes(4)) return { type: 'bomb', value: values.find((v, i) => counts[i] === 4) };
  // Single
  if (cards.length === 1) return { type: 'single', value: getCardValue(cards[0]) };
  // Pair
  if (cards.length === 2 && counts[0] === 2) return { type: 'pair', value: getCardValue(cards[0]) };
  // Triple
  if (cards.length === 3 && counts[0] === 3) return { type: 'triple', value: getCardValue(cards[0]) };
  // Three with one
  if (cards.length === 4 && counts.includes(3) && counts.includes(1)) return { type: 'triple1', value: values.find((v, i) => counts[i] === 3) };
  // Three with two
  if (cards.length === 5 && counts.includes(3) && counts.includes(2)) return { type: 'triple2', value: values.find((v, i) => counts[i] === 3) };
  // Four with two singles (4+1+1)
  if (cards.length === 6 && counts.includes(4) && counts.filter(x => x === 1).length === 2) return { type: 'four2', value: values.find((v, i) => counts[i] === 4) };
  // Four with two pairs (4+2+2)
  if (cards.length === 8 && counts.includes(4) && counts.filter(x => x === 2).length === 2) return { type: 'four22', value: values.find((v, i) => counts[i] === 4) };
  // Straight (min 5, all single, no 2/joker)
  if (cards.length >= 5 && counts.every(x => x === 1)) {
    if (values[values.length-1] < 12) {
      for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i-1]+1) return null;
      }
      return { type: 'straight', value: values[0], len: cards.length };
    }
  }
  // Double straight (min 6, even, all pairs, no 2/joker)
  if (cards.length >= 6 && cards.length % 2 === 0 && counts.every(x => x === 2)) {
    if (values[values.length-1] < 12) {
      for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i-1]+1) return null;
      }
      return { type: 'doubleStraight', value: values[0], len: cards.length/2 };
    }
  }
  // Plane (min 6, triple triple ...)
  if (cards.length >= 6 && cards.length % 3 === 0 && counts.every(x => x === 3)) {
    if (values[values.length-1] < 12) {
      for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i-1]+1) return null;
      }
      return { type: 'plane', value: values[0], len: cards.length/3 };
    }
  }
  // Plane with single wings (e.g. 33344456)
  if (cards.length >= 8 && cards.length % 4 === 0) {
    let tripleRanks = rankArr.filter(r => map[r] === 3);
    if (tripleRanks.length === cards.length/4*2) {
      const tripleVals = tripleRanks.map(r => getCardValue(r + SUITS[0])).sort((a,b)=>a-b);
      if (tripleVals[tripleVals.length-1] < 12) {
        for (let i = 1; i < tripleVals.length; i++) {
          if (tripleVals[i] !== tripleVals[i-1]+1) return null;
        }
        return { type: 'plane1', value: tripleVals[0], len: tripleVals.length };
      }
    }
  }
  // Plane with pair wings (e.g. 3334445566)
  if (cards.length >= 10 && cards.length % 5 === 0) {
    let tripleRanks = rankArr.filter(r => map[r] === 3);
    let pairRanks = rankArr.filter(r => map[r] === 2);
    if (tripleRanks.length === cards.length/5*2 && pairRanks.length === cards.length/5) {
      const tripleVals = tripleRanks.map(r => getCardValue(r + SUITS[0])).sort((a,b)=>a-b);
      if (tripleVals[tripleVals.length-1] < 12) {
        for (let i = 1; i < tripleVals.length; i++) {
          if (tripleVals[i] !== tripleVals[i-1]+1) return null;
        }
        return { type: 'plane2', value: tripleVals[0], len: tripleVals.length };
      }
    }
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
  if ((next.type === 'straight' || next.type === 'doubleStraight' || next.type === 'plane' || next.type === 'plane1' || next.type === 'plane2') && next.len !== last.len) return false;
  return next.value > last.value;
}

// --- Robot AI: find playable hand ---
function robotFindPlayableHand(hand, lastHand) {
  // Generate all possible hands (single, pair, triple, bomb, rocket, etc)
  const allCombos = [];
  // Helper to group cards by rank
  const map = groupByRank(hand);
  const ranks = Object.keys(map);
  // Bomb
  for (const r of ranks) {
    if (map[r] === 4) {
      const bomb = hand.filter(c => c.replace(/[^\dJQKA]+/, '') === r);
      allCombos.push(bomb);
    }
  }
  // Rocket
  if (hand.includes('Black Joker') && hand.includes('Red Joker')) {
    allCombos.push(['Black Joker', 'Red Joker']);
  }
  // Triple, triple+1, triple+2
  for (const r of ranks) {
    if (map[r] === 3) {
      const triple = hand.filter(c => c.replace(/[^\dJQKA]+/, '') === r);
      allCombos.push(triple);
      // With one
      for (const c of hand) {
        if (c.replace(/[^\dJQKA]+/, '') !== r) {
          allCombos.push([...triple, c]);
        }
      }
      // With pair
      for (const r2 of ranks) {
        if (r2 !== r && map[r2] >= 2) {
          const pair = hand.filter(c => c.replace(/[^\dJQKA]+/, '') === r2).slice(0,2);
          allCombos.push([...triple, ...pair]);
        }
      }
    }
  }
  // Pair
  for (const r of ranks) {
    if (map[r] === 2) {
      const pair = hand.filter(c => c.replace(/[^\dJQKA]+/, '') === r);
      allCombos.push(pair);
    }
  }
  // Single
  for (const c of hand) {
    allCombos.push([c]);
  }
  // Straight (min 5)
  const sortedVals = ranks.map(r => getCardValue(r + SUITS[0])).filter(v => v < 12).sort((a,b)=>a-b);
  for (let len = 5; len <= sortedVals.length; len++) {
    for (let i = 0; i <= sortedVals.length-len; i++) {
      let ok = true;
      for (let j = 1; j < len; j++) {
        if (sortedVals[i+j] !== sortedVals[i]+j) ok = false;
      }
      if (ok) {
        const seqRanks = sortedVals.slice(i, i+len).map(v => RANKS[v-3]);
        const seq = hand.filter(c => seqRanks.includes(c.replace(/[^\dJQKA]+/, '')));
        if (seq.length === len) allCombos.push(seq);
      }
    }
  }
  // Try all combos, prefer minimal that can beat lastHand
  let candidates = allCombos
    .map(c => ({ c, t: parseHandType(c) }))
    .filter(x => x.t && compareHands(lastHand, x.t));
  // If can't beat, try bomb/rocket
  if (candidates.length === 0 && lastHand && lastHand.type !== 'bomb' && lastHand.type !== 'rocket') {
    candidates = allCombos
      .map(c => ({ c, t: parseHandType(c) }))
      .filter(x => x.t && (x.t.type === 'bomb' || x.t.type === 'rocket'));
  }
  // Pick the minimal value hand
  if (candidates.length > 0) {
    candidates.sort((a,b) => a.t.value - b.t.value);
    return candidates[0].c;
  }
  return null;
}

// --- Robot AI: play valid hand or pass ---
const robotPlay = (idx, curHands, curPlayed, curLastHand) => {
  console.log(`[Doudizhu] robotPlay called idx=${idx}, curLastHand=`, curLastHand);
  console.log('[Doudizhu] robot hands:', curHands[idx]);
  const hand = curHands[idx];
  const found = robotFindPlayableHand(hand, curLastHand);
  if (found) {
    console.log(`[Doudizhu] robot found cards to play idx=${idx}:`, found);
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
    console.log(`[Doudizhu] robot idx=${idx} cannot find valid card, passing`);
    const newPlayed = [...curPlayed];
    newPlayed[idx] = [];
    setPlayed(newPlayed);
    setCurrent((idx + 1) % 3);
    setTimeout(() => {
      if ((idx + 1) % 3 !== 0) robotPlay((idx + 1) % 3, curHands, newPlayed, curLastHand);
    }, 900);
  }
};

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
    console.log('[Doudizhu] finishCall bids:', cs);
    const max = Math.max(...cs);
    const idx = max > 0 ? cs.indexOf(max) : 0;
    console.log('[Doudizhu] landlord idx:', idx);
    const newHands = [...hands];
    newHands[idx] = [...newHands[idx], ...bottom];
    setHands(newHands);
    setLandlord(idx);
    setStage('play');
    setCurrent(idx);
    // If landlord isn't user, initiate first robot play
    if (idx !== 0) {
      console.log('[Doudizhu] starting first robotPlay, idx=', idx, 'hands=', newHands);
      setTimeout(() => robotPlay(idx, newHands, [[], [], []], null), 900);
    }
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

  // Automatic robot move when it's a robot's turn
  useEffect(() => {
    if (stage === 'play' && current !== 0) {
      // simulate thinking delay
      const timer = setTimeout(() => {
        robotPlay(current, hands, played, lastHand);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [current, stage, hands, played, lastHand]);

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
              <ButtonsWrapper>
                <button onClick={play} disabled={selected.length === 0 || current !== 0 || !parseHandType(selected) || !compareHands(lastHand, parseHandType(selected))}>Play Selected</button>
                <button onClick={pass} disabled={current !== 0 || !lastHand}>Pass</button>
              </ButtonsWrapper>
            </PlayerArea>
          </div>
        </Table>
      )}
    </GameContainer>
  );
};

export default Doudizhu;
