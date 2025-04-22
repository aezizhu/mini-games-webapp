import React, { useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

// Card suits and ranks
const SUITS = ['♠', '♥', '♣', '♦'];
const RANKS = [13,12,11,10,9,8,7,6,5,4,3,2,1]; // K-Q-J-...-A

// Generate a full Spider deck for the given number of suits (1,2,4)
function generateDeck(suitCount) {
  let suits = SUITS.slice(0, suitCount);
  let cards = [];
  let perSuit = 104 / suits.length;
  for (let s = 0; s < suits.length; s++) {
    for (let i = 0; i < perSuit; i++) {
      for (let r = 0; r < RANKS.length; r++) {
        cards.push({
          suit: suits[s],
          rank: RANKS[r],
          faceUp: false,
          id: `${suits[s]}${RANKS[r]}_${i}`
        });
      }
    }
  }
  return shuffle(cards);
}

// Fisher-Yates shuffle
function shuffle(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Initial deal: 10 columns, 54 cards (first 4 columns get 6 face-down + 1 face-up, rest get 5 down + 1 up)
function initialDeal(deck) {
  let tableau = Array.from({length: 10}, () => []);
  let idx = 0;
  for (let col = 0; col < 10; col++) {
    let down = col < 4 ? 6 : 5;
    for (let d = 0; d < down; d++) {
      tableau[col].push({ ...deck[idx++], faceUp: false });
    }
    tableau[col].push({ ...deck[idx++], faceUp: true });
  }
  let stock = [];
  for (let i = 0; i < 5; i++) {
    let pile = [];
    for (let j = 0; j < 10; j++) {
      pile.push({ ...deck[idx++], faceUp: true });
    }
    stock.push(pile);
  }
  return { tableau, stock };
}

const CardStyled = styled.div`
  width: 54px;
  height: 72px;
  border-radius: 7px;
  box-shadow: 0 2px 6px #2224;
  background: ${({faceUp, selected}) => selected ? '#ffe082' : (faceUp ? '#fff' : 'linear-gradient(135deg,#2e3b4e,#5e6b81)')};
  color: ${({suit}) => suit === '♥' || suit === '♦' ? '#e53935' : '#222'};
  border: 1.5px solid #888;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  font-size: 1.3em;
  padding: 8px 10px 0 0;
  margin-top: -54px;
  z-index: ${({z}) => z};
  position: relative;
  user-select: none;
  cursor: ${({faceUp}) => faceUp ? 'pointer' : 'default'};
`;

const TableauCol = styled.div`
  flex: 1;
  min-width: 54px;
  margin: 0 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TableauRow = styled.div`
  display: flex;
  flex-direction: row;
  margin: 16px 0 0 0;
  min-height: 400px;
`;

const StockArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin: 24px 16px 0 0;
`;

const StockPile = styled.div`
  width: 54px;
  height: 72px;
  border-radius: 7px;
  background: linear-gradient(135deg,#2e3b4e,#5e6b81);
  border: 1.5px solid #888;
  box-shadow: 0 2px 6px #2224;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5em;
  margin-left: 8px;
  cursor: pointer;
  opacity: ${({disabled}) => disabled ? 0.4 : 1};
  position: relative;
`;

function Card({ card, z, selected, onClick }) {
  return (
    <CardStyled faceUp={card.faceUp} suit={card.suit} z={z} selected={selected} onClick={onClick} title={card.faceUp ? `${card.suit}${card.rank}` : ''}>
      {card.faceUp ? `${card.suit}${card.rank === 13 ? 'K' : card.rank === 12 ? 'Q' : card.rank === 11 ? 'J' : card.rank}` : ''}
    </CardStyled>
  );
}

function isSequence(cards) {
  // Returns true if cards is a descending, same-suit, all-faceUp sequence
  if (cards.length === 0) return false;
  const suit = cards[0].suit;
  for (let i = 0; i < cards.length; i++) {
    if (!cards[i].faceUp || cards[i].suit !== suit) return false;
    if (i > 0 && cards[i-1].rank !== cards[i].rank + 1) return false;
  }
  return true;
}

function SpiderSolitaire() {
  const [difficulty, setDifficulty] = useState(1); // 1,2,4 suits
  const [deck, setDeck] = useState(() => generateDeck(difficulty));
  const [game, setGame] = useState(() => initialDeal(deck));
  const [selected, setSelected] = useState(null); // {col, idx}
  const [score, setScore] = useState(500);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [warning, setWarning] = useState('');

  // Handles card click for selection or move
  function handleCardClick(colIdx, cardIdx) {
    const col = game.tableau[colIdx];
    const card = col[cardIdx];
    if (!card.faceUp) return;
    // If nothing selected, select this card (and all below)
    if (!selected) {
      setSelected({ col: colIdx, idx: cardIdx });
      setWarning('');
      return;
    }
    // If already selected, try to move sequence
    if (selected.col === colIdx && selected.idx === cardIdx) {
      setSelected(null);
      setWarning('');
      return;
    }
    // Try move
    attemptMove(selected, { col: colIdx, idx: cardIdx });
  }

  // Handles column click for moving to empty column
  function handleColClick(colIdx) {
    if (!selected) return;
    const col = game.tableau[colIdx];
    if (col.length === 0) {
      attemptMove(selected, { col: colIdx, idx: 0 });
    }
  }

  // Attempts to move selected sequence to dest
  function attemptMove(from, to) {
    const srcCol = game.tableau[from.col];
    const moving = srcCol.slice(from.idx);
    // Must be all faceUp and same suit, descending
    if (!isSequence(moving)) {
      setSelected(null);
      setWarning('You must move a descending, same-suit, all face-up sequence.');
      return;
    }
    // Move to empty column
    if (game.tableau[to.col].length === 0) {
      doMove(from, to, moving);
      setWarning('');
      return;
    }
    // Move to another card: must be faceUp and rank+1
    const destCol = game.tableau[to.col];
    const destCard = destCol[to.idx];
    if (!destCard.faceUp) {
      setSelected(null);
      setWarning('Cannot move to a face-down card.');
      return;
    }
    if (destCard.rank === moving[0].rank + 1) {
      doMove(from, { col: to.col, idx: destCol.length }, moving);
      setWarning('');
      return;
    }
    setSelected(null);
    setWarning('Invalid move.');
  }

  // Performs the move and updates state
  function doMove(from, to, moving) {
    let tableau = game.tableau.map(col => col.slice());
    tableau[from.col] = tableau[from.col].slice(0, from.idx);
    tableau[to.col] = tableau[to.col].concat(moving.map(card => ({ ...card, faceUp: true }))); // Ensure all moved cards are faceUp
    // Flip next card if needed
    if (tableau[from.col].length && !tableau[from.col][tableau[from.col].length-1].faceUp) {
      tableau[from.col][tableau[from.col].length-1] = {
        ...tableau[from.col][tableau[from.col].length-1],
        faceUp: true
      };
    }
    // Check for completed suit sequence
    let completedSeqs = [];
    for (let i = 0; i < 10; i++) {
      let col = tableau[i];
      if (col.length >= 13) {
        let seq = col.slice(-13);
        if (isSequence(seq) && seq[0].rank === 13 && seq[12].rank === 1) {
          completedSeqs.push({ col: i, idx: col.length - 13 });
        }
      }
    }
    let completedList = completed.slice();
    completedSeqs.forEach(({col, idx}) => {
      completedList.push(tableau[col].slice(idx));
      tableau[col] = tableau[col].slice(0, idx);
    });
    setGame({ ...game, tableau });
    setCompleted(completedList);
    setScore(s => s + completedSeqs.length * 100 - 1);
    setMoves(m => m + 1);
    setSelected(null);
    setWarning('');
  }

  // Handles stock deal
  function handleStockDeal() {
    if (game.stock.length === 0) return;
    // Block if any column is empty
    if (game.tableau.some(col => col.length === 0)) {
      setWarning('Cannot deal a new row when any column is empty.');
      return;
    }
    let tableau = game.tableau.map(col => col.slice());
    let stock = game.stock.slice();
    let nextRow = stock.shift();
    for (let i = 0; i < 10; i++) {
      tableau[i].push({ ...nextRow[i], faceUp: true });
    }
    // Check for completed suit sequence after deal
    let completedSeqs = [];
    for (let i = 0; i < 10; i++) {
      let col = tableau[i];
      if (col.length >= 13) {
        let seq = col.slice(-13);
        if (isSequence(seq) && seq[0].rank === 13 && seq[12].rank === 1) {
          completedSeqs.push({ col: i, idx: col.length - 13 });
        }
      }
    }
    let completedList = completed.slice();
    completedSeqs.forEach(({col, idx}) => {
      completedList.push(tableau[col].slice(idx));
      tableau[col] = tableau[col].slice(0, idx);
    });
    setGame({ tableau, stock });
    setCompleted(completedList);
    setScore(s => s + completedSeqs.length * 100 - 1);
    setMoves(m => m + 1);
    setSelected(null);
    setWarning('');
  }

  return (
    <GameContainer>
      <h2>Spider Solitaire</h2>
      <div>
        <label>Difficulty: </label>
        <select value={difficulty} onChange={e => {
          let val = Number(e.target.value);
          setDifficulty(val);
          let newDeck = generateDeck(val);
          setDeck(newDeck);
          setGame(initialDeal(newDeck));
          setScore(500);
          setMoves(0);
          setCompleted([]);
          setSelected(null);
          setWarning('');
        }}>
          <option value={1}>1 Suit</option>
          <option value={2}>2 Suits</option>
          <option value={4}>4 Suits</option>
        </select>
        <button onClick={() => {
          setGame(initialDeal(deck));
          setScore(500);
          setMoves(0);
          setCompleted([]);
          setSelected(null);
          setWarning('');
        }}>New Game</button>
        <span style={{marginLeft:16}}>Score: {score} | Moves: {moves} | Completed: {completed.length}</span>
        {warning && <span style={{color:'#e53935',marginLeft:16}}>{warning}</span>}
      </div>
      <TableauRow>
        {game.tableau.map((col, i) => (
          <TableauCol key={i} onClick={() => handleColClick(i)}>
            {col.map((card, j) => <Card card={card} z={j} key={card.id} selected={selected && selected.col === i && selected.idx === j} onClick={e => { e.stopPropagation(); handleCardClick(i, j); }} />)}
          </TableauCol>
        ))}
      </TableauRow>
      <StockArea>
        <StockPile onClick={handleStockDeal} disabled={game.stock.length === 0} title="Deal new row">
          {game.stock.length > 0 ? game.stock.length : ''}
        </StockPile>
      </StockArea>
    </GameContainer>
  );
}

export default SpiderSolitaire;
