// Plugin Marketplace Module

import React, { useState } from 'react';

export function PluginMarketplace({ availablePlugins, onPurchase, onUpload }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlugins = availablePlugins.filter((plugin) =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePurchase = (plugin) => {
    onPurchase(plugin);
    alert(`${plugin.name} purchased successfully!`);
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
      alert(`${file.name} uploaded successfully!`);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <h2>Plugin Marketplace</h2>
      <input
        type="text"
        placeholder="Search for plugins..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '20px', padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredPlugins.map((plugin) => (
          <li
            key={plugin.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              backgroundColor: '#fff',
              marginBottom: '10px',
              borderRadius: '5px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div>
              <h4>{plugin.name}</h4>
              <p>{plugin.description}</p>
            </div>
            <button
              onClick={() => handlePurchase(plugin)}
              style={{
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                padding: '10px',
                cursor: 'pointer',
              }}
            >
              Purchase
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px' }}>
        <h3>Upload Your Plugin</h3>
        <input type="file" onChange={handleUpload} />
      </div>
    </div>
  );
}

/**
 * Features:
 * 1. **Searchable Plugin List:**
 *    - Users can search through available plugins by name.
 * 2. **Plugin Purchase:**
 *    - Allows users to buy plugins directly from the marketplace.
 * 3. **Plugin Upload:**
 *    - Enables users to upload their own plugins for sharing or selling.
 * 4. **Responsive Design:**
 *    - Styled for easy readability and interaction.
 */
