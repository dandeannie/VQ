import express from "express";
import cors from "cors";
import leadsRouter from "./routes/leads.js";
import analyticsRouter from "./routes/analytics.js";
import configRouter from "./routes/config.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── API Routes ──────────────────────────────────────────────────────
app.use("/api/leads", leadsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/config", configRouter);

// Webhook test is on the config router
app.post("/api/webhook/test", (req, res) => {
  console.log("📨 Test webhook received:", JSON.stringify(req.body, null, 2));
  res.json({ success: true, message: "Webhook event received", payload: req.body });
});

// ── Health Check ────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   VoiceQual API Server                   ║
  ║   Running on http://localhost:${PORT}        ║
  ╚══════════════════════════════════════════╝
  `);
});
