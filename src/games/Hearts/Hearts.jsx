import React, { useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

const SUITS = ['♠', '♥', '♣', '♦'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const PLAYER_NAMES = ['You', 'Robot A', 'Robot B', 'Robot C'];

// Create a standard 52-card deck
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Shuffle the deck
function shuffle(deck) {
  const a = [...deck];
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
  min-height: 340px;
  margin-top: 16px;
`;

const PlayerRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const Hand = styled.div`
  display: flex;
  gap: 6px;
  margin: 10px 0;
`;

const Card = styled.div`
  padding: 4px 8px;
  border-radius: 5px;
  background: #fff;
  border: 1px solid #aaa;
  font-size: 1.1rem;
  min-width: 28px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  user-select: none;
  color: ${props => props.suit === '♥' ? 'red' : '#333'};
`;

const PlayedCard = styled(Card)`
  background: #ffe;
  border: 2px solid #aaf;
`;

const Status = styled.div`
  margin: 18px 0 10px 0;
  font-size: 1.1rem;
  font-weight: bold;
`;

function sortHand(hand) {
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
  });
}

function getCardString(card) {
  return card.rank + card.suit;
}

function getPoints(card) {
  // Hearts are 1 point, Queen of Spades is 13
  if (card.suit === '♥') return 1;
  if (card.suit === '♠' && card.rank === 'Q') return 13;
  return 0;
}

function canPlay(card, hand, trick, heartsBroken) {
  if (trick.length === 0) {
    // First trick: cannot lead hearts unless only hearts remain or hearts broken
    if (!heartsBroken && card.suit === '♥' && hand.some(c => c.suit !== '♥')) return false;
    // Must play 2♣ if it's the very first card
    if (hand.length === 13 && card.suit === '♣' && card.rank === '2') return true;
    if (hand.length === 13 && !(card.suit === '♣' && card.rank === '2')) return false;
    return true;
  }
  // Must follow suit if possible
  const leadSuit = trick[0].suit;
  if (card.suit === leadSuit) return true;
  if (hand.some(c => c.suit === leadSuit)) return false;
  return true;
}

function getWinner(trick, leadPlayer) {
  const leadSuit = trick[0].suit;
  let maxIdx = 0;
  let maxRank = RANKS.indexOf(trick[0].rank);
  for (let i = 1; i < trick.length; i++) {
    if (trick[i].suit === leadSuit && RANKS.indexOf(trick[i].rank) > maxRank) {
      maxRank = RANKS.indexOf(trick[i].rank);
      maxIdx = i;
    }
  }
  return (leadPlayer + maxIdx) % 4;
}

function Hearts() {
  const [hands, setHands] = useState([[], [], [], []]);
  const [played, setPlayed] = useState([null, null, null, null]);
  const [trick, setTrick] = useState([]);
  const [lead, setLead] = useState(0);
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [heartsBroken, setHeartsBroken] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState('');

  // Start a new game
  React.useEffect(() => {
    const deck = shuffle(createDeck());
    const newHands = [[], [], [], []];
    for (let i = 0; i < 52; i++) {
      newHands[i % 4].push(deck[i]);
    }
    for (let i = 0; i < 4; i++) newHands[i] = sortHand(newHands[i]);
    setHands(newHands);
    setPlayed([null, null, null, null]);
    setTrick([]);
    setLead(0);
    setCurrent(0);
    setScores([0, 0, 0, 0]);
    setHeartsBroken(false);
    setGameOver(false);
    setStatus('Game started! Pass 2♣ to lead.');
  }, []);

  function playCard(idx, card) {
    if (gameOver || current !== idx) return;
    if (!canPlay(card, hands[idx], trick, heartsBroken)) {
      setStatus('Invalid card!');
      return;
    }
    const newHands = hands.map(h => [...h]);
    newHands[idx] = newHands[idx].filter(c => !(c.suit === card.suit && c.rank === card.rank));
    const newTrick = [...trick, card];
    const newPlayed = [...played];
    newPlayed[idx] = card;
    setHands(newHands);
    setTrick(newTrick);
    setPlayed(newPlayed);
    // If trick is complete
    if (newTrick.length === 4) {
      let points = newTrick.reduce((sum, c) => sum + getPoints(c), 0);
      let newScores = [...scores];
      const winner = getWinner(newTrick, lead);
      newScores[winner] += points;
      setScores(newScores);
      setTimeout(() => {
        setTrick([]);
        setPlayed([null, null, null, null]);
        setLead(winner);
        setCurrent(winner);
        setStatus(`${PLAYER_NAMES[winner]} wins the trick! +${points} points`);
        // Hearts broken?
        if (!heartsBroken && newTrick.some(c => c.suit === '♥')) setHeartsBroken(true);
        // Game over?
        if (newHands.some(h => h.length === 0)) {
          setGameOver(true);
          setStatus('Game Over! ' + PLAYER_NAMES[newScores.indexOf(Math.min(...newScores))] + ' wins!');
        }
      }, 1200);
      return;
    }
    // Next player
    setCurrent((current + 1) % 4);
    setStatus(`${PLAYER_NAMES[(current + 1) % 4]}'s turn`);
  }

  // Robot play
  React.useEffect(() => {
    if (gameOver) return;
    if (current === 0) return; // User
    const hand = hands[current];
    // Try to follow suit if possible
    let card = null;
    if (trick.length > 0) {
      const leadSuit = trick[0].suit;
      const suitCards = hand.filter(c => c.suit === leadSuit);
      if (suitCards.length > 0) {
        card = suitCards[0];
      } else {
        // Play lowest card
        card = hand[0];
      }
    } else {
      // Lead: avoid hearts if not broken
      const nonHearts = hand.filter(c => c.suit !== '♥');
      card = (nonHearts.length > 0 ? nonHearts[0] : hand[0]);
    }
    setTimeout(() => playCard(current, card), 900);
  }, [current, hands, trick, gameOver, heartsBroken]);

  function userPlay(card) {
    playCard(0, card);
  }

  function restart() {
    const deck = shuffle(createDeck());
    const newHands = [[], [], [], []];
    for (let i = 0; i < 52; i++) {
      newHands[i % 4].push(deck[i]);
    }
    for (let i = 0; i < 4; i++) newHands[i] = sortHand(newHands[i]);
    setHands(newHands);
    setPlayed([null, null, null, null]);
    setTrick([]);
    setLead(0);
    setCurrent(0);
    setScores([0, 0, 0, 0]);
    setHeartsBroken(false);
    setGameOver(false);
    setStatus('Game started! Pass 2♣ to lead.');
  }

  return (
    <GameContainer>
      <h2>Hearts (Microsoft Classic)</h2>
      <Status>{status}</Status>
      <button onClick={restart} style={{ marginBottom: 10 }}>Restart</button>
      <div style={{ marginBottom: 10 }}>
        {scores.map((s, i) => (
          <span key={i} style={{ marginRight: 16 }}>{PLAYER_NAMES[i]}: {s}</span>
        ))}
      </div>
      <Table>
        <PlayerRow>
          {/* Top robot */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{PLAYER_NAMES[1]}</div>
            <Hand>
              {hands[1].map((_, i) => <Card key={i}>🂠</Card>)}
            </Hand>
            <div style={{ minHeight: 28 }}>
              {played[1] && <PlayedCard suit={played[1].suit}>{getCardString(played[1])}</PlayedCard>}
            </div>
          </div>
          {/* Center trick area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 8 }}>Current Trick:</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {trick.map((c, i) => <PlayedCard key={i} suit={c.suit}>{getCardString(c)}</PlayedCard>)}
            </div>
          </div>
          {/* Right robot */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{PLAYER_NAMES[2]}</div>
            <Hand>
              {hands[2].map((_, i) => <Card key={i}>🂠</Card>)}
            </Hand>
            <div style={{ minHeight: 28 }}>
              {played[2] && <PlayedCard suit={played[2].suit}>{getCardString(played[2])}</PlayedCard>}
            </div>
          </div>
        </PlayerRow>
        {/* Bottom row: user and left robot */}
        <PlayerRow>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{PLAYER_NAMES[3]}</div>
            <Hand>
              {hands[3].map((_, i) => <Card key={i}>🂠</Card>)}
            </Hand>
            <div style={{ minHeight: 28 }}>
              {played[3] && <PlayedCard suit={played[3].suit}>{getCardString(played[3])}</PlayedCard>}
            </div>
          </div>
          {/* User area */}
          <div style={{ flex: 1, alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>You</div>
            <Hand>
              {hands[0].map((card, i) => (
                <Card
                  key={getCardString(card)}
                  suit={card.suit}
                  style={{
                    border: played[0] && card.suit === played[0].suit && card.rank === played[0].rank ? '2px solid orange' : '',
                    cursor: current === 0 && canPlay(card, hands[0], trick, heartsBroken) && !gameOver ? 'pointer' : 'not-allowed',
                    background: played[0] && card.suit === played[0].suit && card.rank === played[0].rank ? '#ffd' : '#fff',
                  }}
                  onClick={() => current === 0 && canPlay(card, hands[0], trick, heartsBroken) && !gameOver && userPlay(card)}
                >
                  {getCardString(card)}
                </Card>
              ))}
            </Hand>
            <div style={{ minHeight: 28 }}>
              {played[0] && <PlayedCard suit={played[0].suit}>{getCardString(played[0])}</PlayedCard>}
            </div>
          </div>
        </PlayerRow>
      </Table>
      <div style={{ marginTop: 12, color: '#888', fontSize: '0.95rem' }}>
        Click a card to play. Follow suit if possible. Hearts are 1 point, Queen of Spades is 13.<br />
        The player with the lowest score wins.
      </div>
    </GameContainer>
  );
}

export default Hearts;
