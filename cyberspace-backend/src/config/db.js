const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB verbunden...");
    } catch (error) {
        console.error("❌ Fehler bei der Datenbankverbindung:", error);
        process.exit(1);
    }
};

module.exports = connectDB;

