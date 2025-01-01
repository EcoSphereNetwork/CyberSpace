// Converted to TypeScript with JSX
import React from 'react';
// pvp_dashboard.js

// Example WebSocket connection for real-time PvP data
const socket = new WebSocket('wss://example.com/pvp');

socket.onopen = () => {
  console.log('WebSocket-Verbindung hergestellt.');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updatePvPData(data);
};

socket.onerror = (error) => {
  console.error('WebSocket-Fehler:', error);
};

socket.onclose = () => {
  console.log('WebSocket-Verbindung geschlossen.');
};

// Update PvP Dashboard with new data
export function updatePvPData(data) {
  console.log('Erhaltene PvP-Daten:', data);

  const playerList = document.getElementById('pvp-player-list');
  playerList.innerHTML = '';

  data.players.forEach((player) => {
    const li = document.createElement('li');
    li.textContent = `${player.name} - ${player.points} Punkte`;
    li.classList.add(player.status === 'active' ? 'active' : 'eliminated');
    playerList.appendChild(li);
  });

  document.getElementById('match-timer').textContent = `Verbleibende Zeit: ${data.remainingTime}`;
}

// Simulate actions (for testing)
setTimeout(() => {
  const testPvPData = {
    players: [
      { name: 'Spieler A', points: 1200, status: 'active' },
      { name: 'Spieler B', points: 900, status: 'eliminated' },
    ],
    remainingTime: '10:00',
  };
  updatePvPData(testPvPData);
}, 5000);
