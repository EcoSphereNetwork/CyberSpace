// Converted to TypeScript with JSX
import React from 'react';
// nmap_integration.js

/**
 * Nmap Integration: Queries Nmap for network scanning and visualization.
 * This module provides functions to execute Nmap scans and process the results.
 */

import { exec } from 'child_process';

/**
 * Executes an Nmap scan.
 * @param {string} target - The target IP or domain to scan.
 * @param {string} options - Additional Nmap options.
 * @returns {Promise<string>} - The raw Nmap scan result.
 */
export export function executeNmapScan(target, options = '-sV') {
  return new Promise((resolve, reject) => {
    const command = `nmap ${options} ${target}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Nmap scan: ${error.message}`);
        reject(error);
      } else if (stderr) {
        console.warn(`Nmap scan warning: ${stderr}`);
        resolve(stdout);
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Parses the raw Nmap scan result.
 * @param {string} scanResult - The raw Nmap scan output.
 * @returns {Array} - Parsed data as an array of objects.
 */
export export function parseNmapResult(scanResult) {
  const lines = scanResult.split('\n');
  const parsedData = [];

  lines.forEach((line) => {
    const portMatch = line.match(/^(\d+)\/tcp\s+(\w+)\s+(.*)$/);
    if (portMatch) {
      parsedData.push({
        port: portMatch[1],
        state: portMatch[2],
        service: portMatch[3],
      });
    }
  });

  return parsedData;
}

/**
 * Visualizes the Nmap scan data in the UI.
 * @param {Array} data - Parsed Nmap scan data.
 */
export export function visualizeNmapData(data) {
  const container = document.getElementById('nmap-visualization');
  container.innerHTML = ''; // Clear previous results

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  const headerRow = document.createElement('tr');
  ['Port', 'State', 'Service'].forEach((header) => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.border = '1px solid #ccc';
    th.style.padding = '8px';
    th.style.backgroundColor = '#f4f4f4';
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  data.forEach((entry) => {
    const row = document.createElement('tr');

    [entry.port, entry.state, entry.service].forEach((value) => {
      const td = document.createElement('td');
      td.textContent = value;
      td.style.border = '1px solid #ccc';
      td.style.padding = '8px';
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  container.appendChild(table);
}

/** Example Usage */
(async export function exampleNmapIntegration() {
  const target = 'scanme.nmap.org';
  try {
    const rawResult = await executeNmapScan(target);
    const parsedData = parseNmapResult(rawResult);

    // Ensure visualization container exists
    const container = document.createElement('div');
    container.id = 'nmap-visualization';
    container.style.margin = '20px';
    container.style.border = '1px solid #ddd';
    container.style.padding = '10px';
    container.style.borderRadius = '5px';
    document.body.appendChild(container);

    visualizeNmapData(parsedData);
  } catch (error) {
    console.error('Failed to execute Nmap scan:', error);
  }
})();
