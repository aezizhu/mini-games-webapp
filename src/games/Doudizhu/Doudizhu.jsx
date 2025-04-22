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

// ... rest of your code ...
