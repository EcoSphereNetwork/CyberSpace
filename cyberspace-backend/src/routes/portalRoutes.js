const express = require('express');
const Portal = require('../models/Portal');
const router = express.Router();

// 🎮 Neues Portal erstellen
router.post('/create', async (req, res) => {
    try {
        const { name, targetGame, targetURL } = req.body;
        const portal = new Portal({ name, targetGame, targetURL });
        await portal.save();
        res.status(201).json({ message: "Portal erfolgreich erstellt", portal });
    } catch (error) {
        res.status(400).json({ error: "Fehler beim Erstellen des Portals" });
    }
});

// 🔍 Alle Portale abrufen
router.get('/', async (req, res) => {
    const portals = await Portal.find();
    res.json(portals);
});

// 🏠 Portal betreten
router.post('/enter', async (req, res) => {
    try {
        const { portalId } = req.body;
        const portal = await Portal.findById(portalId);
        if (!portal) return res.status(404).json({ error: "Portal nicht gefunden" });

        res.json({ message: "Betritt NovaProtocol", url: portal.targetURL });
    } catch (error) {
        res.status(400).json({ error: "Fehler beim Betreten des Portals" });
    }
});

module.exports = router;

