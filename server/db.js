import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "voicequal.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ──────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    phone         TEXT NOT NULL,
    source        TEXT NOT NULL DEFAULT 'Website',
    bucket        TEXT CHECK(bucket IN ('HOT','WARM','COLD')),
    score         REAL,
    status        TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','CALLING','COMPLETED','FAILED','VM_LEFT')),
    language      TEXT DEFAULT 'en-IN',
    retryCount    INTEGER DEFAULT 0,
    crmPushed     INTEGER DEFAULT 0,
    crmPushedAt   TEXT,
    createdAt     TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS calls (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    leadId        INTEGER NOT NULL REFERENCES leads(id),
    callSid       TEXT,
    externalId    TEXT,
    status        TEXT NOT NULL DEFAULT 'PENDING',
    duration      INTEGER DEFAULT 0,
    transcript    TEXT,
    bantJson      TEXT,
    sentiment     TEXT,
    recordingUrl  TEXT,
    startedAt     TEXT,
    createdAt     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS config (
    id                     INTEGER PRIMARY KEY CHECK(id = 1),
    callWindowStart        TEXT DEFAULT '09:00',
    callWindowEnd          TEXT DEFAULT '18:00',
    retry1DelayMinutes     INTEGER DEFAULT 30,
    retry2DelayMinutes     INTEGER DEFAULT 120,
    maxCallDurationMinutes INTEGER DEFAULT 5,
    callSlaMinutes         INTEGER DEFAULT 15,
    hotScoreThreshold      REAL DEFAULT 7.0,
    warmScoreThreshold     REAL DEFAULT 4.0,
    crmWebhookUrl          TEXT DEFAULT '',
    sarvamApiKey           TEXT DEFAULT '',
    promptTemplate         TEXT DEFAULT 'You are a professional sales qualification agent. Evaluate the lead using the BANT framework.'
  );

  INSERT OR IGNORE INTO config (id) VALUES (1);
`);

// ── Seed data if empty ──────────────────────────────────────────────
const count = db.prepare("SELECT COUNT(*) as c FROM leads").get();
if (count.c === 0) {
  const names = [
    "Aarav Sharma", "Priya Patel", "Rohan Gupta", "Sneha Iyer", "Vikram Singh",
    "Ananya Reddy", "Karthik Nair", "Meera Joshi", "Arjun Das", "Kavya Menon",
    "Rahul Verma", "Divya Kapoor", "Aditya Rao", "Neha Chakraborty", "Siddharth Pillai",
    "Pooja Agarwal", "Varun Mishra", "Ritu Saxena", "Manish Tiwari", "Ishita Banerjee",
    "Gaurav Malhotra", "Swati Deshmukh", "Nikhil Bhat", "Anjali Kulkarni", "Deepak Srinivasan",
    "Shruti Pandey", "Rajesh Hegde", "Tanvi Bhardwaj", "Amit Chandra", "Pallavi Ghosh",
  ];
  const sources = ["Website", "LinkedIn", "Referral", "Google Ads", "Cold Outreach", "Webinar", "Trade Show"];
  const buckets = ["HOT", "WARM", "COLD"];
  const statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "CALLING", "PENDING", "FAILED", "VM_LEFT"];
  const languages = ["en-IN", "hi-IN", "en-IN", "ta-IN", "en-IN", "bn-IN", "en-IN", "mr-IN", "en-IN", "te-IN", "en-IN", "gu-IN", "en-IN"];
  const transcripts = [
    "Hi, I am looking for an automated calling solution for our sales team. We have about 200 leads per month and our budget is around 5 lakhs per quarter. We want to start implementing within the next 2 weeks. I am the VP of Sales and can make the purchasing decision.",
    "Hello, we are a mid-size company exploring AI voice solutions. Currently evaluating 3 vendors. Budget is flexible but around 3 lakhs. Timeline is next quarter. Need to discuss with our CTO before deciding.",
    "Just browsing options right now. Not sure about the budget yet. We might consider it later this year.",
    "We need this urgently for our upcoming product launch. Budget approved at 8 lakhs. I can sign off today. When can we start?",
    "Interesting product. We are a startup with limited funds. Maybe 50k per month. Need to convince my co-founder first.",
  ];

  const insertLead = db.prepare(
    "INSERT INTO leads (name, phone, source, bucket, score, status, language, retryCount, crmPushed, crmPushedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const insertCall = db.prepare(
    "INSERT INTO calls (leadId, callSid, externalId, status, duration, transcript, bantJson, sentiment, startedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

  const seedTransaction = db.transaction(() => {
    for (let i = 0; i < names.length; i++) {
      const bucket = buckets[i % buckets.length];
      const score = bucket === "HOT" ? 7 + Math.random() * 3 : bucket === "WARM" ? 4 + Math.random() * 3 : Math.random() * 4;
      const status = statuses[i % statuses.length];
      const phone = `+91-${9000000000 + Math.floor(Math.random() * 999999999)}`;
      const source = sources[i % sources.length];
      const language = languages[i % languages.length];
      const retryCount = status === "FAILED" || status === "VM_LEFT" ? 1 + Math.floor(Math.random() * 2) : 0;
      const crmPushed = status === "COMPLETED" ? 1 : 0;
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString().replace("T", " ").slice(0, 19);
      const crmPushedAt = crmPushed ? new Date(Date.now() - (daysAgo - 1) * 86400000).toISOString().replace("T", " ").slice(0, 19) : null;

      insertLead.run(names[i], phone, source, bucket, Math.round(score * 10) / 10, status, language, retryCount, crmPushed, crmPushedAt, createdAt);

      // Create 1-3 calls per lead that has been processed
      if (status !== "PENDING") {
        const numCalls = status === "COMPLETED" ? 1 + Math.floor(Math.random() * 2) : 1;
        for (let c = 0; c < numCalls; c++) {
          const callStatus = c === numCalls - 1 ? status : "FAILED";
          const transcript = callStatus === "COMPLETED" || callStatus === "VM_LEFT" ? transcripts[i % transcripts.length] : null;
          const bant = callStatus === "COMPLETED" ? JSON.stringify({
            budget: Math.round((1 + Math.random() * 2) * 10) / 10,
            authority: Math.round((1 + Math.random() * 2) * 10) / 10,
            need: Math.round((1 + Math.random() * 2) * 10) / 10,
            timeline: Math.round((1 + Math.random() * 2) * 10) / 10,
          }) : null;
          const sentiment = callStatus === "COMPLETED" ? ["positive", "neutral", "negative"][i % 3] : null;
          const duration = callStatus === "COMPLETED" ? 30 + Math.floor(Math.random() * 180) : callStatus === "VM_LEFT" ? 10 + Math.floor(Math.random() * 20) : 0;
          const callCreatedAt = new Date(Date.now() - (daysAgo - c) * 86400000).toISOString().replace("T", " ").slice(0, 19);
          const externalId = `ext_${Date.now()}_${i}_${c}`;
          const callSid = `call_${Date.now()}_${i}_${c}`;

          insertCall.run(i + 1, callSid, externalId, callStatus, duration, transcript, bant, sentiment, callCreatedAt, callCreatedAt);
        }
      }
    }
  });

  seedTransaction();
  console.log(`✅ Seeded ${names.length} leads with calls into database`);
}

export default db;
