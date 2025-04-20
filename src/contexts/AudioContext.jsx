import { createContext, useContext, useState, useEffect } from 'react';

// Create context for audio management
const AudioContext = createContext();

// Audio provider component that manages audio state and sounds
export const AudioProvider = ({ children }) => {
  // State for audio settings
  const [muted, setMuted] = useState(() => {
    // Load muted state from localStorage if available
    const savedMuted = localStorage.getItem('minigames_muted');
    return savedMuted ? JSON.parse(savedMuted) : false;
  });
  
  const [volume, setVolume] = useState(() => {
    // Load volume from localStorage if available
    const savedVolume = localStorage.getItem('minigames_volume');
    return savedVolume ? JSON.parse(savedVolume) : 0.5;
  });
  
  // Audio elements for different sounds
  const [sounds, setSounds] = useState({});
  const [music, setMusic] = useState(null);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('minigames_muted', JSON.stringify(muted));
  }, [muted]);
  
  useEffect(() => {
    localStorage.setItem('minigames_volume', JSON.stringify(volume));
    
    // Update volume for all audio elements
    Object.values(sounds).forEach(sound => {
      if (sound) {
        sound.volume = volume;
      }
    });
    
    if (music) {
      music.volume = volume * 0.5; // Background music slightly quieter
    }
  }, [volume, sounds, music]);
  
  // Toggle mute state
  const toggleMute = () => {
    setMuted(prev => !prev);
  };
  
  // Set volume (0-1)
  const setAudioVolume = (newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };
  
  // Load a sound effect
  const loadSound = (name, src) => {
    const audio = new Audio(src);
    audio.volume = volume;
    
    setSounds(prev => ({
      ...prev,
      [name]: audio
    }));
    
    return audio;
  };
  
  // Play a sound effect
  const playSound = (name) => {
    if (muted) return;
    
    const sound = sounds[name];
    if (sound) {
      // Reset the audio to start
      sound.currentTime = 0;
      sound.play().catch(error => {
        // Handle autoplay restrictions
        console.warn(`Error playing sound ${name}:`, error);
      });
    } else {
      console.warn(`Sound ${name} not loaded`);
    }
  };
  
  // Load and play background music
  const playMusic = (src, loop = true) => {
    if (music) {
      music.pause();
    }
    
    const audio = new Audio(src);
    audio.volume = volume * 0.5; // Background music slightly quieter
    audio.loop = loop;
    
    if (!muted) {
      audio.play().catch(error => {
        // Handle autoplay restrictions
        console.warn('Error playing music:', error);
      });
    }
    
    setMusic(audio);
    return audio;
  };
  
  // Stop background music
  const stopMusic = () => {
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
  };
  
  // Pause/resume background music
  const toggleMusic = () => {
    if (!music) return;
    
    if (music.paused && !muted) {
      music.play().catch(error => {
        console.warn('Error resuming music:', error);
      });
    } else {
      music.pause();
    }
  };
  
  // Effect to handle muting/unmuting
  useEffect(() => {
    // Update all sounds when mute state changes
    Object.values(sounds).forEach(sound => {
      if (sound) {
        sound.muted = muted;
      }
    });
    
    // Update background music
    if (music) {
      music.muted = muted;
      
      // If unmuting and music is paused, play it
      if (!muted && music.paused) {
        music.play().catch(error => {
          console.warn('Error resuming music after unmute:', error);
        });
      }
    }
  }, [muted, sounds, music]);
  
  // Clean up audio elements when component unmounts
  useEffect(() => {
    return () => {
      Object.values(sounds).forEach(sound => {
        if (sound) {
          sound.pause();
          sound.src = '';
        }
      });
      
      if (music) {
        music.pause();
        music.src = '';
      }
    };
  }, []);
  
  // Context value
  const value = {
    muted,
    volume,
    toggleMute,
    setVolume: setAudioVolume,
    loadSound,
    playSound,
    playMusic,
    stopMusic,
    toggleMusic
  };
  
  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// Custom hook for using the audio context
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default AudioContext;