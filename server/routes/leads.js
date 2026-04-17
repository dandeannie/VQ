import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /api/leads — paginated, searchable, filterable
router.get("/", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
  const offset = (page - 1) * pageSize;

  let where = "1=1";
  const params = [];

  if (req.query.search) {
    where += " AND (name LIKE ? OR phone LIKE ?)";
    params.push(`%${req.query.search}%`, `%${req.query.search}%`);
  }
  if (req.query.bucket && req.query.bucket !== "ALL") {
    where += " AND bucket = ?";
    params.push(req.query.bucket);
  }
  if (req.query.status && req.query.status !== "ALL") {
    where += " AND status = ?";
    params.push(req.query.status);
  }

  const total = db.prepare(`SELECT COUNT(*) as c FROM leads WHERE ${where}`).get(...params).c;
  const leads = db.prepare(`SELECT * FROM leads WHERE ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset);

  res.json({
    leads,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
});

// POST /api/leads — create a new lead
router.post("/", (req, res) => {
  const { name, phone, source } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "name and phone are required" });

  const result = db.prepare(
    "INSERT INTO leads (name, phone, source) VALUES (?, ?, ?)"
  ).run(name, phone, source || "Manual");

  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(lead);
});

// GET /api/leads/:id — single lead detail with BANT + calls
router.get("/:id", (req, res) => {
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  // Get all calls for this lead
  const calls = db.prepare("SELECT * FROM calls WHERE leadId = ? ORDER BY createdAt DESC").all(req.params.id);

  // Parse BANT from the most recent completed call
  let bant = null;
  const completedCall = calls.find(c => c.status === "COMPLETED" && c.bantJson);
  if (completedCall && completedCall.bantJson) {
    try { bant = JSON.parse(completedCall.bantJson); } catch {}
  }

  // Convert crmPushed from 0/1 to boolean
  lead.crmPushed = !!lead.crmPushed;

  res.json({
    ...lead,
    bant,
    calls: calls.map(c => ({
      id: c.id,
      callSid: c.callSid,
      externalId: c.externalId,
      status: c.status,
      duration: c.duration,
      transcript: c.transcript,
      sentiment: c.sentiment,
      recordingUrl: c.recordingUrl,
      startedAt: c.startedAt,
      createdAt: c.createdAt,
    })),
  });
});

// POST /api/leads/:id/retry — retry calling a lead
router.post("/:id/retry", (req, res) => {
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  db.prepare("UPDATE leads SET status = 'CALLING', retryCount = retryCount + 1, updatedAt = datetime('now') WHERE id = ?").run(req.params.id);

  // Insert a new call record
  const callSid = `call_${Date.now()}_${req.params.id}`;
  db.prepare("INSERT INTO calls (leadId, callSid, status, startedAt) VALUES (?, ?, 'CALLING', datetime('now'))").run(req.params.id, callSid);

  // Simulate call completion after 3 seconds
  setTimeout(() => {
    const score = 3 + Math.random() * 7;
    const bucket = score >= 7 ? "HOT" : score >= 4 ? "WARM" : "COLD";
    const bant = JSON.stringify({
      budget: Math.round((1 + Math.random() * 2) * 10) / 10,
      authority: Math.round((1 + Math.random() * 2) * 10) / 10,
      need: Math.round((1 + Math.random() * 2) * 10) / 10,
      timeline: Math.round((1 + Math.random() * 2) * 10) / 10,
    });
    const duration = 30 + Math.floor(Math.random() * 120);
    const transcript = "Hello, thank you for calling back. I wanted to follow up on our previous conversation about your sales automation needs. We have a budget set aside and are looking to implement within this quarter.";

    db.prepare("UPDATE leads SET status = 'COMPLETED', score = ?, bucket = ?, updatedAt = datetime('now') WHERE id = ?")
      .run(Math.round(score * 10) / 10, bucket, req.params.id);
    db.prepare("UPDATE calls SET status = 'COMPLETED', duration = ?, transcript = ?, bantJson = ?, sentiment = 'positive' WHERE callSid = ?")
      .run(duration, transcript, bant, callSid);
  }, 3000);

  res.json({ message: "Call initiated", leadId: parseInt(req.params.id) });
});

// GET /api/calls/:id — get a single call by call ID
router.get("/:leadId/calls/:callId", (req, res) => {
  const call = db.prepare("SELECT * FROM calls WHERE id = ? AND leadId = ?").get(req.params.callId, req.params.leadId);
  if (!call) return res.status(404).json({ error: "Call not found" });
  if (call.bantJson) { try { call.bantJson = JSON.parse(call.bantJson); } catch {} }
  res.json(call);
});

export default router;
