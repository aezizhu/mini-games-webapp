import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaTimes, FaVolumeMute, FaVolumeUp, FaCog, FaQuestion } from 'react-icons/fa';
import { useAudio } from '../contexts/AudioContext';
import { useSettings } from '../contexts/SettingsContext';

// Header component for the mini-games web application
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { muted, toggleMute } = useAudio();
  const { openSettings } = useSettings();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoContainer>
          <Link to="/">
            <Logo>Mini Games</Logo>
          </Link>
        </LogoContainer>

        <MobileMenuButton onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </MobileMenuButton>

        <NavContainer className={mobileMenuOpen ? 'open' : ''}>
          <HeaderControls>
            <IconButton onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
              {muted ? <FaVolumeMute /> : <FaVolumeUp />}
            </IconButton>
            <IconButton onClick={openSettings} title="Settings">
              <FaCog />
            </IconButton>
            <Link to="/help">
              <IconButton title="Help">
                <FaQuestion />
              </IconButton>
            </Link>
          </HeaderControls>
        </NavContainer>
      </HeaderContent>
    </HeaderContainer>
  );
};

// Styled components
const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.25rem;
  }
`;

const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: ${({ theme }) => theme.colors.primary};
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height ${({ theme }) => theme.transitions.medium};
    
    &.open {
      max-height: 300px;
      padding: ${({ theme }) => theme.spacing.md};
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  }
`;

const HeaderControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    justify-content: space-around;
    padding: ${({ theme }) => theme.spacing.md} 0;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  color: white;
  font-size: 1.5rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

const IconButton = styled.button`
  color: white;
  font-size: 1.25rem;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color ${({ theme }) => theme.transitions.short};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export default Header;