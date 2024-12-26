// backend/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Beispiel-Route: GET /api/hello
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Später: Routen zum Auslesen von Dateistrukturen, Netzwerk-Infos, usw.

// Starte Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
