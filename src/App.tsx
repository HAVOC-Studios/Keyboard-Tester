import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { IoSettingsOutline } from "react-icons/io5";
import Header from "./Header";
import './App.css';

const KEYBOARD_LAYOUT = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Meta', 'Alt', 'Space', 'Alt', 'Meta', 'Menu', 'Ctrl']
];

function invertColor(hex) {
  // Remove the hash symbol if present
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Invert the colors
  const invertedR = (255 - r).toString(16).padStart(2, '0');
  const invertedG = (255 - g).toString(16).padStart(2, '0');
  const invertedB = (255 - b).toString(16).padStart(2, '0');

  // Return the inverted color as a hex code
  return `#${invertedR}${invertedG}${invertedB}`;
}

const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();
const invertedColor = invertColor(backgroundColor);
document.documentElement.style.setProperty('--inverted-color', invertedColor);


function normalizeKey(key: string): string {
  switch (key) {
    case ' ':
      return 'Space';
    case 'Control':
      return 'Ctrl';
    case 'Meta':
    case 'OS':
      return 'Meta';
    case 'ContextMenu':
      return 'Menu';
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      return key.replace('Arrow', '');
    default:
      return key.length === 1 ? key.toUpperCase() : key;
  }
}

function SettingsPage({
  onClose,
  soundEnabled,
  onToggleSound,
  volume,
  onVolumeChange,
  theme,
  onThemeChange,
}: {
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}) {
  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="setting-item">
        <label>Enable Sound</label>
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={onToggleSound}
        />
      </div>
      <div className="setting-item">
        <label>Volume</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          disabled={!soundEnabled}
        />
      </div>
      <div className="setting-item">
        <label>Theme</label>
        <select value={theme} onChange={(e) => onThemeChange(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>
  );
}

function App() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);

  // Load settings from localStorage or use default values
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return JSON.parse(localStorage.getItem('soundEnabled') || 'true');
  });
  const [volume, setVolume] = useState<number>(() => {
    return parseFloat(localStorage.getItem('volume') || '0.5');
  });
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme); // Optional: Apply theme to the body
  }, [theme]);

  useEffect(() => {
    const clickSound = new Audio('/click.mp3');
    clickSound.volume = volume;

    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = normalizeKey(event.key);
      setPressedKeys((prevKeys) => new Set(prevKeys).add(normalizedKey));

      if (soundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play().catch((error) => {
          console.log('Error playing sound:', error);
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const normalizedKey = normalizeKey(event.key);
      setPressedKeys((prevKeys) => {
        const updatedKeys = new Set(prevKeys);
        updatedKeys.delete(normalizedKey);
        return updatedKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [soundEnabled, volume]);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <div className={`container ${theme}`}>
      <Header />
      <div id='settings_button' className='settings' onClick={toggleSettings}>
        <IoSettingsOutline />
      </div>
      {showSettings ? (
        <SettingsPage
          onClose={toggleSettings}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
      ) : (
        <>
          <h1>Simply press any key on your keyboard to start testing - it will turn green if that key works</h1>
          <div className="keyboard">
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
              <div key={rowIndex} className="keyboard-row">
                {row.map((key) => (
                  <div
                    key={key}
                    className={`key ${pressedKeys.has(key) ? 'pressed' : ''} ${key.length > 1 ? 'key-wide' : ''} 
                ${key === "Backspace" ? "key-backspace" : ""}
                ${key === "CapsLock" ? "key-capslock" : ""}
                `}
                  >
                    {key}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
