import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { GameContainer, GameBoard, GameControls, Button, ScoreDisplay, ScoreLabel, ScoreValue } from '../../styles/Layout';
import { useSettings } from '../../contexts/SettingsContext';
import { useAudio } from '../../contexts/AudioContext';
import Tile from './Tile';

// 2048 Game Component
const Game2048 = () => {
  const { settings } = useSettings();
  const { playSound } = useAudio();
  
  // Game settings from context
  const gameSettings = settings.gameSpecific['2048'];
  const gridSize = gameSettings.gridSize;
  const winTarget = gameSettings.winTarget;
  const enableUndo = gameSettings.enableUndo;
  
  // Game state
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [previousBoards, setPreviousBoards] = useState([]);
  const [previousScores, setPreviousScores] = useState([]);
  
  // Initialize the game board
  const initializeGame = useCallback(() => {
    // Create an empty board
    const newBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    
    // Add two initial tiles
    const boardWithTiles = addRandomTile(addRandomTile(newBoard));
    
    setBoard(boardWithTiles);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setPreviousBoards([]);
    setPreviousScores([]);
    
    // Load best score from localStorage
    const savedBestScore = localStorage.getItem('2048_best_score');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
  }, [gridSize]);
  
  // Initialize game on component mount and when grid size changes
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  // Save best score to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('2048_best_score', bestScore.toString());
  }, [bestScore]);
  
  // Add a random tile to the board (2 or 4)
  const addRandomTile = (currentBoard) => {
    const newBoard = JSON.parse(JSON.stringify(currentBoard));
    const emptyCells = [];
    
    // Find all empty cells
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newBoard[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    
    // If there are empty cells, add a new tile
    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      newBoard[row][col] = Math.random() < 0.9 ? 2 : 4; // 90% chance for 2, 10% chance for 4
    }
    
    return newBoard;
  };
  
  // Check if the game is over (no more moves possible)
  const checkGameOver = (currentBoard) => {
    // Check if there are any empty cells
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (currentBoard[i][j] === 0) {
          return false;
        }
      }
    }
    
    // Check if there are any adjacent cells with the same value
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const value = currentBoard[i][j];
        
        // Check right
        if (j < gridSize - 1 && currentBoard[i][j + 1] === value) {
          return false;
        }
        
        // Check down
        if (i < gridSize - 1 && currentBoard[i + 1][j] === value) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Check if the player has won (reached the target tile)
  const checkWin = (currentBoard) => {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (currentBoard[i][j] === winTarget) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Move tiles in a direction and merge same-value tiles
  const moveTiles = (direction) => {
    // Save current state for undo
    setPreviousBoards([...previousBoards, JSON.parse(JSON.stringify(board))]);
    setPreviousScores([...previousScores, score]);
    
    let newBoard = JSON.parse(JSON.stringify(board));
    let newScore = score;
    let moved = false;
    
    // Process rows/columns based on direction
    if (direction === 'up' || direction === 'down') {
      // Process each column
      for (let col = 0; col < gridSize; col++) {
        const result = processTilesInLine(
          newBoard.map(row => row[col]),
          direction === 'up'
        );
        
        if (result.moved) {
          moved = true;
          newScore += result.scoreIncrease;
          
          // Update the column in the board
          for (let row = 0; row < gridSize; row++) {
            newBoard[row][col] = result.line[row];
          }
        }
      }
    } else {
      // Process each row
      for (let row = 0; row < gridSize; row++) {
        const result = processTilesInLine(
          [...newBoard[row]],
          direction === 'left'
        );
        
        if (result.moved) {
          moved = true;
          newScore += result.scoreIncrease;
          newBoard[row] = result.line;
        }
      }
    }
    
    // If tiles moved, add a new random tile
    if (moved) {
      newBoard = addRandomTile(newBoard);
      playSound('move');
      
      // Update score and best score
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
      }
      
      // Check if game is won
      if (!gameWon && checkWin(newBoard)) {
        setGameWon(true);
        playSound('win');
      }
      
      // Check if game is over
      if (checkGameOver(newBoard)) {
        setGameOver(true);
        playSound('gameOver');
      }
    }
    
    setBoard(newBoard);
  };
  
  // Process a line of tiles (row or column)
  const processTilesInLine = (line, moveToStart) => {
    const originalLine = [...line];
    let scoreIncrease = 0;
    
    // Remove zeros
    const nonZeroTiles = line.filter(tile => tile !== 0);
    
    // Merge tiles
    const mergedTiles = [];
    for (let i = 0; i < nonZeroTiles.length; i++) {
      if (i < nonZeroTiles.length - 1 && nonZeroTiles[i] === nonZeroTiles[i + 1]) {
        const mergedValue = nonZeroTiles[i] * 2;
        mergedTiles.push(mergedValue);
        scoreIncrease += mergedValue;
        i++; // Skip the next tile since it's merged
      } else {
        mergedTiles.push(nonZeroTiles[i]);
      }
    }
    
    // Fill the rest with zeros
    const newLine = Array(gridSize).fill(0);
    if (moveToStart) {
      // Place tiles at the start of the line
      for (let i = 0; i < mergedTiles.length; i++) {
        newLine[i] = mergedTiles[i];
      }
    } else {
      // Place tiles at the end of the line
      for (let i = 0; i < mergedTiles.length; i++) {
        newLine[gridSize - mergedTiles.length + i] = mergedTiles[i];
      }
    }
    
    // Check if the line has changed
    const moved = !originalLine.every((value, index) => value === newLine[index]);
    
    return { line: newLine, moved, scoreIncrease };
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || gameWon) return;
      
      switch (e.key) {
        case 'ArrowUp':
          moveTiles('up');
          break;
        case 'ArrowDown':
          moveTiles('down');
          break;
        case 'ArrowLeft':
          moveTiles('left');
          break;
        case 'ArrowRight':
          moveTiles('right');
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board, gameOver, gameWon]);
  
  // Handle undo
  const handleUndo = () => {
    if (previousBoards.length > 0) {
      const lastBoard = previousBoards.pop();
      const lastScore = previousScores.pop();
      
      setBoard(lastBoard);
      setScore(lastScore);
      setPreviousBoards([...previousBoards]);
      setPreviousScores([...previousScores]);
      setGameOver(false);
      setGameWon(false);
      
      playSound('undo');
    }
  };
  
  // Render the game board
  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>2048</GameTitle>
        <ScoreContainer>
          <ScoreDisplay>
            <ScoreLabel>Score</ScoreLabel>
            <ScoreValue>{score}</ScoreValue>
          </ScoreDisplay>
          <ScoreDisplay>
            <ScoreLabel>Best</ScoreLabel>
            <ScoreValue>{bestScore}</ScoreValue>
          </ScoreDisplay>
        </ScoreContainer>
      </GameHeader>
      
      <GameDescription>
        Join the tiles and get to the 2048 tile! Use arrow keys to move.
      </GameDescription>
      
      <Game2048Board $gridSize={gridSize}>
        <BoardBackground $gridSize={gridSize}>
          {Array(gridSize * gridSize).fill().map((_, index) => (
            <EmptyCell key={index} />
          ))}
        </BoardBackground>
        
        <TilesContainer>
          {board.map((row, rowIndex) => (
            row.map((value, colIndex) => (
              value !== 0 && (
                <Tile 
                  key={`${rowIndex}-${colIndex}`} 
                  value={value} 
                  row={rowIndex} 
                  col={colIndex} 
                  gridSize={gridSize} 
                />
              )
            ))
          ))}
        </TilesContainer>
        
        {gameOver && (
          <GameOverlay>
            <OverlayContent>
              <OverlayTitle>Game Over!</OverlayTitle>
              <OverlayScore>Score: {score}</OverlayScore>
              <Button onClick={initializeGame}>Try Again</Button>
            </OverlayContent>
          </GameOverlay>
        )}
        
        {gameWon && !gameOver && (
          <GameOverlay>
            <OverlayContent>
              <OverlayTitle>You Win!</OverlayTitle>
              <OverlayScore>Score: {score}</OverlayScore>
              <OverlayButtons>
                <Button onClick={() => setGameWon(false)} variant="secondary">Continue</Button>
                <Button onClick={initializeGame}>New Game</Button>
              </OverlayButtons>
            </OverlayContent>
          </GameOverlay>
        )}
      </Game2048Board>
      
      <GameControls>
        <Button onClick={() => moveTiles('up')}>Up</Button>
        <ButtonRow>
          <Button onClick={() => moveTiles('left')}>Left</Button>
          <Button onClick={() => moveTiles('down')}>Down</Button>
          <Button onClick={() => moveTiles('right')}>Right</Button>
        </ButtonRow>
        <ButtonRow>
          {enableUndo && previousBoards.length > 0 && (
            <Button onClick={handleUndo} variant="secondary">Undo</Button>
          )}
          <Button onClick={initializeGame} variant="secondary">New Game</Button>
        </ButtonRow>
      </GameControls>
    </GameContainer>
  );
};

// Styled components
const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 500px;
`;

const GameTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.game2048.text};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2rem;
  }
`;

const ScoreContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const GameDescription = styled.p`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  max-width: 500px;
`;

const Game2048Board = styled(GameBoard)`
  position: relative;
  background-color: ${({ theme }) => theme.colors.game2048.background};
  max-width: 500px;
  aspect-ratio: 1 / 1;
  padding: ${({ theme }) => theme.spacing.md};
`;

const BoardBackground = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$gridSize}, 1fr);
  grid-template-rows: repeat(${props => props.$gridSize}, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  height: 100%;
`;

const EmptyCell = styled.div`
  background-color: rgba(238, 228, 218, 0.35);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const TilesContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  bottom: ${({ theme }) => theme.spacing.md};
`;

const GameOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(238, 228, 218, 0.73);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: fadeIn 0.8s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const OverlayContent = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const OverlayTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.game2048.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const OverlayScore = styled.p`
  font-size: 1.25rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const OverlayButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

export default Game2048;