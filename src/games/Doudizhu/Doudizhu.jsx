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
  // Debug: log input
  console.log('[parseHandType] input:', cards);
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
  // Debug: log failure
  console.log('[parseHandType] fail:', cards);
  return null;
}

// --- Compare two hands ---
function compareHands(last, next) {
  if (!next) return false;
  if (!last) return true;
  // Debug: log input
  console.log('[compareHands] last:', last, 'next:', next);
  if (next.type === 'rocket') return true;
  if (next.type === 'bomb' && last.type !== 'bomb') return true;
  if (next.type !== last.type) return false;
  if ((next.type === 'straight' || next.type === 'doubleStraight' || next.type === 'plane' || next.type === 'plane1' || next.type === 'plane2') && next.len !== last.len) return false;
  return next.value > last.value;
}

// The main Doudizhu component
function Doudizhu() {
  const [deck, setDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState([[], [], []]);
  const [bottomCards, setBottomCards] = useState([]);
  const [landlord, setLandlord] = useState(0); // 0 = player, 1 and 2 are AI
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [playedCards, setPlayedCards] = useState([null, null, null]);
  const [lastPlayedHand, setLastPlayedHand] = useState(null);
  const [lastPlayer, setLastPlayer] = useState(null);
  const [gamePhase, setGamePhase] = useState('bidding'); // bidding, playing, finished
  const [difficulty, setDifficulty] = useState('normal');
  const [gameResult, setGameResult] = useState(null);

  // Initialize game
  useEffect(() => {
    newGame();
  }, []);

  // Start new game
  const newGame = () => {
    const newDeck = shuffle(createDeck());
    
    // Deal cards (17 each)
    const hands = [
      newDeck.slice(0, 17),
      newDeck.slice(17, 34),
      newDeck.slice(34, 51)
    ];
    
    // Sort hands by card value
    hands.forEach(hand => {
      hand.sort((a, b) => getCardValue(a) - getCardValue(b));
    });
    
    // Bottom 3 cards
    const bottom = newDeck.slice(51);
    
    setDeck(newDeck);
    setPlayerHands(hands);
    setBottomCards(bottom);
    setLandlord(0);
    setCurrentPlayer(0);
    setSelectedCards([]);
    setPlayedCards([null, null, null]);
    setLastPlayedHand(null);
    setLastPlayer(null);
    setGamePhase('bidding');
    setGameResult(null);
  };

  // Select or deselect a card
  const toggleCardSelection = (cardIndex) => {
    if (gamePhase !== 'playing' || currentPlayer !== 0) return;
    
    const card = playerHands[0][cardIndex];
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  // Play selected cards
  const playCards = () => {
    if (selectedCards.length === 0) return;
    
    const handType = parseHandType(selectedCards);
    if (!handType) {
      alert("Invalid card combination!");
      return;
    }
    
    if (lastPlayedHand && lastPlayer !== 0 && !compareHands(lastPlayedHand, handType)) {
      alert("These cards can't beat the last play!");
      return;
    }
    
    // Remove cards from hand
    const newHands = [...playerHands];
    selectedCards.forEach(card => {
      const index = newHands[0].indexOf(card);
      if (index > -1) {
        newHands[0].splice(index, 1);
      }
    });
    
    // Update game state
    setPlayerHands(newHands);
    const newPlayedCards = [...playedCards];
    newPlayedCards[0] = selectedCards;
    setPlayedCards(newPlayedCards);
    setSelectedCards([]);
    setLastPlayedHand(handType);
    setLastPlayer(0);
    
    // Check if player has won
    if (newHands[0].length === 0) {
      setGamePhase('finished');
      setGameResult(0 === landlord ? 'landlord' : 'farmers');
      return;
    }
    
    // AI turns
    setCurrentPlayer(1);
    setTimeout(() => {
      aiTurn(1, newHands, handType, newPlayedCards);
    }, 1000);
  };

  // AI turn (simplified)
  const aiTurn = (aiPlayer, hands, lastHand, played) => {
    // In a real implementation, this would have complex AI logic
    // Here we'll just pass if we're not the landlord, or play a simple hand
    const newPlayedCards = [...played];
    const aiHand = hands[aiPlayer];
    
    // Simplified AI - just play the first valid hand
    if (aiHand.length > 0) {
      // In a real game, would check available plays
      // Here we'll just pass
      newPlayedCards[aiPlayer] = null;
    }
    
    setPlayedCards(newPlayedCards);
    
    // Move to next player or back to player
    const nextPlayer = (aiPlayer + 1) % 3;
    setCurrentPlayer(nextPlayer);
    
    if (nextPlayer === 0) {
      // Back to human player
    } else {
      // Continue AI turn
      setTimeout(() => {
        aiTurn(nextPlayer, hands, lastHand, newPlayedCards);
      }, 1000);
    }
  };

  // Pass turn
  const passTurn = () => {
    if (gamePhase !== 'playing' || currentPlayer !== 0 || lastPlayer === 0) return;
    
    setSelectedCards([]);
    const newPlayedCards = [...playedCards];
    newPlayedCards[0] = null;
    setPlayedCards(newPlayedCards);
    
    setCurrentPlayer(1);
    setTimeout(() => {
      aiTurn(1, playerHands, lastPlayedHand, newPlayedCards);
    }, 1000);
  };

  // Start game as landlord
  const startGame = () => {
    // In a real game, bidding would determine landlord
    // Here we'll just make player the landlord
    const newHands = [...playerHands];
    newHands[0] = [...newHands[0], ...bottomCards];
    newHands[0].sort((a, b) => getCardValue(a) - getCardValue(b));
    
    setPlayerHands(newHands);
    setGamePhase('playing');
  };

  return (
    <GameContainer>
      <h1>Doudizhu (Chinese Poker)</h1>
      
      {gamePhase === 'bidding' && (
        <div>
          <h2>Bidding Phase</h2>
          <DifficultySelect>
            {DIFFICULTIES.map(option => (
              <button 
                key={option.value}
                onClick={() => setDifficulty(option.value)}
                style={{fontWeight: difficulty === option.value ? 'bold' : 'normal'}}
              >
                {option.label}
              </button>
            ))}
          </DifficultySelect>
          <button onClick={startGame}>Start as Landlord</button>
        </div>
      )}
      
      {gamePhase === 'playing' && (
        <Table>
          <PlayerRow>
            <PlayerArea>
              <PlayerLabel>Robot A {landlord === 1 && <LandlordMark>👑</LandlordMark>}</PlayerLabel>
              <Hand>
                {playerHands[1].map((_, i) => (
                  <CardBack key={i}>?</CardBack>
                ))}
              </Hand>
              <PlayedCards>
                {playedCards[1] && playedCards[1].join(' ')}
              </PlayedCards>
            </PlayerArea>
            
            <PlayerArea>
              <PlayerLabel>Robot B {landlord === 2 && <LandlordMark>👑</LandlordMark>}</PlayerLabel>
              <Hand>
                {playerHands[2].map((_, i) => (
                  <CardBack key={i}>?</CardBack>
                ))}
              </Hand>
              <PlayedCards>
                {playedCards[2] && playedCards[2].join(' ')}
              </PlayedCards>
            </PlayerArea>
          </PlayerRow>
          
          <CenterArea>
            {gamePhase === 'bidding' && (
              <BottomCards>
                {bottomCards.map((card, i) => (
                  <Card key={i}>{card}</Card>
                ))}
              </BottomCards>
            )}
            {currentPlayer === 0 ? <div>Your turn</div> : <div>Waiting for Robot {currentPlayer === 1 ? 'A' : 'B'}</div>}
          </CenterArea>
          
          <PlayerArea>
            <PlayerLabel>You {landlord === 0 && <LandlordMark>👑</LandlordMark>}</PlayerLabel>
            <PlayedCards>
              {playedCards[0] && playedCards[0].join(' ')}
            </PlayedCards>
            <Hand>
              {playerHands[0].map((card, i) => (
                <Card 
                  key={i}
                  onClick={() => toggleCardSelection(i)}
                  style={{
                    transform: selectedCards.includes(card) ? 'translateY(-10px)' : 'none',
                    border: selectedCards.includes(card) ? '2px solid blue' : '1px solid #aaa'
                  }}
                >
                  {card}
                </Card>
              ))}
            </Hand>
            <ButtonsWrapper>
              <button onClick={playCards} disabled={selectedCards.length === 0}>Play Cards</button>
              <button onClick={passTurn} disabled={lastPlayer === 0 || lastPlayer === null}>Pass</button>
            </ButtonsWrapper>
          </PlayerArea>
        </Table>
      )}
      
      {gamePhase === 'finished' && (
        <div>
          <h2>Game Over</h2>
          <p>{gameResult === 'landlord' ? 'Landlord wins!' : 'Farmers win!'}</p>
          <button onClick={newGame}>New Game</button>
        </div>
      )}
    </GameContainer>
  );
}

export default Doudizhu;
