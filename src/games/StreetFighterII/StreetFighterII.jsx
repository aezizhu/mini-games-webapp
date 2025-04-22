import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { GameContainer } from '../../styles/Layout';
import CHARACTERS from './characters';
import STAGES from './stages';
import CharacterSelect from './CharacterSelect.jsx';

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

// --- Main Component ---
function StreetFighterII() {
  // --- Character/Stage Select State ---
  const [selectData, setSelectData] = useState(null);

  // --- Player state ---
  const [players, setPlayers] = useState([
    { ...CHARACTERS[0], hp: 100, x: 120, y: GROUND_Y, facing: 1, attacking: false, blocking: false },
    { ...CHARACTERS[1], hp: 100, x: 420, y: GROUND_Y, facing: -1, attacking: false, blocking: false }
  ]);
  const [turn, setTurn] = useState(0); // 0: Player 1, 1: Player 2
  const [gameOver, setGameOver] = useState(false);
  const [actionText, setActionText] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false); // Default: 2P local
  const [stage, setStage] = useState(STAGES[0]);
  const keysPressed = useRef({});

  // --- Character/Stage Select Logic ---
  if (!selectData) {
    return <CharacterSelect onSelect={({p1, p2, stage}) => {
      setPlayers([
        { ...p1, hp: 100, x: 120, y: GROUND_Y, facing: 1, attacking: false, blocking: false },
        { ...p2, hp: 100, x: 420, y: GROUND_Y, facing: -1, attacking: false, blocking: false }
      ]);
      setStage(stage);
      setSelectData({p1, p2, stage});
    }} />;
  }

  // --- Player Control Logic ---
  useEffect(() => {
    if (gameOver) return;
    function handleKeyDown(e) {
      // Player 1: WASD (move), F (attack), G (block), H (special)
      // Player 2: Arrow keys (move), 1 (attack), 2 (block), 3 (special)
      keysPressed.current[e.code] = true;
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
  }, [turn, aiEnabled, gameOver, players]);

  function handlePlayerAction() {
    if (gameOver) return;
    // Player 1 controls
    if (turn === 0) {
      if (keysPressed.current['KeyA']) doMove(0, -1);
      if (keysPressed.current['KeyD']) doMove(0, 1);
      if (keysPressed.current['KeyF']) doAttack(0);
      if (keysPressed.current['KeyG']) doBlock(0);
      if (keysPressed.current['KeyH']) doSpecial(0);
    }
    // Player 2 controls
    if (!aiEnabled && turn === 1) {
      if (keysPressed.current['ArrowLeft']) doMove(1, -1);
      if (keysPressed.current['ArrowRight']) doMove(1, 1);
      if (keysPressed.current['Numpad1']) doAttack(1);
      if (keysPressed.current['Numpad2']) doBlock(1);
      if (keysPressed.current['Numpad3']) doSpecial(1);
    }
  }

  function doMove(idx, dir) {
    setPlayers(ps => ps.map((p,i) => i===idx ? {...p, x: Math.max(0, Math.min(STAGE_WIDTH-PLAYER_WIDTH, p.x + dir*28)), facing: dir } : p));
    setActionText(`${players[idx].name} moves ${dir>0?'right':'left'}`);
    setTurn(t => 1-t);
  }
  function doAttack(idx) {
    if (players[idx].attacking) return;
    setPlayers(ps => ps.map((p,i) => i===idx ? {...p, attacking: true } : p));
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
      setTurn(t => 1-t);
    }, 320);
  }
  function doBlock(idx) {
    setPlayers(ps => ps.map((p,i) => i===idx ? {...p, blocking: true } : p));
    setActionText(`${players[idx].name} blocks!`);
    setTimeout(() => {
      setPlayers(ps => ps.map((p,i) => i===idx ? {...p, blocking: false } : p));
      setTurn(t => 1-t);
    }, 380);
  }
  function doSpecial(idx) {
    // Get special move for character
    const char = players[idx];
    const special = char.specialMoves && char.specialMoves[0];
    if (!special) return;
    setPlayers(ps => ps.map((p,i) => i===idx ? {...p, attacking: true } : p));
    setTimeout(() => {
      const me = players[idx], opp = players[1-idx];
      const result = special.effect(me, opp);
      setPlayers(ps => ps.map((p,i) => i===1-idx ? {...p, hp: result.oppHp } : p));
      setActionText(`${me.name} uses ${special.name}!`);
      setPlayers(ps => ps.map((p,i) => i===idx ? {...p, attacking: false } : p));
      setTurn(t => 1-t);
    }, 420);
  }

  // --- Win/Lose detection ---
  useEffect(() => {
    if (players[0].hp <= 0 || players[1].hp <= 0) {
      setGameOver(true);
      setActionText(`${players[0].hp <= 0 ? players[1].name : players[0].name} wins!`);
    }
  }, [players]);

  function handleRestart() {
    setSelectData(null); // Go back to select screen
    setGameOver(false);
    setActionText('');
  }

  return (
    <GameContainer>
      <h2>Street Fighter II (Mini)</h2>
      <InfoBar>
        <div><b>{players[0].name}</b><HealthBar><HealthFill hp={players[0].hp} /></HealthBar></div>
        <div><b>{players[1].name}</b><HealthBar><HealthFill hp={players[1].hp} /></HealthBar></div>
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
