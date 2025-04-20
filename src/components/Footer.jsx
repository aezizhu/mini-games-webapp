import styled from 'styled-components';
import { FaGithub, FaHeart } from 'react-icons/fa';

// Footer component for the mini-games web application
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterText>
          © {currentYear} Mini Games Web App. All rights reserved.
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
  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => `rgba(0, 0, 0, 0.1)`};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-bottom: calc(${({ theme }) => theme.spacing.md} + 60px); // Extra padding for mobile navigation
  }
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
    text-align: center;
  }
`;

const FooterText = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FooterLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: color ${({ theme }) => theme.transitions.short};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const HeartIcon = styled(FaHeart)`
  color: ${({ theme }) => theme.colors.secondary};
`;

export default Footer;