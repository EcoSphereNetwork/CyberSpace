const express = require('express');
const Space = require('../models/Space');
const router = express.Router();

// 🏠 Neuen Space erstellen
router.post('/create', async (req, res) => {
    try {
        const { name, owner, description, isPublic } = req.body;
        const space = new Space({ name, owner, description, isPublic });
        await space.save();
        res.status(201).json({ message: "Space erfolgreich erstellt", space });
    } catch (error) {
        res.status(400).json({ error: "Fehler beim Erstellen des Spaces" });
    }
});

// 🔍 Alle Spaces abrufen
router.get('/', async (req, res) => {
    const spaces = await Space.find().populate("owner", "username");
    res.json(spaces);
});

// 🏠 Space betreten
router.post('/join', async (req, res) => {
    try {
        const { userId, spaceId } = req.body;
        const space = await Space.findById(spaceId);
        if (!space) return res.status(404).json({ error: "Space nicht gefunden" });

        space.participants.push(userId);
        await space.save();
        res.json({ message: "Space erfolgreich betreten", space });
    } catch (error) {
        res.status(400).json({ error: "Fehler beim Beitreten des Spaces" });
    }
});

module.exports = router;

