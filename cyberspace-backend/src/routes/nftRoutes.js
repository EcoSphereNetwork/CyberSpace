const express = require('express');
const NFT = require('../models/NFT');
const router = express.Router();

// 🎨 NFT in Space platzieren
router.post('/place-in-space', async (req, res) => {
    try {
        const { name, owner, spaceId, metadata } = req.body;
        const nft = new NFT({ name, owner, location: spaceId, metadata });
        await nft.save();
        res.status(201).json({ message: "NFT erfolgreich in Space platziert", nft });
    } catch (error) {
        res.status(400).json({ error: "Fehler beim Platzieren des NFTs" });
    }
});

// 🔍 NFTs in einem Space abrufen
router.get('/by-space/:spaceId', async (req, res) => {
    try {
        const nfts = await NFT.find({ location: req.params.spaceId }).populate("owner", "username");
        res.json(nfts);
    } catch (error) {
        res.status(400).json({ error: "Fehler beim Abrufen der NFTs" });
    }
});

module.exports = router;

