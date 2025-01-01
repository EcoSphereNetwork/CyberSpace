// Converted to TypeScript with JSX
import React from 'react';
// plugin_api.js

const plugins = new Map(); // In-memory storage for plugins

/**
 * Adds a new plugin to the system.
 * @param {Object} plugin - Plugin details (name, description, status).
 */
export export function addPlugin(plugin) {
  if (!plugin.name || !plugin.description) {
    throw new Error('Plugin name and description are required.');
  }
  const id = `plugin-${Date.now()}`;
  plugins.set(id, { ...plugin, id, status: plugin.status || 'inactive' });
  console.log(`Plugin added: ${plugin.name}`);
  return id;
}

/**
 * Retrieves the list of all plugins.
 * @returns {Array} - Array of plugin objects.
 */
export export function getPlugins() {
  return Array.from(plugins.values());
}

/**
 * Updates the status of a plugin (activate/deactivate).
 * @param {string} id - Plugin ID.
 * @param {string} status - New status (active/inactive).
 */
export export function updatePluginStatus(id, status) {
  const plugin = plugins.get(id);
  if (!plugin) {
    throw new Error(`Plugin with ID ${id} not found.`);
  }
  if (!['active', 'inactive'].includes(status)) {
    throw new Error('Invalid status. Must be "active" or "inactive".');
  }
  plugin.status = status;
  console.log(`Plugin ${plugin.name} status updated to ${status}`);
}

/**
 * Deletes a plugin from the system.
 * @param {string} id - Plugin ID.
 */
export export function deletePlugin(id) {
  if (!plugins.has(id)) {
    throw new Error(`Plugin with ID ${id} not found.`);
  }
  const plugin = plugins.get(id);
  plugins.delete(id);
  console.log(`Plugin removed: ${plugin.name}`);
}

/**
 * Example Usage
 */
try {
  const id1 = addPlugin({ name: 'Heatmap Visualizer', description: 'Generates heatmaps for data visualization.' });
  const id2 = addPlugin({ name: 'Graph Enhancer', description: 'Improves graph interactions and rendering.' });

  console.log('Plugins:', getPlugins());

  updatePluginStatus(id1, 'active');
  deletePlugin(id2);

  console.log('Final Plugins:', getPlugins());
} catch (error) {
  console.error(error.message);
}



// plugin_api.js

/**
 * PluginAPI: A flexible API for managing plugins within the CyberSpace platform.
 * Allows developers to create, register, activate, and manage plugins dynamically.
 */

const plugins = {}; // Registry to store all registered plugins

/**
 * Registers a new plugin.
 * @param {string} pluginId - Unique identifier for the plugin.
 * @param {Object} plugin - Plugin object containing metadata and functionality.
 */
export export function registerPlugin(pluginId, plugin) {
  if (plugins[pluginId]) {
    console.warn(`Plugin with ID ${pluginId} is already registered.`);
    return;
  }
  plugins[pluginId] = { ...plugin, active: false };
  console.log(`Plugin ${pluginId} registered successfully.`);
}

/**
 * Activates a registered plugin.
 * @param {string} pluginId - Unique identifier of the plugin to activate.
 */
export export function activatePlugin(pluginId) {
  const plugin = plugins[pluginId];
  if (!plugin) {
    console.error(`Plugin ${pluginId} not found.`);
    return;
  }
  if (plugin.active) {
    console.warn(`Plugin ${pluginId} is already active.`);
    return;
  }
  if (typeof plugin.activate === 'function') {
    plugin.activate();
  }
  plugin.active = true;
  console.log(`Plugin ${pluginId} activated.`);
}

/**
 * Deactivates an active plugin.
 * @param {string} pluginId - Unique identifier of the plugin to deactivate.
 */
export export function deactivatePlugin(pluginId) {
  const plugin = plugins[pluginId];
  if (!plugin) {
    console.error(`Plugin ${pluginId} not found.`);
    return;
  }
  if (!plugin.active) {
    console.warn(`Plugin ${pluginId} is not active.`);
    return;
  }
  if (typeof plugin.deactivate === 'function') {
    plugin.deactivate();
  }
  plugin.active = false;
  console.log(`Plugin ${pluginId} deactivated.`);
}

/**
 * Lists all registered plugins.
 * @returns {Array} - Array of registered plugin metadata.
 */
export export function listPlugins() {
  return Object.keys(plugins).map((pluginId) => ({
    id: pluginId,
    ...plugins[pluginId],
  }));
}

/**
 * Example Usage:
 */
if (import.meta.env.MODE === 'development') {
  // Example Plugin Registration
  registerPlugin('examplePlugin', {
    name: 'Example Plugin',
    version: '1.0.0',
    description: 'A sample plugin for demonstration purposes.',
    activate: () => console.log('Example Plugin Activated!'),
    deactivate: () => console.log('Example Plugin Deactivated!'),
  });

  // Activate the example plugin
  activatePlugin('examplePlugin');

  // Deactivate the example plugin
  deactivatePlugin('examplePlugin');

  // List all plugins
  console.log(listPlugins());
}
