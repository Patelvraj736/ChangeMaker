const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const pool = require("../db");
require("dotenv").config();

const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

let refreshTokens = [];
let otpStore = {};

function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
    );
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

function cleanupExpiredOtps() {
    const now = Date.now();
    Object.keys(otpStore).forEach(email => {
        if (otpStore[email].expireAt < now) {
            delete otpStore[email];
        }
    });
}
setInterval(cleanupExpiredOtps, 60 * 1000);

router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpirationTime = 10 * 60 * 1000;

        otpStore[email] = {
            otp: otp,
            expireAt: Date.now() + otpExpirationTime,
        };

        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: "Your OTP for Registration",
            text: `Your OTP is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

router.post("/register", upload.single("image"), async (req, res) => {
    const { name, email, password, role, otp } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !role || !otp) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const allowedRoles = ["user", "admin"];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role selected" });
    }

    const storedOtpData = otpStore[email.trim()];
    if (
        !storedOtpData ||
        storedOtpData.expireAt < Date.now() ||
        storedOtpData.otp !== otp.toString().trim()
    ) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email.trim()]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password.trim(), salt);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, role, profile_image) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, profile_image",
            [name.trim(), email.trim(), hashedPassword, role.trim(), imageFile?.buffer || null]
        );

        delete otpStore[email.trim()];

        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0],
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, password, and role are required" });
    }

    try {
        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1 AND role = $2",
            [email, role]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email, password, or role" });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const accessToken = generateAccessToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

        const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
            expiresIn: "7d",
        });

        refreshTokens.push(refreshToken);

        let base64Image = null;
        if (user.profile_image) {
            const buffer = Buffer.from(user.profile_image);
            base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;
        }

        res.json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_image: base64Image,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
    res.json({ message: "Logged out successfully" });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });

        req.user = user;
        next();
    });
};

router.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
