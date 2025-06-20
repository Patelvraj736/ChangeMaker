const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateUser = require("../middlewares/authenticateToken");
const sendDonationConfirmation = require("../utils/mailer");

router.post("/save-donation", authenticateUser, async (req, res) => {
    const { ngo_id, donor_name, email, phone, amount, razorpay_payment_id } = req.body;

    try {
        if (!ngo_id || !donor_name || !email || !amount || !razorpay_payment_id) {
            return res.status(400).json({ message: "Missing required donation fields." });
        }

        const donationQuery = `
            INSERT INTO donations (ngo_id, donor_name, email, phone, amount, razorpay_payment_id)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await pool.query(donationQuery, [ngo_id, donor_name, email, phone, amount, razorpay_payment_id]);

        const ngoResult = await pool.query(`SELECT name FROM ngos WHERE id = $1`, [ngo_id]);
        const ngoName = ngoResult.rows[0]?.name || "NGO";

        try {
            await sendDonationConfirmation(email, donor_name, amount, ngoName, razorpay_payment_id, phone);
        } catch (mailErr) {
            console.error("Error sending email:", mailErr.message);
            return res.status(500).json({ message: "Donation saved, but failed to send confirmation email." });
        }

        res.status(201).json({ message: "Donation saved successfully and email sent." });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.get("/admin/all-donations", authenticateUser, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    try {
        const result = await pool.query(`
            SELECT d.*, 
                   n.name AS ngo_name,
                   c.name AS ngo_type
            FROM donations d
            JOIN ngos n ON d.ngo_id = n.id
            JOIN ngo_categories c ON n.type_id = c.id
            ORDER BY d.donated_at DESC;
        `);

        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
