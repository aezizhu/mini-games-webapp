import styled from 'styled-components';
import { FaGithub, FaHeart } from 'react-icons/fa';

// Footer component for the mini-games web application
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterText>
          {currentYear} Mini Games Web App. All rights reserved.
        </FooterText>
        <FooterLinks>
          <FooterLink href="https://github.com/yourusername/mini-games-webapp" target="_blank" rel="noopener noreferrer">
            <FaGithub /> Source Code
          </FooterLink>
          <FooterText>
            Made with <HeartIcon /> by AI
          </FooterText>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
};

// Styled components
const FooterContainer = styled.footer`
  background-color: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => `rgba(0, 0, 0, 0.1)`};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding-bottom: calc(${props => props.theme.spacing.md} + 60px); // Extra padding for mobile navigation
  }
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    text-align: center;
  }
`;

const FooterText = styled.p`
  color: ${props => props.theme.textLight || '#333'};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const FooterLinks = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
  }
`;

const FooterLink = styled.a`
  color: ${props => props.theme.textLight || '#333'};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  transition: color ${props => props.theme.transitions.short};
  
  &:hover {
    color: ${props => props.theme.primary};
  }
`;

const HeartIcon = styled(FaHeart)`
  color: ${props => props.theme.secondary};
`;

export default Footer;