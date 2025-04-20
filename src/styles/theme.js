// Theme configuration for the mini-games web application
const theme = {
  // Color palette
  colors: {
    // Primary colors
    primary: '#4361ee',
    primaryLight: '#738eef',
    primaryDark: '#2c41b5',
    
    // Secondary colors
    secondary: '#f72585',
    secondaryLight: '#f85fa0',
    secondaryDark: '#c91c6b',
    
    // UI colors
    background: '#f8f9fa',
    surface: '#ffffff',
    surfaceLight: '#f1f3f5',
    surfaceDark: '#e9ecef',
    
    // Text colors
    text: '#212529',
    textLight: '#6c757d',
    textInverted: '#ffffff',
    
    // Feedback colors
    success: '#40c057',
    warning: '#fab005',
    error: '#fa5252',
    info: '#228be6',
    
    // Game-specific colors
    game2048: {
      background: '#bbada0',
      tile: '#eee4da',
      text: '#776e65',
    },
    tetris: {
      background: '#000000',
      grid: '#1a1a1a',
      i: '#00f0f0',
      j: '#0000f0',
      l: '#f0a000',
      o: '#f0f000',
      s: '#00f000',
      t: '#a000f0',
      z: '#f00000',
    },
    snake: {
      background: '#a2d149',
      snake: '#4674e9',
      food: '#ff3838',
    },
    slotMachine: {
      background: '#2c3e50',
      reel: '#34495e',
      symbol1: '#e74c3c',
      symbol2: '#f1c40f',
      symbol3: '#2ecc71',
      symbol4: '#3498db',
    },
    points24: {
      card: '#ffffff',
      cardBorder: '#dcdcdc',
      operator: '#4361ee',
    },
    doudizhu: {
      table: '#076324',
      cardFront: '#ffffff',
      cardBack: '#b71540',
    },
  },
  
  // Spacing scale (in pixels)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  
  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    circle: '50%',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 15px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.05)',
  },
  
  // Z-index values
  zIndex: {
    base: 1,
    overlay: 10,
    modal: 100,
    tooltip: 500,
    header: 1000,
  },
  
  // Transitions
  transitions: {
    short: '0.15s ease',
    medium: '0.3s ease',
    long: '0.5s ease',
  },
  
  // Font sizes
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    xxl: '2rem',
    xxxl: '2.5rem',
  },
  
  // Font weights
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
};

export default theme;