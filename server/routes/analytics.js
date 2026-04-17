import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /api/analytics/overview — dashboard top-level stats
router.get("/overview", (req, res) => {
  const totalLeads = db.prepare("SELECT COUNT(*) as c FROM leads").get().c;
  const callsInitiated = db.prepare("SELECT COUNT(*) as c FROM leads WHERE status IN ('COMPLETED','CALLING','FAILED','VM_LEFT')").get().c;
  const hotLeads = db.prepare("SELECT COUNT(*) as c FROM leads WHERE bucket = 'HOT'").get().c;
  const warmLeads = db.prepare("SELECT COUNT(*) as c FROM leads WHERE bucket = 'WARM'").get().c;
  const coldLeads = db.prepare("SELECT COUNT(*) as c FROM leads WHERE bucket = 'COLD'").get().c;
  const completed = db.prepare("SELECT COUNT(*) as c FROM leads WHERE status = 'COMPLETED'").get().c;
  const conversionRate = totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 1000) / 10 : 0;

  res.json({ totalLeads, callsInitiated, hotLeads, warmLeads, coldLeads, conversionRate });
});

// GET /api/analytics/funnel — BANT funnel stages
router.get("/funnel", (req, res) => {
  const totalLeads = db.prepare("SELECT COUNT(*) as c FROM leads").get().c;
  const called = db.prepare("SELECT COUNT(*) as c FROM leads WHERE status IN ('COMPLETED','FAILED','VM_LEFT','CALLING')").get().c;
  const completed = db.prepare("SELECT COUNT(*) as c FROM leads WHERE status = 'COMPLETED'").get().c;
  const qualified = db.prepare("SELECT COUNT(*) as c FROM leads WHERE bucket IN ('HOT','WARM')").get().c;
  const hot = db.prepare("SELECT COUNT(*) as c FROM leads WHERE bucket = 'HOT'").get().c;

  const stages = [
    { name: "Leads Ingested", count: totalLeads, percentage: 100 },
    { name: "Calls Initiated", count: called, percentage: totalLeads > 0 ? Math.round((called / totalLeads) * 100) : 0 },
    { name: "Calls Completed", count: completed, percentage: totalLeads > 0 ? Math.round((completed / totalLeads) * 100) : 0 },
    { name: "BANT Qualified", count: qualified, percentage: totalLeads > 0 ? Math.round((qualified / totalLeads) * 100) : 0 },
    { name: "Hot Leads", count: hot, percentage: totalLeads > 0 ? Math.round((hot / totalLeads) * 100) : 0 },
  ];

  res.json({ stages });
});

// GET /api/analytics/daily — daily call volume
router.get("/daily", (req, res) => {
  const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 30));
  const rows = db.prepare(`
    SELECT date(createdAt) as date,
           COUNT(*) as leadsCreated,
           SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as callsCompleted
    FROM leads
    WHERE createdAt >= datetime('now', '-${days} days')
    GROUP BY date(createdAt)
    ORDER BY date ASC
  `).all();

  res.json(rows);
});

// GET /api/analytics/sources — lead source breakdown
router.get("/sources", (req, res) => {
  const rows = db.prepare(`
    SELECT source, COUNT(*) as count
    FROM leads
    GROUP BY source
    ORDER BY count DESC
  `).all();

  res.json(rows);
});

export default router;
