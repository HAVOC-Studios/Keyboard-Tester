import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { IoSettingsOutline } from "react-icons/io5";
import Header from "./Header"
import './App.css';

const KEYBOARD_LAYOUT = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Meta', 'Alt', 'Space', 'Alt', 'Meta', 'Menu', 'Ctrl']
];

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

function SettingsPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <button onClick={onClose}>Close</button>
      {/* Additional settings components can be added here */}
    </div>
  );
}

function App() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = normalizeKey(event.key);
      setPressedKeys((prevKeys) => new Set(prevKeys).add(normalizedKey));
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
  }, []);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className='container'>
      <Header />
      <div id='settings_button' className='settings' onClick={toggleSettings}>
        <IoSettingsOutline />
      </div>
      {showSettings ? (
        <SettingsPage onClose={toggleSettings} />
      ) : (
        <>
          <h1 className='smaller-text'>Simply press any key on your keyboard to start testing - it will turn green if that key works</h1>
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
