import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { GameContainer } from '../../styles/Layout';
import CHARACTERS from './characters';
import STAGES from './stages';
import CharacterSelect from './CharacterSelect.jsx';
import SpecialMoveList from './SpecialMoveList.jsx';

// --- Constants ---
const STAGE_WIDTH = 600;
const STAGE_HEIGHT = 240;
const GROUND_Y = 180;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 64;

// --- Styled Components ---
const Stage = styled.div`
  position: relative;
  width: ${STAGE_WIDTH}px;
  height: ${STAGE_HEIGHT}px;
  border: 3px solid #222;
  margin: 32px auto 0 auto;
  overflow: hidden;
`;
const Ground = styled.div`
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 60px;
  background: #4caf50;
  border-top: 2px solid #333;
`;
const PlayerSprite = styled.div`
  position: absolute;
  width: ${PLAYER_WIDTH}px;
  height: ${PLAYER_HEIGHT}px;
  font-size: 2.7em;
  text-align: center;
  line-height: ${PLAYER_HEIGHT}px;
  color: #fff;
  border-radius: 8px;
  ${({color}) => color && css`background: ${color};`}
  box-shadow: 0 4px 16px #2227;
  transition: left 0.12s, top 0.12s;
  z-index: 2;
`;
const HealthBar = styled.div`
  height: 18px;
  background: #222;
  border-radius: 8px;
  margin: 8px 0;
  overflow: hidden;
  width: 220px;
  box-shadow: 0 2px 6px #0004;
`;
const HealthFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #f44336, #ffeb3b);
  width: ${({hp}) => hp+'%'};
  transition: width 0.3s cubic-bezier(.8,0,.2,1);
`;
const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: ${STAGE_WIDTH}px;
  margin: 0 auto;
  font-size: 1.1em;
`;
const ActionText = styled.div`
  font-size: 1.2em;
  color: #b71c1c;
  font-weight: bold;
  margin-top: 8px;
  min-height: 32px;
  text-align: center;
`;

// --- Input Buffer for Special Move Recognition ---
const MAX_INPUT_BUFFER = 8;
function pushInput(buffer, key) {
  const buf = [...buffer, key];
  if (buf.length > MAX_INPUT_BUFFER) buf.shift();
  return buf;
}
function matchSpecial(inputBuffer, specials) {
  // Try to match any special move input from buffer tail
  for (const move of specials) {
    const seq = move.input;
    if (inputBuffer.slice(-seq.length).join(',') === seq.join(',')) {
      return move;
    }
  }
  return null;
}

