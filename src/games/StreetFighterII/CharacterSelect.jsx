import React, { useState } from 'react';
import styled from 'styled-components';
import CHARACTERS from './characters';
import STAGES from './stages';

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #222c;
  border-radius: 18px;
  padding: 32px 24px;
  margin: 32px auto;
  max-width: 520px;
  box-shadow: 0 8px 32px #0006;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin: 16px 0;
`;
const CharCard = styled.div`
  background: ${({selected, color})=>selected?color:'#fff'};
  border: 3px solid ${({selected})=>selected?'#111':'#888'};
  color: #222;
  border-radius: 12px;
  margin: 0 12px;
  width: 80px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2.1em;
  cursor: pointer;
  box-shadow: ${({selected})=>selected?'0 0 16px #000b':'0 2px 8px #0002'};
  transition: background 0.2s, box-shadow 0.2s;
`;
const StageCard = styled.div`
  border: 2px solid ${({selected})=>selected?'#b71c1c':'#888'};
  border-radius: 10px;
  margin: 0 10px;
  width: 100px;
  height: 60px;
  background: #222;
  background-image: ${({img})=>img?`url(${img})`:'none'};
  background-size: cover;
  background-position: center;
  cursor: pointer;
  box-shadow: ${({selected})=>selected?'0 0 10px #b71c1c':'0 1px 4px #0003'};
  transition: box-shadow 0.2s;
`;
const Button = styled.button`
  margin-top: 24px;
  font-size: 1.1em;
  padding: 8px 24px;
  border-radius: 8px;
  background: #b71c1c;
  color: #fff;
  border: none;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 8px #0003;
  &:hover { background: #d32f2f; }
`;

/**
 * CharacterSelect screen for Street Fighter II
 * Both players choose their character, then select stage, then start fight.
 */
function CharacterSelect({ onSelect }) {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(1);
  const [stage, setStage] = useState(0);

  function handleStart() {
    if (p1 === p2) return;
    onSelect({
      p1: CHARACTERS[p1],
      p2: CHARACTERS[p2],
      stage: STAGES[stage]
    });
  }

  return (
    <SelectContainer>
      <h2>Character Select</h2>
      <Row>
        <div>
          <div style={{textAlign:'center',marginBottom:6}}>Player 1</div>
          <Row>
            {CHARACTERS.map((ch,i)=>(
              <CharCard key={ch.name} selected={p1===i} color={ch.color} onClick={()=>setP1(i)}>{ch.sprite}<div style={{fontSize:'0.5em'}}>{ch.name}</div></CharCard>
            ))}
          </Row>
        </div>
        <div>
          <div style={{textAlign:'center',marginBottom:6}}>Player 2</div>
          <Row>
            {CHARACTERS.map((ch,i)=>(
              <CharCard key={ch.name} selected={p2===i} color={ch.color} onClick={()=>setP2(i)}>{ch.sprite}<div style={{fontSize:'0.5em'}}>{ch.name}</div></CharCard>
            ))}
          </Row>
        </div>
      </Row>
      <div style={{margin:'12px 0 4px 0',fontWeight:'bold'}}>Stage</div>
      <Row>
        {STAGES.map((st,i)=>(
          <StageCard key={st.name} selected={stage===i} img={st.image} onClick={()=>setStage(i)} title={st.name}></StageCard>
        ))}
      </Row>
      <Button onClick={handleStart} disabled={p1===p2}>Start Fight</Button>
      <div style={{marginTop:10,color:'#b71c1c',fontSize:'0.95em'}}>{p1===p2?"Players must choose different characters":""}</div>
    </SelectContainer>
  );
}

export default CharacterSelect;
