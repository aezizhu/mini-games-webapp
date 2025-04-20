import styled from 'styled-components';

// Main layout container for the application
export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

// Main content area
export const MainContent = styled.main`
  display: flex;
  flex: 1;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

// Content area (excludes sidebar)
export const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.sm};
    padding-bottom: 80px; // Space for mobile navigation
  }
`;

// Page container with max width
export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

// Responsive grid layout
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

// Flex container with customizable properties
export const Flex = styled.div`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
  gap: ${props => props.gap || '0'};
`;

// Card component
export const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: transform ${({ theme }) => theme.transitions.medium}, 
              box-shadow ${({ theme }) => theme.transitions.medium};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

// Button component
export const Button = styled.button`
  background-color: ${props => props.variant === 'secondary' 
    ? props.theme.colors.secondary 
    : props.theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverted};
  padding: ${props => props.size === 'small' 
    ? `${props.theme.spacing.xs} ${props.theme.spacing.sm}` 
    : props.size === 'large' 
      ? `${props.theme.spacing.md} ${props.theme.spacing.lg}` 
      : `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: background-color ${({ theme }) => theme.transitions.short};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    background-color: ${props => props.variant === 'secondary' 
      ? props.theme.colors.secondaryDark 
      : props.theme.colors.primaryDark};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Game container for consistent game layouts
export const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

// Game board container
export const GameBoard = styled.div`
  background-color: ${({ theme, $bgColor }) => $bgColor || theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  width: 100%;
  max-width: ${props => props.$maxWidth || '600px'};
  aspect-ratio: ${props => props.$aspectRatio || '1 / 1'};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    aspect-ratio: ${props => props.$mobileAspectRatio || props.$aspectRatio || '1 / 1'};
  }
`;

// Game controls container
export const GameControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: ${props => props.$maxWidth || '600px'};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

// Score display
export const ScoreDisplay = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  text-align: center;
  min-width: 120px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-width: 100px;
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

// Score label
export const ScoreLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

// Score value
export const ScoreValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme, $color }) => $color || theme.colors.primary};
`;

// Modal overlay
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: ${({ theme }) => theme.spacing.md};
`;

// Modal content
export const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 90%;
  width: ${props => props.$width || '500px'};
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg};
    width: 90%;
  }
`;

// Section divider
export const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${({ theme }) => `rgba(0, 0, 0, 0.1)`};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

// Heading components
export const Heading1 = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xxxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme, $color }) => $color || theme.colors.text};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

export const Heading2 = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme, $color }) => $color || theme.colors.text};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

export const Heading3 = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme, $color }) => $color || theme.colors.text};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

// Text paragraph
export const Text = styled.p`
  font-size: ${props => props.$size || props.theme.fontSizes.md};
  color: ${props => props.$color || props.theme.colors.text};
  margin-bottom: ${props => props.$marginBottom || props.theme.spacing.md};
  line-height: 1.6;
`;

export default {
  AppContainer,
  MainContent,
  Content,
  PageContainer,
  Grid,
  Flex,
  Card,
  Button,
  GameContainer,
  GameBoard,
  GameControls,
  ScoreDisplay,
  ScoreLabel,
  ScoreValue,
  ModalOverlay,
  ModalContent,
  Divider,
  Heading1,
  Heading2,
  Heading3,
  Text
};