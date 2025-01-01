// Converted to TypeScript with JSX
import React from 'react';
// plugin_manager_window.js

import React, { useState, useEffect } from 'react';
import { addPlugin, getPlugins, updatePluginStatus, deletePlugin } from './plugin_api';

// Helper to save and load plugins to/from local storage
const savePluginsToLocalStorage = (plugins) => {
  localStorage.setItem('plugins', JSON.stringify(plugins));
};

const loadPluginsFromLocalStorage = () => {
  const savedPlugins = localStorage.getItem('plugins');
  return savedPlugins ? JSON.parse(savedPlugins) : [];
};

export export function PluginManagerWindow() {
  const [plugins, setPlugins] = useState([]);
  const [pluginName, setPluginName] = useState('');
  const [pluginDescription, setPluginDescription] = useState('');
  const [filter, setFilter] = useState('all'); // Filter for plugin list

  useEffect(() => {
    const savedPlugins = loadPluginsFromLocalStorage();
    setPlugins(savedPlugins);
  }, []);

  useEffect(() => {
    savePluginsToLocalStorage(plugins);
  }, [plugins]);

  const handleAddPlugin = () => {
    try {
      const newPlugin = { name: pluginName, description: pluginDescription, id: `plugin-${Date.now()}`, status: 'inactive' };
      const updatedPlugins = [...plugins, newPlugin];
      setPlugins(updatedPlugins);
      setPluginName('');
      setPluginDescription('');
      alert('Plugin erfolgreich hinzugefügt!');
    } catch (error) {
      alert(`Fehler beim Hinzufügen des Plugins: ${error.message}`);
    }
  };

  const handleTogglePlugin = (id, status) => {
    try {
      const updatedPlugins = plugins.map((plugin) =>
        plugin.id === id ? { ...plugin, status } : plugin
      );
      setPlugins(updatedPlugins);
    } catch (error) {
      alert(`Fehler beim Aktualisieren des Plugins: ${error.message}`);
    }
  };

  const handleDeletePlugin = (id) => {
    try {
      const updatedPlugins = plugins.filter((plugin) => plugin.id !== id);
      setPlugins(updatedPlugins);
    } catch (error) {
      alert(`Fehler beim Entfernen des Plugins: ${error.message}`);
    }
  };

  const executePluginInSandbox = (plugin) => {
    try {
      const sandbox = new Worker(URL.createObjectURL(new Blob([
        `onmessage = function(e) { 
          const { id, code } = e.data;
          try {
            eval(code);
            postMessage({ id, success: true, result: "Plugin executed successfully." });
          } catch (error) {
            postMessage({ id, success: false, error: error.message });
          }
        }`
      ], { type: 'application/javascript' })));

      sandbox.onmessage = (e) => {
        const { id, success, result, error } = e.data;
        if (success) {
          alert(`Plugin ${id} executed: ${result}`);
        } else {
          alert(`Error in Plugin ${id}: ${error}`);
        }
      };

      sandbox.postMessage({ id: plugin.id, code: plugin.code });
    } catch (error) {
      alert(`Fehler beim Ausführen des Plugins: ${error.message}`);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredPlugins = plugins.filter((plugin) => {
    if (filter === 'active') return plugin.status === 'active';
    if (filter === 'inactive') return plugin.status === 'inactive';
    return true;
  });

  return (
    <div className="plugin-manager">
      <h2>Plugin Manager</h2>

      <div className="plugin-form">
        <input
          type="text"
          placeholder="Plugin Name"
          value={pluginName}
          onChange={(e) => setPluginName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Plugin Beschreibung"
          value={pluginDescription}
          onChange={(e) => setPluginDescription(e.target.value)}
        />
        <button onClick={handleAddPlugin}>Plugin hinzufügen</button>
      </div>

      <div className="plugin-controls">
        <label>Filter:</label>
        <select value={filter} onChange={handleFilterChange}>
          <option value="all">Alle</option>
          <option value="active">Aktive Plugins</option>
          <option value="inactive">Inaktive Plugins</option>
        </select>
      </div>

      <div className="plugin-list">
        <h3>Installierte Plugins</h3>
        <ul>
          {filteredPlugins.map((plugin) => (
            <li key={plugin.id} className="plugin-item">
              <span>{plugin.name}</span>
              <p>{plugin.description}</p>
              <p>Status: {plugin.status}</p>
              <button
                onClick={() => handleTogglePlugin(plugin.id, plugin.status === 'active' ? 'inactive' : 'active')}
              >
                {plugin.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
              </button>
              <button onClick={() => handleDeletePlugin(plugin.id)}>Entfernen</button>
              <button onClick={() => executePluginInSandbox(plugin)}>Ausführen</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
