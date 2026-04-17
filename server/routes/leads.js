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

// GET /api/leads/:id — single lead detail
router.get("/:id", (req, res) => {
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json(lead);
});

// POST /api/leads/:id/retry — retry calling a lead
router.post("/:id/retry", (req, res) => {
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  db.prepare("UPDATE leads SET status = 'CALLING', updatedAt = datetime('now') WHERE id = ?").run(req.params.id);

  // Simulate call completion after 3 seconds
  setTimeout(() => {
    const score = 3 + Math.random() * 7;
    const bucket = score >= 7 ? "HOT" : score >= 4 ? "WARM" : "COLD";
    db.prepare("UPDATE leads SET status = 'COMPLETED', score = ?, bucket = ?, updatedAt = datetime('now') WHERE id = ?")
      .run(Math.round(score * 10) / 10, bucket, req.params.id);
  }, 3000);

  res.json({ message: "Call initiated", leadId: req.params.id });
});

// GET /api/leads/:id/call — get call data for a lead
router.get("/:id/call", (req, res) => {
  const call = db.prepare("SELECT * FROM calls WHERE leadId = ? ORDER BY createdAt DESC LIMIT 1").get(req.params.id);
  if (!call) return res.json(null);
  if (call.bantJson) call.bantJson = JSON.parse(call.bantJson);
  res.json(call);
});

export default router;
