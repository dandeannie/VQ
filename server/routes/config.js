import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /api/config
router.get("/", (req, res) => {
  const config = db.prepare("SELECT * FROM config WHERE id = 1").get();
  res.json(config);
});

// PUT /api/config
router.put("/", (req, res) => {
  const d = req.body;
  db.prepare(`
    UPDATE config SET
      callWindowStart = COALESCE(?, callWindowStart),
      callWindowEnd = COALESCE(?, callWindowEnd),
      retry1DelayMinutes = COALESCE(?, retry1DelayMinutes),
      retry2DelayMinutes = COALESCE(?, retry2DelayMinutes),
      maxCallDurationMinutes = COALESCE(?, maxCallDurationMinutes),
      callSlaMinutes = COALESCE(?, callSlaMinutes),
      hotScoreThreshold = COALESCE(?, hotScoreThreshold),
      warmScoreThreshold = COALESCE(?, warmScoreThreshold),
      crmWebhookUrl = COALESCE(?, crmWebhookUrl)
    WHERE id = 1
  `).run(
    d.callWindowStart, d.callWindowEnd,
    d.retry1DelayMinutes, d.retry2DelayMinutes,
    d.maxCallDurationMinutes, d.callSlaMinutes,
    d.hotScoreThreshold, d.warmScoreThreshold,
    d.crmWebhookUrl
  );

  const config = db.prepare("SELECT * FROM config WHERE id = 1").get();
  res.json(config);
});

// POST /api/webhook/test — simulate an incoming webhook event
router.post("/webhook/test", (req, res) => {
  console.log("📨 Test webhook received:", JSON.stringify(req.body, null, 2));
  res.json({ success: true, message: "Webhook event received", payload: req.body });
});

export default router;
