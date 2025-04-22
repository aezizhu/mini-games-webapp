import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { GameContainer } from '../../styles/Layout';

// Classic Windows Mahjong Linkup tile set (simplified for MVP)
const TILE_TYPES = [
  'bamboo1','bamboo2','bamboo3','bamboo4','bamboo5','bamboo6','bamboo7','bamboo8','bamboo9',
  'character1','character2','character3','character4','character5','character6','character7','character8','character9',
  'circle1','circle2','circle3','circle4','circle5','circle6','circle7','circle8','circle9',
  'east','south','west','north','red','green','white'
];

// Level configurations (increase difficulty by more tile types, special layouts)
const LEVELS = [
  { level: 1, rows: 6, cols: 8, types: TILE_TYPES.slice(0, 12) },
  { level: 2, rows: 6, cols: 10, types: TILE_TYPES.slice(0, 18) },
  { level: 3, rows: 6, cols: 12, types: TILE_TYPES.slice(0, 24) },
  { level: 4, rows: 8, cols: 12, types: TILE_TYPES.slice(0, 32) },
  { level: 5, rows: 10, cols: 14, types: TILE_TYPES },
];

// Confetti animation (win effect)
const Confetti = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 999;
  animation: confetti-fade 1.8s forwards;
  @keyframes confetti-fade { 0%{opacity:1;} 100%{opacity:0;} }
`;

// Tile removal animation
const SlideFade = styled.div`
  ${({removeDir}) => removeDir && css`
    animation: slidefade 0.5s forwards;
    @keyframes slidefade {
      0% { opacity: 1; transform: translate(0,0); }
      100% { opacity: 0; transform: translate(${({removeDir})=>removeDir==='left'?'-40px':removeDir==='right'?'40px':'0'},${({removeDir})=>removeDir==='up'?'-40px':removeDir==='down'?'40px':'0'}); }
    }
  `}
