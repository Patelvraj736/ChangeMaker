const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
    const userMessage = req.body.message.toLowerCase();

    try {
        const greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"];
        if (greetings.some(greet => userMessage.includes(greet))) {
            return res.json({ reply: "Hello! 👋 How can I assist you today? You can ask me about NGOs in your city or based on a cause." });
        }

        const [stateResult, cityResult] = await Promise.all([
            pool.query("SELECT DISTINCT LOWER(state) AS state FROM ngos"),
            pool.query("SELECT DISTINCT LOWER(city) AS city FROM ngos")
        ]);

        const states = stateResult.rows.map(row => row.state);
        const cities = cityResult.rows.map(row => row.city);

        const matchedState = states.find(state => userMessage.includes(state));
        const matchedCity = cities.find(city => userMessage.includes(city));

        const keywords = userMessage.split(/\W+/).filter(Boolean);

        const ngoResult = await pool.query("SELECT * FROM ngos");
        const allNGOs = ngoResult.rows;

        const filteredNGOs = allNGOs.filter(ngo => {
            const ngoState = (ngo.state || "").toLowerCase();
            const ngoCity = (ngo.city || "").toLowerCase();
            const ngoDescription = (ngo.description || "").toLowerCase();

            const matchesState = matchedState ? ngoState === matchedState : true;
            const matchesCity = matchedCity ? ngoCity === matchedCity : true;
            const matchesKeyword = keywords.some(kw => ngoDescription.includes(kw));

            return matchesState && matchesCity && matchesKeyword;
        });

        if (filteredNGOs.length === 0) {
            return res.json({ reply: "I'm here to help! You can ask me about NGOs by city, state, or cause. Could you please rephrase or specify?" });
        }

        const reply = filteredNGOs
            .map((ngo, i) => `${i + 1}. ${ngo.name} – ${ngo.description}`)
            .join("\n\n");

        res.json({ reply });
    } catch (err) {
        res.status(500).json({ reply: "Server error occurred" });
    }
});

module.exports = router;
