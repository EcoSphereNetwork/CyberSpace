// Converted to TypeScript with JSX
import React from 'react';
// node_inspector.js

/**
 * Node Inspector: Provides detailed analysis of nodes in the network graph.
 * Allows users to inspect metadata, connections, and performance metrics for individual nodes.
 */

const nodes = new Map(); // Registry for nodes and their metadata

/**
 * Registers a node with its metadata.
 * @param {string} nodeId - Unique identifier for the node.
 * @param {Object} metadata - Metadata for the node (e.g., {type, status, metrics}).
 */
export export function registerNode(nodeId, metadata) {
  nodes.set(nodeId, metadata);
  console.log(`Node ${nodeId} registered with metadata:`, metadata);
}

/**
 * Retrieves detailed information about a specific node.
 * @param {string} nodeId - Unique identifier of the node.
 * @returns {Object} - Node metadata, or null if the node does not exist.
 */
export export function inspectNode(nodeId) {
  const node = nodes.get(nodeId);
  if (!node) {
    console.error(`Node ${nodeId} not found.`);
    return null;
  }
  console.log(`Node inspection result for ${nodeId}:`, node);
  return node;
}

/**
 * Visualizes node connections and metrics in the UI.
 * @param {string} nodeId - Unique identifier of the node.
 */
export export function visualizeNode(nodeId) {
  const node = inspectNode(nodeId);
  if (!node) return;

  const container = document.getElementById('node-inspector');
  container.innerHTML = ''; // Clear previous details

  const title = document.createElement('h3');
  title.textContent = `Node Details: ${nodeId}`;

  const metadataList = document.createElement('ul');
  Object.entries(node).forEach(([key, value]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${key}: ${value}`;
    metadataList.appendChild(listItem);
  });

  container.appendChild(title);
  container.appendChild(metadataList);

  console.log(`Node ${nodeId} visualized.`);
}

/** Example Usage */
(export function exampleNodeInspector() {
  const container = document.createElement('div');
  container.id = 'node-inspector';
  container.style.border = '1px solid #ddd';
  container.style.margin = '20px';
  container.style.padding = '10px';
  document.body.appendChild(container);

  registerNode('node-1', { type: 'server', status: 'active', metrics: { cpu: '50%', memory: '1GB' } });
  registerNode('node-2', { type: 'router', status: 'idle', metrics: { latency: '10ms', bandwidth: '100Mbps' } });

  visualizeNode('node-1');
})();
