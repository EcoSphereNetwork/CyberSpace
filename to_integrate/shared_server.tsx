// Converted to TypeScript with JSX
import React from 'react';
// backend/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/files', (req, res) => {
  const fs = require('fs');
  const dirPath = req.query.path || '.';  // Pfad aus Query, Standardwert = aktuelles Verzeichnis

  fs.readdir(dirPath, { withFileTypes: true }, (err, dirents) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const items = dirents.map(d => ({
      name: d.name,
      isDirectory: d.isDirectory()
    }));
    
    res.json({ path: dirPath, items });
  });
});
