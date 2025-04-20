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

  // Start game after selecting difficulty
  const startGame = () => {
    const deck = shuffle(createDeck());
    const handA = deck.slice(0, 17);
    const handB = deck.slice(17, 34);
    const handC = deck.slice(34, 51);
    const bottomCards = deck.slice(51);
    const newHands = [handA, handB, handC];
    newHands[0] = [...newHands[0], ...bottomCards]; // You are always landlord
    setHands(newHands);
    setBottom(bottomCards);
    setLandlord(0);
    setStage('play');
    setCurrent(0);
    setHistory([[], [], []]);
    setSelected([]);
    setPlayed([[], [], []]);
  };

  // Play a card (only single card for demo)
  const play = () => {
    if (selected.length === 0) return;
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
    setCurrent(1);
    setTimeout(() => robotPlay(1, newHands, newPlayed), 900);
  };

  // Robot logic: play single card, show played card
  const robotPlay = (idx, curHands, curPlayed) => {
    const hand = curHands[idx];
    if (hand.length === 0) return;
    let card;
    if (difficulty === 'easy') {
      card = hand[Math.floor(Math.random() * hand.length)];
    } else if (difficulty === 'normal') {
      card = hand[0];
    } else {
      card = hand.slice().sort((a, b) => {
        const rankA = RANKS.indexOf(a.replace(/[^\dJQKA]+/, ''));
        const rankB = RANKS.indexOf(b.replace(/[^\dJQKA]+/, ''));
        return rankB - rankA;
      })[0];
    }
    const newHands = [...curHands];
    newHands[idx] = hand.filter(c => c !== card);
    const newPlayed = [...curPlayed];
    newPlayed[idx] = [card];
    setHands(newHands);
    setHistory(h => {
      const copy = h.map(arr => [...arr]);
      copy[idx].push([card]);
      return copy;
    });
    setPlayed(newPlayed);
    const next = (idx + 1) % 3;
    setCurrent(next);
    if (next !== 0) {
      setTimeout(() => robotPlay(next, newHands, newPlayed), 900);
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
    setHistory([[], [], []]);
    setSelected([]);
    setCurrent(0);
    setPlayed([[], [], []]);
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
              <Hand>
                {hands[0].map(card => (
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
                ))}
              </Hand>
              <div style={{ margin: '14px 0' }}>
                <button onClick={play} disabled={selected.length === 0 || current !== 0}>Play Selected</button>
              </div>
            </PlayerArea>
          </div>
        </Table>
      )}
    </GameContainer>
  );
};

export default Doudizhu;
