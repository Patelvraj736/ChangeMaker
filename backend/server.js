const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const ngoRoutes = require("./routes/ngoRoutes");
const authRoutes = require("./routes/authRoutes");
const razorpayConfig = require("./routes/payment.js");
const donationsRoutes = require("./routes/donations");
const chatbotRoute = require("./routes/chatbot");
const statsRouter = require('./routes/stats');

require("dotenv").config();

const app = express();

// ✅ CORS setup
app.use(cors({
  origin: 'https://changemakerr.netlify.app',
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); 

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/ngos", ngoRoutes);
app.use('/api/stats', statsRouter);
app.use('/api/users', ngoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/config", razorpayConfig);
app.use("/api/donations", donationsRoutes);
app.use("/api/chatbot", chatbotRoute);
app.use('/ngo', ngoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
