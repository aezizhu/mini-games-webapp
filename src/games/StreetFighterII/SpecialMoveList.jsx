import React from 'react';

/**
 * SpecialMoveList component
 * Shows all special moves for a character, with input and name.
 */
function SpecialMoveList({ character }) {
  if (!character || !character.specialMoves) return null;
  return (
    <div style={{marginTop:8,marginBottom:8}}>
      <b>Special Moves:</b>
      <ul style={{margin:0,paddingLeft:18}}>
        {character.specialMoves.map((move, i) => (
          <li key={move.name+move.input.join('-')} style={{marginBottom:2}}>
            <span style={{fontWeight:'bold'}}>{move.name}</span> —
            <span style={{marginLeft:6, fontFamily:'monospace', color:'#1976d2'}}>
              {move.input.join(' → ')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SpecialMoveList;
