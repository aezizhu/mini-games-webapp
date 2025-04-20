import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaHome, 
  FaPuzzlePiece, 
  FaGamepad, 
  FaDragon, 
  FaDice, 
  FaCalculator, 
  FaRegCreditCard 
} from 'react-icons/fa';

// Sidebar component with navigation links to different games
const Sidebar = () => {
  // Navigation items with icons
  const navItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/2048', label: '2048', icon: <FaPuzzlePiece /> },
    { path: '/tetris', label: 'Tetris', icon: <FaGamepad /> },
    { path: '/snake', label: 'Snake', icon: <FaDragon /> },
    { path: '/slot-machine', label: 'Slot Machine', icon: <FaDice /> },
    { path: '/24-points', label: '24 Points', icon: <FaCalculator /> },
    { path: '/doudizhu', label: 'Doudizhu', icon: <FaRegCreditCard /> },
  ];

  return (
    <SidebarContainer>
      <NavList>
        {navItems.map((item) => (
          <NavItem key={item.path}>
            <NavLinkStyled to={item.path} end={item.path === '/'}>
              <NavIcon>{item.icon}</NavIcon>
              <NavLabel>{item.label}</NavLabel>
            </NavLinkStyled>
          </NavItem>
        ))}
      </NavList>
    </SidebarContainer>
  );
};

// Styled components
const SidebarContainer = styled.aside`
  background-color: ${({ theme }) => theme.colors.surface};
  width: 220px;
  border-right: 1px solid ${({ theme }) => `rgba(0, 0, 0, 0.1)`};
  padding: ${({ theme }) => theme.spacing.md} 0;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 60px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: ${({ theme }) => theme.zIndex.header - 1};
    border-right: none;
    border-top: 1px solid ${({ theme }) => `rgba(0, 0, 0, 0.1)`};
    padding: 0;
  }
`;

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
    justify-content: space-around;
  }
`;

const NavItem = styled.li`
  width: 100%;
`;

const NavLinkStyled = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  transition: background-color ${({ theme }) => theme.transitions.short};
  border-left: 3px solid transparent;
  
  &:hover {
    background-color: ${({ theme }) => `rgba(0, 0, 0, 0.05)`};
  }
  
  &.active {
    background-color: ${({ theme }) => `rgba(67, 97, 238, 0.1)`};
    color: ${({ theme }) => theme.colors.primary};
    border-left-color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    justify-content: center;
    padding: ${({ theme }) => theme.spacing.sm};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
    border-left: none;
    border-top: 3px solid transparent;
    
    &.active {
      border-left-color: transparent;
      border-top-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const NavIcon = styled.span`
  font-size: 1.25rem;
  margin-right: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-right: 0;
  }
`;

const NavLabel = styled.span`
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: block;
    font-size: 0.75rem;
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

export default Sidebar;