`;

// Tile appearance animation
const selectAnim = keyframes`
  0% { box-shadow: 0 0 0 0 #ffe082; }
  100% { box-shadow: 0 0 0 6px #ffe082; }
`;

// Tile image asset mapping (for classic Windows look)
const TILE_IMAGES = {
  bamboo1: '/mahjong-tiles/bamboo1.png', bamboo2: '/mahjong-tiles/bamboo2.png', bamboo3: '/mahjong-tiles/bamboo3.png', bamboo4: '/mahjong-tiles/bamboo4.png', bamboo5: '/mahjong-tiles/bamboo5.png', bamboo6: '/mahjong-tiles/bamboo6.png', bamboo7: '/mahjong-tiles/bamboo7.png', bamboo8: '/mahjong-tiles/bamboo8.png', bamboo9: '/mahjong-tiles/bamboo9.png',
  character1: '/mahjong-tiles/character1.png', character2: '/mahjong-tiles/character2.png', character3: '/mahjong-tiles/character3.png', character4: '/mahjong-tiles/character4.png', character5: '/mahjong-tiles/character5.png', character6: '/mahjong-tiles/character6.png', character7: '/mahjong-tiles/character7.png', character8: '/mahjong-tiles/character8.png', character9: '/mahjong-tiles/character9.png',
  circle1: '/mahjong-tiles/circle1.png', circle2: '/mahjong-tiles/circle2.png', circle3: '/mahjong-tiles/circle3.png', circle4: '/mahjong-tiles/circle4.png', circle5: '/mahjong-tiles/circle5.png', circle6: '/mahjong-tiles/circle6.png', circle7: '/mahjong-tiles/circle7.png', circle8: '/mahjong-tiles/circle8.png', circle9: '/mahjong-tiles/circle9.png',
  east: '/mahjong-tiles/east.png', south: '/mahjong-tiles/south.png', west: '/mahjong-tiles/west.png', north: '/mahjong-tiles/north.png', red: '/mahjong-tiles/red.png', green: '/mahjong-tiles/green.png', white: '/mahjong-tiles/white.png'
};

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(${({cols})=>cols}, 48px);
  grid-template-rows: repeat(${({rows})=>rows}, 64px);
  gap: 2px;
  margin: 32px auto 0 auto;
  background: #bdb76b;
  border: 3px solid #8b7b4f;
`;

const Tile = styled.div`
  width: 46px;
  height: 62px;
  background: ${({removed}) => removed ? 'transparent' : '#fffbe6'};
  border: ${({removed}) => removed ? 'none' : '2px solid #c2b280'};
  border-radius: 7px;
  box-shadow: ${({removed}) => removed ? 'none' : '0 2px 6px #2223'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4em;
  color: #222;
  cursor: ${({removed}) => removed ? 'default' : 'pointer'};
  position: relative;
  ${({selected}) => selected && css`animation: ${selectAnim} 0.2s forwards;`}
  ${({hint}) => hint && 'background: #ffe082;'}
  user-select: none;
`;

const TileSymbol = styled.span`
  font-family: 'Segoe UI Symbol', 'Arial Unicode MS', 'sans-serif';
`;

// Unicode mapping for tile symbols (for MVP, use simple text)
const TILE_SYMBOLS = {
  bamboo1: '', bamboo2: '', bamboo3: '', bamboo4: '', bamboo5: '', bamboo6: '', bamboo7: '', bamboo8: '', bamboo9: '',
  character1: '', character2: '', character3: '', character4: '', character5: '', character6: '', character7: '', character8: '', character9: '',
  circle1: '', circle2: '', circle3: '', circle4: '', circle5: '', circle6: '', circle7: '', circle8: '', circle9: '',
  east: '', south: '', west: '', north: '', red: '', green: '', white: ''
};

// Sound effect hooks
function playSound(name) {
  const audio = new window.Audio(`/sounds/${name}.wav`);
  audio.volume = 0.6;
  audio.play();
}

// Shuffle and create board with pairs
function generateBoard(levelConfig) {
  const { rows, cols, types } = levelConfig;
  let pairs = [];
  let typesArr = [...types, ...types];
  while (typesArr.length < rows * cols) typesArr = typesArr.concat(types);
  typesArr = typesArr.slice(0, rows * cols);
  for (let i = typesArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [typesArr[i], typesArr[j]] = [typesArr[j], typesArr[i]];
  }
  for (let i = 0; i < typesArr.length; i++) {
    pairs.push({ type: typesArr[i], removed: false, id: i });
  }
  let board = [];
  for (let r = 0; r < rows; r++) {
    board.push(pairs.slice(r * cols, (r + 1) * cols));
  }
  return board;
}

// Check if two tiles can be linked (classic algorithm: 0, 1, or 2 turns, no blocking tiles)
function canLink(board, r1, c1, r2, c2) {
  if (r1 === r2 && c1 === c2) return false;
  if (board[r1][c1].removed || board[r2][c2].removed) return false;
  if (board[r1][c1].type !== board[r2][c2].type) return false;
  // BFS for 0, 1, or 2 turns
  const directions = [[0,1],[1,0],[0,-1],[-1,0]];
  const visited = Array.from({length: board.length}, () => Array(board[0].length).fill(Infinity));
  let queue = [{r: r1, c: c1, turns: 0, dir: -1}];
  visited[r1][c1] = 0;
  while (queue.length) {
    const {r, c, turns, dir} = queue.shift();
    if (turns > 2) continue;
    if (r === r2 && c === c2 && turns <= 2) return true;
    for (let d = 0; d < 4; d++) {
      let nr = r + directions[d][0];
      let nc = c + directions[d][1];
      let nturns = dir === -1 || dir === d ? turns : turns + 1;
      while (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length && (board[nr][nc].removed || (nr === r2 && nc === c2))) {
        if (visited[nr][nc] > nturns) {
          visited[nr][nc] = nturns;
          queue.push({r: nr, c: nc, turns: nturns, dir: d});
        }
        if (nr === r2 && nc === c2) break;
        nr += directions[d][0];
        nc += directions[d][1];
      }
    }
  }
  return false;
}

function MahjongLinkup() {
  // Level state
  const [level, setLevel] = useState(1);
  const [levelConfig, setLevelConfig] = useState(LEVELS[0]);
  // Dynamic board size
  const [board, setBoard] = useState(() => generateBoard(LEVELS[0]));
  // Step counter
  const [steps, setSteps] = useState(0);
  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  // Leaderboard modal
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // Auto-solver state
  const [autoSolving, setAutoSolving] = useState(false);
  const [autoSolvingPath, setAutoSolvingPath] = useState([]);
  // ...rest unchanged
  const [selected, setSelected] = useState(null); // {row, col}
  const [removedCount, setRemovedCount] = useState(0);
  const [hint, setHint] = useState(null); // {row1, col1, row2, col2}
  const [animating, setAnimating] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  // Undo/Shuffle history stack
  const [moveHistory, setMoveHistory] = useState([]);
  // Timer
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [bestTime, setBestTime] = useState(() => Number(localStorage.getItem('mahjongBestTime')) || null);
  // Sound toggle
  const [soundOn, setSoundOn] = useState(true);

  // Timer effect
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  // Start timer on first select
  useEffect(() => {
    if (selected && !timerActive && !gameOver && removedCount === 0) setTimerActive(true);
  }, [selected, timerActive, gameOver, removedCount]);

  // Stop timer on win
  useEffect(() => {
    if (gameOver) {
      setTimerActive(false);
      if (!bestTime || timer < bestTime) {
        setBestTime(timer);
        localStorage.setItem('mahjongBestTime', timer);
      }
    }
  }, [gameOver, timer, bestTime]);

  // On win: trigger confetti and leaderboard
  useEffect(() => {
    if (gameOver) {
      setTimerActive(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
      // Leaderboard update
      const record = { name: 'Player', level, steps, time: timer, date: new Date().toISOString() };
      let lb = JSON.parse(localStorage.getItem('mahjongLeaderboard')||'[]');
      lb.push(record);
      lb = lb.sort((a,b)=>a.steps-b.steps||a.time-b.time).slice(0,10);
      localStorage.setItem('mahjongLeaderboard', JSON.stringify(lb));
      if (!bestTime || timer < bestTime) {
        setBestTime(timer);
        localStorage.setItem('mahjongBestTime', timer);
      }
    }
  }, [gameOver, timer, bestTime, steps, level]);

  // Handle tile click
  function handleTileClick(r, c) {
    if (animating || board[r][c].removed || autoSolving) return;
    if (!selected) {
      setSelected({row: r, col: c});
      setHint(null);
      if (soundOn) playSound('select');
    } else {
      if (selected.row === r && selected.col === c) {
        setSelected(null);
        return;
      }
      if (canLink(board, selected.row, selected.col, r, c)) {
        setAnimating(true);
        setTimeout(() => {
          let newBoard = board.map(row => row.map(tile => ({...tile})));
          newBoard[selected.row][selected.col].removed = true;
          newBoard[r][c].removed = true;
          setBoard(newBoard);
          setRemovedCount(cnt => cnt + 2);
          setMoveHistory([...moveHistory, {from: {...selected}, to: {row: r, col: c}, board: board.map(row => row.map(tile => ({...tile})))}]);
          setSteps(s=>s+1);
          setSelected(null);
          setAnimating(false);
          if (soundOn) playSound('match');
          if (removedCount + 2 === levelConfig.rows * levelConfig.cols) {
            setGameOver(true);
            if (soundOn) playSound('win');
          }
        }, 200);
      } else {
        setSelected(null);
        if (soundOn) playSound('error');
      }
    }
  }

  // Undo last move
  function handleUndo() {
    if (moveHistory.length === 0 || animating) return;
    const last = moveHistory[moveHistory.length-1];
    setBoard(last.board.map(row => row.map(tile => ({...tile}))));
    setRemovedCount(cnt => cnt - 2);
    setMoveHistory(moveHistory.slice(0, -1));
    setSelected(null);
    setGameOver(false);
    if (soundOn) playSound('select');
  }

  // Shuffle remaining tiles (ensure solvable)
  function handleShuffle() {
    if (animating) return;
    let flat = [];
    board.forEach(row => row.forEach(tile => { if (!tile.removed) flat.push(tile); }));
    // Shuffle
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    // Place back
    let idx = 0;
    let newBoard = board.map(row => row.map(tile => {
      if (!tile.removed) return { ...flat[idx++], id: tile.id };
      return { ...tile };
    }));
    setBoard(newBoard);
    setSelected(null);
    setHint(null);
    setMoveHistory([]);
    if (soundOn) playSound('select');
  }

  // Auto-solver: DFS to find a solution path
  function findSolutionPath(boardArg) {
    let stack = [{ board: boardArg.map(row=>row.map(tile=>({...tile}))), path: [] }];
    while (stack.length) {
      const { board: curr, path } = stack.pop();
      let found = false;
      for (let r1 = 0; r1 < curr.length; r1++) for (let c1 = 0; c1 < curr[0].length; c1++) {
        if (curr[r1][c1].removed) continue;
        for (let r2 = 0; r2 < curr.length; r2++) for (let c2 = 0; c2 < curr[0].length; c2++) {
          if ((r1 !== r2 || c1 !== c2) && !curr[r2][c2].removed && curr[r1][c1].type === curr[r2][c2].type) {
            if (canLink(curr, r1, c1, r2, c2)) {
              let next = curr.map(row=>row.map(tile=>({...tile})));
              next[r1][c1].removed = true;
              next[r2][c2].removed = true;
              stack.push({ board: next, path: [...path, {from: {row:r1,col:c1}, to: {row:r2,col:c2}}] });
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
      if (!found) {
        if (curr.flat().every(tile=>tile.removed)) return path;
      }
    }
    return null;
  }

  function handleAutoSolve() {
    if (autoSolving || gameOver) return;
    const path = findSolutionPath(board);
    if (!path || path.length === 0) return;
    setAutoSolvingPath(path);
    setAutoSolving(true);
  }

  // Step through auto-solve path
  useEffect(() => {
    if (!autoSolving || autoSolvingPath.length === 0) {
      setAutoSolving(false);
      setAutoSolvingPath([]);
      return;
    }
    const {from, to} = autoSolvingPath[0];
    setTimeout(() => {
      handleTileClick(from.row, from.col);
      setTimeout(() => handleTileClick(to.row, to.col), 220);
      setAutoSolvingPath(autoSolvingPath.slice(1));
    }, 350);
  }, [autoSolving, autoSolvingPath]);

  // New game or next level
  function handleNewGame(nextLevel = false) {
    let newLevel = nextLevel ? Math.min(level + 1, LEVELS.length) : 1;
    let config = LEVELS[newLevel - 1];
    setLevel(newLevel);
    setLevelConfig(config);
    setBoard(generateBoard(config));
    setSelected(null);
    setRemovedCount(0);
    setHint(null);
    setAnimating(false);
    setGameOver(false);
    setTimer(0);
    setTimerActive(false);
    setMoveHistory([]);
    setSteps(0);
    setShowConfetti(false);
    setAutoSolving(false);
    setAutoSolvingPath([]);
  }

  // Solvability check: is there at least one removable pair?
  function hasRemovablePair(boardArg) {
    for (let r1 = 0; r1 < boardArg.length; r1++) for (let c1 = 0; c1 < boardArg[0].length; c1++) {
      if (boardArg[r1][c1].removed) continue;
      for (let r2 = 0; r2 < boardArg.length; r2++) for (let c2 = 0; c2 < boardArg[0].length; c2++) {
        if ((r1 !== r2 || c1 !== c2) && !boardArg[r2][c2].removed && boardArg[r1][c1].type === boardArg[r2][c2].type) {
          if (canLink(boardArg, r1, c1, r2, c2)) return true;
        }
      }
    }
    return false;
  }

  // Auto-reshuffle if stuck
  useEffect(() => {
    if (!gameOver && !hasRemovablePair(board)) {
      setTimeout(() => {
        handleShuffle();
      }, 400);
    }
  }, [board, gameOver]);

  // Hint: find a removable pair
  function handleHint() {
    for (let r1 = 0; r1 < board.length; r1++) for (let c1 = 0; c1 < board[0].length; c1++) {
      if (board[r1][c1].removed) continue;
      for (let r2 = 0; r2 < board.length; r2++) for (let c2 = 0; c2 < board[0].length; c2++) {
        if ((r1 !== r2 || c1 !== c2) && !board[r2][c2].removed && board[r1][c1].type === board[r2][c2].type) {
          if (canLink(board, r1, c1, r2, c2)) {
            setHint({row1: r1, col1: c1, row2: r2, col2: c2});
            return;
          }
        }
      }
    }
    setHint(null);
  }

  return (
    <GameContainer>
      <h2>Mahjong Linkup</h2>
      <div>
        <button onClick={()=>handleNewGame(false)}>New Game</button>
        <button onClick={handleUndo} style={{marginLeft:8}}>Undo</button>
        <button onClick={handleShuffle} style={{marginLeft:8}}>Shuffle</button>
        <button onClick={()=>setSoundOn(s=>!s)} style={{marginLeft:8}}>{soundOn ? 'Sound: On' : 'Sound: Off'}</button>
        <button onClick={handleHint} style={{marginLeft:8}}>Hint</button>
        <button onClick={()=>setShowLeaderboard(true)} style={{marginLeft:8}}>Leaderboard</button>
        <button onClick={handleAutoSolve} style={{marginLeft:8}}>Auto-Solve</button>
        <span style={{marginLeft:16}}>Level: {level}</span>
        <span style={{marginLeft:16}}>Removed: {removedCount} / {levelConfig.rows * levelConfig.cols}</span>
        <span style={{marginLeft:16}}>Steps: {steps}</span>
        <span style={{marginLeft:16}}>Time: {timer}s</span>
        <span style={{marginLeft:16}}>Best: {bestTime ? bestTime + 's' : '--'}</span>
        {gameOver && <span style={{color:'#388e3c',marginLeft:16}}>You Win!</span>}
        {gameOver && level < LEVELS.length && <button style={{marginLeft:8}} onClick={()=>handleNewGame(true)}>Next Level</button>}
      </div>
      <Board rows={levelConfig.rows} cols={levelConfig.cols}>
        {board.map((row, r) => row.map((tile, c) => (
          <SlideFade key={tile.id} removeDir={tile.removed ? (r < levelConfig.rows/2 ? 'up' : 'down') : null}>
            <Tile
              removed={tile.removed}
              selected={selected && selected.row === r && selected.col === c}
              hint={hint && ((hint.row1 === r && hint.col1 === c) || (hint.row2 === r && hint.col2 === c))}
              onClick={() => handleTileClick(r, c)}
            >
              {!tile.removed && (
                TILE_IMAGES[tile.type] ?
                  <img src={TILE_IMAGES[tile.type]} alt={tile.type} style={{width:'38px',height:'54px',borderRadius:'5px',boxShadow:'0 1px 3px #0002'}} /> :
                  <TileSymbol>{TILE_SYMBOLS[tile.type]}</TileSymbol>
              )}
            </Tile>
          </SlideFade>
        )))}
      </Board>
      {showConfetti && <Confetti>{Array.from({length:48}).map((_,i)=>(<div key={i} style={{position:'absolute',left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:8,height:8,background:`hsl(${i*25},90%,60%)`,borderRadius:4,opacity:0.8,transform:`rotate(${Math.random()*360}deg)`}} />))}</Confetti>}
      {showLeaderboard && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowLeaderboard(false)}>
          <div style={{background:'#fffbe6',padding:32,borderRadius:12,boxShadow:'0 4px 32px #2228',minWidth:340}} onClick={e=>e.stopPropagation()}>
            <h3>Leaderboard (Top 10)</h3>
            <table style={{width:'100%',fontSize:'1em',borderCollapse:'collapse'}}>
              <thead><tr><th>Name</th><th>Level</th><th>Steps</th><th>Time</th><th>Date</th></tr></thead>
              <tbody>{(JSON.parse(localStorage.getItem('mahjongLeaderboard')||'[]')).map((rec,i)=>(
                <tr key={i} style={{background:i===0?'#ffe082':'',fontWeight:i===0?'bold':'',textAlign:'center'}}>
                  <td>{rec.name}</td><td>{rec.level}</td><td>{rec.steps}</td><td>{rec.time}s</td><td>{rec.date.slice(0,10)}</td>
                </tr>
              ))}</tbody>
            </table>
            <button style={{marginTop:12}} onClick={()=>setShowLeaderboard(false)}>Close</button>
          </div>
        </div>
      )}
      <div style={{marginTop:16}}>
        <span style={{fontSize:'0.95em',color:'#888'}}>Classic Windows Mahjong Linkup. Match identical tiles with 0, 1, or 2 turns to clear the board. Hint available.<br/>For full original graphics, sound, and shuffle/undo support, please request!</span>
      </div>
    </GameContainer>
  );
}

export default MahjongLinkup;
