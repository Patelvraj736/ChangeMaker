const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const ngoCountQuery = 'SELECT COUNT(DISTINCT id) AS count FROM ngos';
    const ngoCountResult = await pool.query(ngoCountQuery);

    const donationQuery = 'SELECT COALESCE(SUM(amount), 0) AS total FROM donations';
    const donationResult = await pool.query(donationQuery);
    console.log('Donation Query Result:', donationResult.rows); 

    const ngoCount = ngoCountResult.rows[0].count;
    const totalDonations = donationResult.rows[0].total || 0; 

    res.json({
      ngoCount,
      totalDonations,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
