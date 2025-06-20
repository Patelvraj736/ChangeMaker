const express = require('express');
const router = express.Router();


router.get('/razorpay-key', (req, res) => {
    res.status(200).json({
        key: process.env.RAZORPAY_KEY_ID,  
    });
});

module.exports = router;