// --- Main Component ---
function StreetFighterII() {
  // --- Character/Stage Select State ---
  const [selectData, setSelectData] = useState(null);

  // --- Player state ---
  const [players, setPlayers] = useState([
    { ...CHARACTERS[0], hp: 100, x: 120, y: GROUND_Y, facing: 1, attacking: false, blocking: false, inputBuffer: [] },
    { ...CHARACTERS[1], hp: 100, x: 420, y: GROUND_Y, facing: -1, attacking: false, blocking: false, inputBuffer: [] }
  ]);
  const [turn, setTurn] = useState(0); // 0: Player 1, 1: Player 2
  const [gameOver, setGameOver] = useState(false);
  const [actionText, setActionText] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false); // Default: 2P local
  const [stage, setStage] = useState(STAGES[0]);
  const keysPressed = useRef({});
  const actionLock = useRef(false); // Prevent multiple actions per turn

  // --- Character/Stage Select Logic ---
  if (!selectData) {
    return <CharacterSelect onSelect={({p1, p2, stage}) => {
      setPlayers([
        { ...p1, hp: 100, x: 120, y: GROUND_Y, facing: 1, attacking: false, blocking: false, inputBuffer: [] },
        { ...p2, hp: 100, x: 420, y: GROUND_Y, facing: -1, attacking: false, blocking: false, inputBuffer: [] }
      ]);
      setStage(stage);
      setTurn(0);
      setGameOver(false);
      setActionText('');
      setSelectData({p1, p2, stage});
    }} />;
  }

  useEffect(() => {
    if (!gameOver) {
      function handleKeyDown(e) {
        // Only allow input for current player and only if not locked/attacking/blocking
        if (actionLock.current || players[turn].attacking || players[turn].blocking || gameOver) return;
        keysPressed.current[e.code] = true;
        // Map key to logical input
        let input = null;
        if (turn === 0) {
          if (e.code === 'KeyA') input = 'Left';
          if (e.code === 'KeyD') input = 'Right';
          if (e.code === 'KeyF') input = 'Attack';
          if (e.code === 'KeyG') input = 'Block';
          if (e.code === 'KeyH') input = 'Special';
        } else if (!aiEnabled && turn === 1) {
          if (e.code === 'ArrowLeft') input = 'Left';
          if (e.code === 'ArrowRight') input = 'Right';
          if (e.code === 'Numpad1') input = 'Attack';
          if (e.code === 'Numpad2') input = 'Block';
          if (e.code === 'Numpad3') input = 'Special';
        }
        if (input) {
          setPlayers(ps => ps.map((p,i) => i===turn ? {...p, inputBuffer: pushInput(p.inputBuffer, input)} : p));
        }
        handlePlayerAction();
      }
      function handleKeyUp(e) {
        keysPressed.current[e.code] = false;
      }
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [turn, aiEnabled, gameOver, players]);

  function handlePlayerAction() {
    if (gameOver || actionLock.current || players[turn].attacking || players[turn].blocking) return;
    // Try special move input recognition
    const char = players[turn];
    const matched = matchSpecial(char.inputBuffer || [], char.specialMoves || []);
    if (matched) {
      actionLock.current = true;
      doSpecial(turn, matched);
      // Clear buffer for this player
      setPlayers(ps => ps.map((p,i) => i===turn ? {...p, inputBuffer: []} : p));
      return;
    }
    // Player 1 controls
    if (turn === 0) {
      if (keysPressed.current['KeyA']) { actionLock.current = true; doMove(0, -1); return; }
      if (keysPressed.current['KeyD']) { actionLock.current = true; doMove(0, 1); return; }
      if (keysPressed.current['KeyF']) { actionLock.current = true; doAttack(0); return; }
      if (keysPressed.current['KeyG']) { actionLock.current = true; doBlock(0); return; }
      if (keysPressed.current['KeyH']) { actionLock.current = true; doSpecial(0); return; }
    }
    // Player 2 controls
    if (!aiEnabled && turn === 1) {
      if (keysPressed.current['ArrowLeft']) { actionLock.current = true; doMove(1, -1); return; }
      if (keysPressed.current['ArrowRight']) { actionLock.current = true; doMove(1, 1); return; }
      if (keysPressed.current['Numpad1']) { actionLock.current = true; doAttack(1); return; }
      if (keysPressed.current['Numpad2']) { actionLock.current = true; doBlock(1); return; }
      if (keysPressed.current['Numpad3']) { actionLock.current = true; doSpecial(1); return; }
    }
  }

  function doMove(idx, dir) {
    setPlayers(ps => ps.map((p,i) => i===idx ? {...p, x: Math.max(0, Math.min(STAGE_WIDTH-PLAYER_WIDTH, p.x + dir*28)), facing: dir, inputBuffer: [] } : p));
    setActionText(`${players[idx].name} moves ${dir>0?'right':'left'}`);
    setTimeout(() => { actionLock.current = false; setTurn(t => 1-t); }, 180);
  }
  function doAttack(idx) {
    setPlayers(ps => ps.map((p,i) => i===idx ? {...p, attacking: true, inputBuffer: [] } : p));
    setTimeout(() => {
      const me = players[idx], opp = players[1-idx];
      if (Math.abs(me.x - opp.x) <= PLAYER_WIDTH+8 && !opp.blocking) {
        setPlayers(ps => ps.map((p,i) => i===1-idx ? {...p, hp: Math.max(0, p.hp-18) } : p));
        setActionText(`${me.name} hits ${opp.name}!`);
      } else if (Math.abs(me.x - opp.x) <= PLAYER_WIDTH+8 && opp.blocking) {
        setActionText(`${opp.name} blocks!`);
      } else {
        setActionText(`${me.name} misses!`);
      }
      setPlayers(ps => ps.map((p,i) => i===idx ? {...p, attacking: false } : p));
      actionLock.current = false;
      setTurn(t => 1-t);
    }, 320);
  }
  function doBlock(idx) {
    setPlayers(ps => ps.map((p,i) => i===idx ? {...p, blocking: true, inputBuffer: [] } : p));
    setActionText(`${players[idx].name} blocks!`);
    setTimeout(() => {
      setPlayers(ps => ps.map((p,i) => i===idx ? {...p, blocking: false } : p));
      actionLock.current = false;
      setTurn(t => 1-t);
    }, 380);
  }
  function doSpecial(idx, moveOverride) {
    const char = players[idx];
    const special = moveOverride || (char.specialMoves && char.specialMoves[0]);
    if (!special) { actionLock.current = false; return; }
    setPlayers(ps => ps.map((p,i) => i===idx ? {...p, attacking: true, inputBuffer: [] } : p));
    setTimeout(() => {
      const me = players[idx], opp = players[1-idx];
      const result = special.effect(me, opp);
      setPlayers(ps => ps.map((p,i) => i===1-idx ? {...p, hp: result.oppHp } : p));
      setActionText(`${me.name} uses ${special.name}!`);
      setPlayers(ps => ps.map((p,i) => i===idx ? {...p, attacking: false } : p));
      actionLock.current = false;
      setTurn(t => 1-t);
    }, 420);
  }

  // --- Win/Lose detection ---
  useEffect(() => {
    if (players[0].hp <= 0 || players[1].hp <= 0) {
      setGameOver(true);
      setActionText(`${players[0].hp <= 0 ? players[1].name : players[0].name} wins!`);
    }
  }, [players[0].hp, players[1].hp, players[0].name, players[1].name]);

  function handleRestart() {
    setSelectData(null); // Go back to select screen
    setGameOver(false);
    setActionText('');
    actionLock.current = false;
    setPlayers([
      { ...CHARACTERS[0], hp: 100, x: 120, y: GROUND_Y, facing: 1, attacking: false, blocking: false, inputBuffer: [] },
      { ...CHARACTERS[1], hp: 100, x: 420, y: GROUND_Y, facing: -1, attacking: false, blocking: false, inputBuffer: [] }
    ]);
    setTurn(0);
  }

  return (
    <GameContainer>
      <h2>Street Fighter II (Mini)</h2>
      <InfoBar>
        <div>
          <b>{players[0].name}</b>
          <HealthBar><HealthFill hp={players[0].hp} /></HealthBar>
          <SpecialMoveList character={players[0]} />
        </div>
        <div>
          <b>{players[1].name}</b>
          <HealthBar><HealthFill hp={players[1].hp} /></HealthBar>
          <SpecialMoveList character={players[1]} />
        </div>
      </InfoBar>
      <Stage style={{backgroundImage:`url(${stage.image})`, backgroundSize:'cover'}}>
        <PlayerSprite color={players[0].color} style={{left:players[0].x,top:players[0].y}}>{players[0].sprite}</PlayerSprite>
        <PlayerSprite color={players[1].color} style={{left:players[1].x,top:players[1].y,transform:'scaleX(-1)'}}>{players[1].sprite}</PlayerSprite>
        <Ground />
      </Stage>
      <ActionText>{actionText}</ActionText>
      <div style={{marginTop:12}}>
        <button onClick={handleRestart}>Restart / Character Select</button>
        <button style={{marginLeft:8}} onClick={()=>setAiEnabled(a=>!a)}>{aiEnabled?'Disable AI':'Enable AI (Player 2)'}</button>
      </div>
      <div style={{marginTop:16,fontSize:'0.95em',color:'#888'}}>
        Controls:<br/>
        Player 1: A/D (move), F (attack), G (block), H (special)<br/>
        Player 2: ←/→ (move), Numpad1 (attack), Numpad2 (block), Numpad3 (special)<br/>
        Choose your fighter and stage!<br/>
        For more characters, moves, and effects, please request!
      </div>
    </GameContainer>
  );
}

export default StreetFighterII;
