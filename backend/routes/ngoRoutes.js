const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const authenticateToken = require("../middlewares/authenticateToken");
const { getNGOCategories, getNGOsByCategory } = require("../models/ngoModel");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/categories", async (req, res) => {
    try {
        const categories = await getNGOCategories();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/category/:id/ngos" ,async (req, res) => {
    try {
        const ngos = await getNGOsByCategory(req.params.id);
        res.json(ngos);
    } catch (error) {
        console.error("Error fetching NGOs by category:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/ngo/:id", async (req, res) => {
    try {
        const ngo = await pool.query("SELECT * FROM ngos WHERE id = $1", [req.params.id]);
        if (ngo.rows.length === 0) {
            return res.status(404).json({ message: "NGO not found" });
        }
        res.json(ngo.rows[0]);
    } catch (error) {
        console.error("Error fetching NGO details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.post("/add", authenticateToken, upload.single("image"), async (req, res) => {
    const {
        name, description, type_id, details,
        address, city, state, country,
        latitude, longitude, phone, email
    } = req.body;

    const imageFile = req.file;
    const userId = req.user.id;
    if (
        !name || !description || !type_id || !details || !address ||
        !city || !state || !country || !latitude || !longitude ||
        !phone || !email || !imageFile
    ) {
        return res.status(400).json({ message: "All fields including image are required" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO ngos 
                (name, description, type_id, image_data, details, address, city, state, country, latitude, longitude, phone, email, user_id)
             VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING *`,
            [
                name, description, type_id, imageFile.buffer, details, address,
                city, state, country, latitude, longitude, phone, email, userId
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error inserting NGO:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/:id/image", async (req, res) => {
    try {
        const result = await pool.query("SELECT image_data FROM ngos WHERE id = $1", [req.params.id]);
        const imageData = result.rows[0]?.image_data;

        if (!imageData) return res.status(404).send("Image not found");

        res.set("Content-Type", "image/jpeg");
        res.send(imageData);
    } catch (err) {
        console.error("Error fetching image:", err.message);
        res.status(500).json({ message: "Error fetching image." });
    }
});

router.get("/filter", async (req, res) => {
    const { state, city } = req.query;

    try {
        const ngos = await pool.query(
            "SELECT * FROM ngos WHERE state = $1 AND city = $2",
            [state, city]
        );
        res.json(ngos.rows);
    } catch (error) {
        console.error("Error fetching filtered NGOs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/featured/:categoryId", async (req, res) => {
    try {
        const { categoryId } = req.params;
        const result = await pool.query(`
            SELECT n.*, COALESCE(AVG(r.rating), 0) as avg_rating
            FROM ngos n
            LEFT JOIN reviews r ON n.id = r.ngo_id
            WHERE n.type_id = $1
            GROUP BY n.id
            ORDER BY avg_rating DESC, n.id ASC
            LIMIT 1
        `, [categoryId]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.json({ message: "No featured NGO found" });
        }
    } catch (error) {
        console.error("Error fetching featured NGO:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/ngo/:id/reviews", async (req, res) => {
    try {
        const reviews = await pool.query(
            "SELECT * FROM reviews WHERE ngo_id = $1 ORDER BY created_at DESC",
            [req.params.id]
        );
        res.json(reviews.rows);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/ngo/:id/reviews", authenticateToken, async (req, res) => {
    const { user_name, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        const newReview = await pool.query(
            "INSERT INTO reviews (ngo_id, user_name, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
            [req.params.id, user_name, rating, comment]
        );
        res.status(201).json({ message: "Review added successfully", review: newReview.rows[0] });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Database Error" });
    }
});

router.post("/upload-profile", authenticateToken, upload.single("image"), async (req, res) => {
    const imageFile = req.file;
    const userId = req.user.id;

    if (!imageFile) return res.status(400).json({ message: "Profile image is required" });

    try {
        await pool.query(
            "UPDATE users SET profile_image = $1, profile_image_type = $2 WHERE id = $3",
            [imageFile.buffer, imageFile.mimetype, userId]
        );
        res.status(200).json({ message: "Profile image uploaded successfully" });
    } catch (err) {
        console.error("Error saving profile image:", err.message);
        res.status(500).json({ message: "Database error" });
    }
});

router.get('/profile/image/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            'SELECT profile_image, profile_image_type FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0 || !result.rows[0].profile_image) {
            return res.status(404).send('Image not found');
        }

        const image = result.rows[0].profile_image;
        const contentType = result.rows[0].profile_image_type || 'image/jpeg';

        res.set('Content-Type', contentType);
        res.send(image);
    } catch (err) {
        console.error('Error fetching image:', err);
        res.status(500).send('Server error');
    }
});

router.put("/edit/:id", authenticateToken, upload.single("image"), async (req, res) => {
    const {
        name, description, type_id, details,
        address, city, state, country,
        latitude, longitude, phone, email
    } = req.body;

    const imageFile = req.file;
    const ngoId = req.params.id;
    const userId = req.user.id; 

    if (
        !name || !description || !type_id || !details || !address ||
        !city || !state || !country || !latitude || !longitude ||
        !phone || !email
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const ngoResult = await pool.query("SELECT * FROM ngos WHERE id = $1", [ngoId]);
        const ngo = ngoResult.rows[0];

        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        if (ngo.user_id !== userId) {
            return res.status(403).json({ message: "Not authorized to update this NGO" });
        }

        let updateQuery = `
            UPDATE ngos 
            SET name = $1, description = $2, type_id = $3, details = $4, 
                address = $5, city = $6, state = $7, country = $8, 
                latitude = $9, longitude = $10, phone = $11, email = $12
            WHERE id = $13
            RETURNING *`;

        let values = [
            name, description, type_id, details, address, city, state, country, 
            latitude, longitude, phone, email, ngoId
        ];

        if (imageFile) {
            updateQuery = `
                UPDATE ngos 
                SET name = $1, description = $2, type_id = $3, details = $4, 
                    address = $5, city = $6, state = $7, country = $8, 
                    latitude = $9, longitude = $10, phone = $11, email = $12,
                    image_data = $13
                WHERE id = $14
                RETURNING *`;

            values = [
                name, description, type_id, details, address, city, state, country, 
                latitude, longitude, phone, email, imageFile.buffer, ngoId
            ];
        }

        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "NGO not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating NGO:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.delete("/:id", authenticateToken, async (req, res) => {
    const ngoId = req.params.id;
    const userId = req.user.id; 

    try {
        const result = await pool.query("SELECT * FROM ngos WHERE id = $1", [ngoId]);
        const ngo = result.rows[0];

        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }
        if (ngo.user_id !== userId) {
            return res.status(403).json({ message: "Not authorized to delete this NGO" });
        }

        const deleteResult = await pool.query("DELETE FROM ngos WHERE id = $1 RETURNING *", [ngoId]);

        res.status(200).json({ message: "NGO deleted successfully", ngo: deleteResult.rows[0] });
    } catch (error) {
        console.error("Error deleting NGO:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

const authenticateUser = require("../middlewares/authenticateToken");

router.get("/user/:userId", authenticateToken, async (req, res) => {
    const { userId } = req.params;

    if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Access denied." });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM ngos WHERE user_id = $1",
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching NGOs by user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
