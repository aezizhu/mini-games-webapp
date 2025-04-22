import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaPuzzlePiece, 
  FaGamepad, 
  FaDragon, 
  FaDice, 
  FaCalculator, 
  FaRegCreditCard, 
  FaBomb, 
  FaHeart,
  FaCircle
} from 'react-icons/fa';
import { Grid, Card, PageContainer } from '../styles/Layout';

// Home page component displaying game cards
const Home = () => {
  // Game data
  const games = [
    {
      id: '2048',
      title: '2048',
      description: 'A sliding puzzle game where you combine numbered tiles to reach 2048.',
      icon: <FaPuzzlePiece />,
      color: '#edc22e',
      path: '/2048'
    },
    {
      id: 'tetris',
      title: 'Tetris',
      description: 'A tile-matching puzzle game where you arrange falling tetrominos.',
      icon: <FaGamepad />,
      color: '#00a9eb',
      path: '/tetris'
    },
    {
      id: 'snake',
      title: 'Snake',
      description: 'Control a growing snake that must avoid collisions while collecting food.',
      icon: <FaDragon />,
      color: '#4caf50',
      path: '/snake'
    },
    {
      id: 'slot-machine',
      title: 'Slot Machine',
      description: 'A gambling machine simulation with spinning reels and winning combinations.',
      icon: <FaDice />,
      color: '#f44336',
      path: '/slot-machine'
    },
    {
      id: '24-points',
      title: '24 Points',
      description: 'A math puzzle where you use four numbers and operations to reach 24.',
      icon: <FaCalculator />,
      color: '#9c27b0',
      path: '/24-points'
    },
    {
      id: 'doudizhu',
      title: 'Doudizhu',
      description: 'A popular Chinese card game for three players with one player against the other two.',
      icon: <FaRegCreditCard />,
      color: '#ff9800',
      path: '/doudizhu'
    },
    {
      id: 'minesweeper',
      title: 'Minesweeper',
      description: 'Uncover all safe cells and avoid the mines in this classic puzzle game.',
      icon: <FaBomb />,
      color: '#607d8b',
      path: '/minesweeper'
    },
    {
      id: 'hearts',
      title: 'Hearts',
      description: 'Microsoft classic card game. Avoid hearts and the Queen of Spades!',
      icon: <FaHeart />,
      color: '#e53935',
      path: '/hearts'
    },
    {
      id: 'pinball',
      title: '3D Pinball',
      description: 'Classic pinball game. Use flippers to keep the ball in play and score points!',
      icon: <FaCircle />, // Use a pinball-like icon
      color: '#1976d2',
      path: '/pinball'
    }
  ];

  return (
    <PageContainer>
      <HomeHeader>
        <Title>Mini Games Collection</Title>
        <Subtitle>Select a game to play</Subtitle>
      </HomeHeader>

      <Grid>
        {games.map(game => (
          <GameCard key={game.id} as={Link} to={game.path} $color={game.color}>
            <GameIconWrapper $color={game.color}>
              {game.icon}
            </GameIconWrapper>
            <GameTitle>{game.title}</GameTitle>
            <GameDescription>{game.description}</GameDescription>
            <PlayButton>Play Now</PlayButton>
          </GameCard>
        ))}
      </Grid>
    </PageContainer>
  );
};

// Styled components
const HomeHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.textLight};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1rem;
  }
`;

const GameCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 4px solid ${props => props.$color || props.theme.colors.primary};
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const GameIconWrapper = styled.div`
  font-size: 2.5rem;
  color: ${props => props.$color || props.theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const GameTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const GameDescription = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-grow: 1;
`;

const PlayButton = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  transition: background-color ${({ theme }) => theme.transitions.short};
  
  ${GameCard}:hover & {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

export default Home;