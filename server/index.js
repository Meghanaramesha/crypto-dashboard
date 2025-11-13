import express from "express";
import cors from "cors";
import cron from "node-cron";

import pool from "./db.js";
import coinRoutes from "./routes/coins.js";
import chatRoutes from "./routes/chat.js";
import queryRoutes from "./routes/query.js";
import { updateCryptoData } from "./helpers/fetchData.js";
//import authRoutes from "./routes/auth.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Update DB every 6 hours
cron.schedule("0 */6 * * *", updateCryptoData);
updateCryptoData(); // first time load

// Routes
app.use("/api/coins", coinRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/query", queryRoutes); 
// app.use("/api/auth", authRoutes);  // ⭐ YOUR CHAT Q&A ROUTE

// Test server
app.get("/", (req, res) => {
  res.send("Crypto Dashboard Backend Running...");
});

// Start server
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
