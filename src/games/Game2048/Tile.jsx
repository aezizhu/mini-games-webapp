import { useEffect, useState } from 'react';
import styled from 'styled-components';

// Tile component for the 2048 game
const Tile = ({ value, row, col, gridSize }) => {
  const [isNew, setIsNew] = useState(true);
  const [isMerged, setIsMerged] = useState(false);
  
  // Reset animation states after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNew(false);
      setIsMerged(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get background color based on tile value
  const getBackgroundColor = () => {
    const colors = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    
    return colors[value] || '#3c3a32';
  };
  
  // Get text color based on tile value
  const getTextColor = () => {
    return value <= 4 ? '#776e65' : '#f9f6f2';
  };
  
  // Get font size based on tile value and grid size
  const getFontSize = () => {
    const baseFontSize = 55;
    const digitCount = value.toString().length;
    
    // Adjust font size based on digit count and grid size
    if (gridSize === 3) {
      return `${baseFontSize - (digitCount - 1) * 10}px`;
    } else if (gridSize === 4) {
      return `${baseFontSize - (digitCount - 1) * 12}px`;
    } else if (gridSize === 5) {
      return `${baseFontSize - (digitCount - 1) * 15 - 10}px`;
    } else {
      return `${baseFontSize - (digitCount - 1) * 15 - 20}px`;
    }
  };
  
  return (
    <TileContainer 
      $row={row} 
      $col={col} 
      $gridSize={gridSize}
      $backgroundColor={getBackgroundColor()}
      $textColor={getTextColor()}
      $fontSize={getFontSize()}
      $isNew={isNew}
      $isMerged={isMerged}
    >
      {value}
    </TileContainer>
  );
};

// Styled component for the tile
const TileContainer = styled.div`
  position: absolute;
  width: calc((100% - ${props => (props.$gridSize - 1) * 8}px) / ${props => props.$gridSize});
  height: calc((100% - ${props => (props.$gridSize - 1) * 8}px) / ${props => props.$gridSize});
  top: calc(${props => props.$row} * (100% + 8px) / ${props => props.$gridSize});
  left: calc(${props => props.$col} * (100% + 8px) / ${props => props.$gridSize});
  background-color: ${props => props.$backgroundColor};
  color: ${props => props.$textColor};
  font-size: ${props => props.$fontSize};
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: transform 0.15s ease, opacity 0.15s ease;
  animation: ${props => props.$isNew ? 'appear 0.2s ease' : props.$isMerged ? 'pop 0.2s ease' : 'none'};
  
  @keyframes appear {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes pop {
    0% {
      transform: scale(0.8);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export default Tile;