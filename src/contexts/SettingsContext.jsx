import { createContext, useContext, useState, useEffect } from 'react';

// Create context for settings management
const SettingsContext = createContext();

// Settings provider component
export const SettingsProvider = ({ children }) => {
  // State for settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // State for game settings
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('minigames_settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      // Default settings
      theme: 'light',
      difficulty: 'medium',
      animations: true,
      highContrastMode: false,
      saveProgress: true,
      autoSaveInterval: 60, // seconds
      keyboardControls: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        action: ' ', // Space
        pause: 'p'
      },
      gameSpecific: {
        '2048': {
          gridSize: 4,
          winTarget: 2048,
          enableUndo: true
        },
        'tetris': {
          ghostPiece: true,
          showNext: true,
          showHold: true,
          rotationSystem: 'srs' // Super Rotation System
        },
        'snake': {
          speed: 5,
          walls: 'wrap', // 'wrap', 'solid'
          growthRate: 1
        },
        'slotMachine': {
          reels: 3,
          spinTime: 2, // seconds
          autoSpin: false
        },
        '24points': {
          timeLimit: 60, // seconds
          difficulty: 'medium'
        },
        'doudizhu': {
          aiDifficulty: 'medium',
          showHints: true
        }
      }
    };
  });
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('minigames_settings', JSON.stringify(settings));
  }, [settings]);
  
  // Open settings modal
  const openSettings = () => {
    setSettingsOpen(true);
  };
  
  // Close settings modal
  const closeSettings = () => {
    setSettingsOpen(false);
  };
  
  // Update a specific setting
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Update a game-specific setting
  const updateGameSetting = (game, key, value) => {
    setSettings(prev => ({
      ...prev,
      gameSpecific: {
        ...prev.gameSpecific,
        [game]: {
          ...prev.gameSpecific[game],
          [key]: value
        }
      }
    }));
  };
  
  // Reset all settings to default
  const resetSettings = () => {
    localStorage.removeItem('minigames_settings');
    setSettings({
      theme: 'light',
      difficulty: 'medium',
      animations: true,
      highContrastMode: false,
      saveProgress: true,
      autoSaveInterval: 60,
      keyboardControls: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        action: ' ',
        pause: 'p'
      },
      gameSpecific: {
        '2048': {
          gridSize: 4,
          winTarget: 2048,
          enableUndo: true
        },
        'tetris': {
          ghostPiece: true,
          showNext: true,
          showHold: true,
          rotationSystem: 'srs'
        },
        'snake': {
          speed: 5,
          walls: 'wrap',
          growthRate: 1
        },
        'slotMachine': {
          reels: 3,
          spinTime: 2,
          autoSpin: false
        },
        '24points': {
          timeLimit: 60,
          difficulty: 'medium'
        },
        'doudizhu': {
          aiDifficulty: 'medium',
          showHints: true
        }
      }
    });
  };
  
  // Context value
  const value = {
    settings,
    settingsOpen,
    openSettings,
    closeSettings,
    updateSetting,
    updateGameSetting,
    resetSettings
  };
  
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for using the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;