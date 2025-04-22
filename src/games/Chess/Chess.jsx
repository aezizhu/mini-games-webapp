import React, { useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';

// Chess piece unicode symbols
const PIECES = {
  wK: '\u2654', wQ: '\u2655', wR: '\u2656', wB: '\u2657', wN: '\u2658', wP: '\u2659',
  bK: '\u265A', bQ: '\u265B', bR: '\u265C', bB: '\u265D', bN: '\u265E', bP: '\u265F'
};

// Initial classic chess board setup
const initialBoard = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR']
];

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 48px);
  grid-template-rows: repeat(8, 48px);
  border: 3px solid #3e2723;
  margin: 24px auto 0 auto;
  background: #b58863;
`;

const Square = styled.div`
  width: 48px;
  height: 48px;
  background: ${({black}) => black ? '#b58863' : '#f0d9b5'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  cursor: pointer;
  border: 1px solid #7a5c3e;
  box-sizing: border-box;
  position: relative;
  ${({selected}) => selected && 'box-shadow: 0 0 0 4px #ffe082 inset;'}
  ${({highlight}) => highlight && 'background: #ffe082;'}
`;

function Chess() {
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState('w'); // 'w' or 'b'
  const [selected, setSelected] = useState(null); // {row, col}
  const [legalMoves, setLegalMoves] = useState([]); // [{row, col}]
  const [history, setHistory] = useState([]); // [{board, turn}]
  const [status, setStatus] = useState('White to move');

  // Returns true if (row, col) is inside the board
  function inBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  // Returns true if the piece belongs to the current player
  function isOwnPiece(piece) {
    return piece && piece[0] === turn;
  }

  // Returns true if the piece belongs to the opponent
  function isOpponentPiece(piece) {
    return piece && piece[0] !== turn;
  }

  // Returns an array of legal moves for the selected piece
  function getLegalMoves(row, col) {
    const piece = board[row][col];
    if (!piece || piece[0] !== turn) return [];
    const type = piece[1];
    const moves = [];
    // Pawn moves
    if (type === 'P') {
      const dir = turn === 'w' ? -1 : 1;
      // Forward
      if (inBounds(row+dir, col) && !board[row+dir][col]) {
        moves.push({row: row+dir, col});
        // First move double-step
        if ((turn === 'w' && row === 6) || (turn === 'b' && row === 1)) {
          if (!board[row+2*dir][col]) moves.push({row: row+2*dir, col});
        }
      }
      // Captures
      for (let dc of [-1,1]) {
        if (inBounds(row+dir, col+dc) && isOpponentPiece(board[row+dir][col+dc])) {
          moves.push({row: row+dir, col: col+dc});
        }
      }
      // TODO: en passant
    }
    // Knight moves
    if (type === 'N') {
      for (let [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        let nr = row+dr, nc = col+dc;
        if (inBounds(nr, nc) && (!board[nr][nc] || isOpponentPiece(board[nr][nc]))) {
          moves.push({row: nr, col: nc});
        }
      }
    }
    // Bishop moves
    if (type === 'B' || type === 'Q') {
      for (let [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
        let nr = row+dr, nc = col+dc;
        while (inBounds(nr, nc)) {
          if (!board[nr][nc]) {
            moves.push({row: nr, col: nc});
          } else {
            if (isOpponentPiece(board[nr][nc])) moves.push({row: nr, col: nc});
            break;
          }
          nr += dr; nc += dc;
        }
      }
    }
    // Rook moves
    if (type === 'R' || type === 'Q') {
      for (let [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        let nr = row+dr, nc = col+dc;
        while (inBounds(nr, nc)) {
          if (!board[nr][nc]) {
            moves.push({row: nr, col: nc});
          } else {
            if (isOpponentPiece(board[nr][nc])) moves.push({row: nr, col: nc});
            break;
          }
          nr += dr; nc += dc;
        }
      }
    }
    // King moves
    if (type === 'K') {
      for (let dr=-1; dr<=1; dr++) {
        for (let dc=-1; dc<=1; dc++) {
          if (dr===0 && dc===0) continue;
          let nr = row+dr, nc = col+dc;
          if (inBounds(nr, nc) && (!board[nr][nc] || isOpponentPiece(board[nr][nc]))) {
            moves.push({row: nr, col: nc});
          }
        }
      }
      // TODO: castling
    }
    return moves;
  }

  // Handles square click (select/move)
  function handleSquareClick(row, col) {
    if (selected && legalMoves.some(m => m.row === row && m.col === col)) {
      // Move
      const newBoard = board.map(r => r.slice());
      newBoard[row][col] = board[selected.row][selected.col];
      newBoard[selected.row][selected.col] = null;
      setHistory([...history, { board, turn }]);
      setBoard(newBoard);
      setSelected(null);
      setLegalMoves([]);
      const nextTurn = turn === 'w' ? 'b' : 'w';
      setTurn(nextTurn);
      setStatus(nextTurn === 'w' ? 'White to move' : 'Black to move');
      // TODO: check, checkmate, stalemate detection
      return;
    }
    if (board[row][col] && isOwnPiece(board[row][col])) {
      setSelected({ row, col });
      setLegalMoves(getLegalMoves(row, col));
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  }

  // Undo last move
  function handleUndo() {
    if (history.length === 0) return;
    const last = history[history.length-1];
    setBoard(last.board);
    setTurn(last.turn);
    setHistory(history.slice(0, -1));
    setSelected(null);
    setLegalMoves([]);
    setStatus(last.turn === 'w' ? 'White to move' : 'Black to move');
  }

  // Render chessboard
  return (
    <GameContainer>
      <h2>Chess</h2>
      <div>
        <button onClick={() => {
          setBoard(initialBoard.map(r => r.slice()));
          setTurn('w');
          setSelected(null);
          setLegalMoves([]);
          setHistory([]);
          setStatus('White to move');
        }}>New Game</button>
        <button onClick={handleUndo} style={{marginLeft:8}}>Undo</button>
        <span style={{marginLeft:16}}>{status}</span>
      </div>
      <Board>
        {board.map((rowArr, row) => rowArr.map((piece, col) => (
          <Square
            key={row+','+col}
            black={(row+col)%2===1}
            selected={selected && selected.row === row && selected.col === col}
            highlight={legalMoves.some(m => m.row === row && m.col === col)}
            onClick={() => handleSquareClick(row, col)}
          >
            {piece ? String.fromCharCode(parseInt(PIECES[piece].slice(2), 16)) : ''}
          </Square>
        )))}
      </Board>
      <div style={{marginTop:16}}>
        <span style={{fontSize:'0.95em',color:'#888'}}>Classic Windows Chess. No AI yet. Play against a friend!<br/>Castling, en passant, pawn promotion, check/checkmate coming soon.</span>
      </div>
    </GameContainer>
  );
}

export default Chess;
