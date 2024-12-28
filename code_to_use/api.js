const express = require('express');
const router = express.Router();
const Graph = require('../models/Graph');

// Dynamische Graph-Daten aus der Datenbank abrufen
router.get('/graph', async (req, res) => {
  try {
    const graphData = await Graph.findOne();
    res.json(graphData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch graph data' });
  }
});

module.exports = router;
