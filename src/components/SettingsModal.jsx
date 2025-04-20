import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { useSettings } from '../contexts/SettingsContext';
import { useAudio } from '../contexts/AudioContext';
import { ModalOverlay, ModalContent, Button, Divider } from '../styles/Layout';

// Settings modal component
const SettingsModal = () => {
  const { settings, settingsOpen, closeSettings, updateSetting, updateGameSetting, resetSettings } = useSettings();
  const { volume, setVolume } = useAudio();
  
  // Local state for form values
  const [formValues, setFormValues] = useState(settings);
  
  // Update local state when settings change
  useEffect(() => {
    setFormValues(settings);
  }, [settings]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update all settings
    Object.entries(formValues).forEach(([key, value]) => {
      if (key !== 'gameSpecific') {
        updateSetting(key, value);
      }
    });
    
    // Update game-specific settings
    Object.entries(formValues.gameSpecific).forEach(([game, gameSettings]) => {
      Object.entries(gameSettings).forEach(([key, value]) => {
        updateGameSetting(game, key, value);
      });
    });
    
    closeSettings();
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle game-specific setting change
  const handleGameSettingChange = (game, setting, value) => {
    setFormValues(prev => ({
      ...prev,
      gameSpecific: {
        ...prev.gameSpecific,
        [game]: {
          ...prev.gameSpecific[game],
          [setting]: value
        }
      }
    }));
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };
  
  if (!settingsOpen) return null;
  
  return (
    <ModalOverlay onClick={closeSettings}>
      <ModalContent onClick={e => e.stopPropagation()} $width="600px">
        <ModalHeader>
          <ModalTitle>Settings</ModalTitle>
          <CloseButton onClick={closeSettings}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <SettingsSection>
            <SectionTitle>General Settings</SectionTitle>
            
            <SettingRow>
              <SettingLabel htmlFor="theme">Theme</SettingLabel>
              <SelectInput
                id="theme"
                name="theme"
                value={formValues.theme}
                onChange={handleChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </SelectInput>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel htmlFor="difficulty">Default Difficulty</SettingLabel>
              <SelectInput
                id="difficulty"
                name="difficulty"
                value={formValues.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </SelectInput>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel htmlFor="volume">Volume</SettingLabel>
              <RangeContainer>
                <RangeInput
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                />
                <RangeValue>{Math.round(volume * 100)}%</RangeValue>
              </RangeContainer>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel htmlFor="animations">Enable Animations</SettingLabel>
              <CheckboxContainer>
                <CheckboxInput
                  id="animations"
                  name="animations"
                  type="checkbox"
                  checked={formValues.animations}
                  onChange={handleChange}
                />
                <CheckboxLabel htmlFor="animations"></CheckboxLabel>
              </CheckboxContainer>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel htmlFor="highContrastMode">High Contrast Mode</SettingLabel>
              <CheckboxContainer>
                <CheckboxInput
                  id="highContrastMode"
                  name="highContrastMode"
                  type="checkbox"
                  checked={formValues.highContrastMode}
                  onChange={handleChange}
                />
                <CheckboxLabel htmlFor="highContrastMode"></CheckboxLabel>
              </CheckboxContainer>
            </SettingRow>
            
            <SettingRow>
              <SettingLabel htmlFor="saveProgress">Save Game Progress</SettingLabel>
              <CheckboxContainer>
                <CheckboxInput
                  id="saveProgress"
                  name="saveProgress"
                  type="checkbox"
                  checked={formValues.saveProgress}
                  onChange={handleChange}
                />
                <CheckboxLabel htmlFor="saveProgress"></CheckboxLabel>
              </CheckboxContainer>
            </SettingRow>
          </SettingsSection>
          
          <Divider />
          
          <SettingsSection>
            <SectionTitle>Keyboard Controls</SectionTitle>
            
            <ControlsGrid>
              <ControlItem>
                <ControlLabel>Up</ControlLabel>
                <ControlValue>{formValues.keyboardControls.up}</ControlValue>
              </ControlItem>
              <ControlItem>
                <ControlLabel>Down</ControlLabel>
                <ControlValue>{formValues.keyboardControls.down}</ControlValue>
              </ControlItem>
              <ControlItem>
                <ControlLabel>Left</ControlLabel>
                <ControlValue>{formValues.keyboardControls.left}</ControlValue>
              </ControlItem>
              <ControlItem>
                <ControlLabel>Right</ControlLabel>
                <ControlValue>{formValues.keyboardControls.right}</ControlValue>
              </ControlItem>
              <ControlItem>
                <ControlLabel>Action</ControlLabel>
                <ControlValue>{formValues.keyboardControls.action === ' ' ? 'Space' : formValues.keyboardControls.action}</ControlValue>
              </ControlItem>
              <ControlItem>
                <ControlLabel>Pause</ControlLabel>
                <ControlValue>{formValues.keyboardControls.pause}</ControlValue>
              </ControlItem>
            </ControlsGrid>
            
            <ButtonRow>
              <Button type="button" variant="secondary" size="small">
                Customize Controls
              </Button>
            </ButtonRow>
          </SettingsSection>
          
          <Divider />
          
          <ButtonRow>
            <Button type="button" onClick={resetSettings} variant="secondary">
              Reset to Defaults
            </Button>
            <Button type="submit">
              Save Settings
            </Button>
          </ButtonRow>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled components
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.textLight};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SettingsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  font-weight: 500;
`;

const SelectInput = styled.select`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid ${({ theme }) => `rgba(0, 0, 0, 0.1)`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  min-width: 150px;
`;

const RangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 150px;
`;

const RangeInput = styled.input`
  flex: 1;
  -webkit-appearance: none;
  height: 6px;
  background: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }
`;

const RangeValue = styled.span`
  min-width: 40px;
  text-align: right;
`;

const CheckboxContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
`;

const CheckboxInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + label {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:checked + label:before {
    transform: translateX(20px);
  }
`;

const CheckboxLabel = styled.label`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  transition: ${({ theme }) => theme.transitions.short};
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: ${({ theme }) => theme.transitions.short};
    border-radius: 50%;
  }
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ControlItem = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const ControlLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ControlValue = styled.div`
  font-weight: 500;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export default SettingsModal;