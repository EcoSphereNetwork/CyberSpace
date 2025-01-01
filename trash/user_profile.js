import React, { useState } from 'react';

export function UserProfile({ initialSettings, onSave }) {
  const [settings, setSettings] = useState(initialSettings);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({ ...prevSettings, [name]: value }));
  };

  const handleSave = () => {
    onSave(settings);
    alert('Settings saved successfully!');
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      width: '300px',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
      padding: '15px',
      zIndex: 1000,
    }}>
      <h3>User Profile Settings</h3>

      <div style={{ marginBottom: '10px' }}>
        <label>UI Layout: </label>
        <select
          name="layout"
          value={settings.layout}
          onChange={handleInputChange}
          style={{ marginLeft: '10px' }}
        >
          <option value="grid">Grid</option>
          <option value="list">List</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Theme Color: </label>
        <input
          type="color"
          name="themeColor"
          value={settings.themeColor}
          onChange={handleInputChange}
          style={{ marginLeft: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Font Size: </label>
        <input
          type="number"
          name="fontSize"
          value={settings.fontSize}
          onChange={handleInputChange}
          style={{ marginLeft: '10px', width: '60px' }}
        /> px
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Border Radius: </label>
        <input
          type="range"
          name="borderRadius"
          min="0"
          max="50"
          value={settings.borderRadius}
          onChange={handleInputChange}
          style={{ marginLeft: '10px' }}
        /> {settings.borderRadius}px
      </div>

      <div style={{ textAlign: 'right' }}>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            padding: '10px 15px',
            cursor: 'pointer',
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

/**
 * Features:
 * 1. **UI Layout Selection:**
 *    - Allows users to choose between predefined layouts (grid, list, custom).
 * 2. **Theme Color Picker:**
 *    - Enables users to select a custom theme color using a color picker.
 * 3. **Font Size Adjustment:**
 *    - Allows customization of the font size for the UI.
 * 4. **Border Radius Customization:**
 *    - Users can adjust the border radius for UI elements.
 * 5. **Save Functionality:**
 *    - Saves user settings and provides feedback on successful updates.
 */
