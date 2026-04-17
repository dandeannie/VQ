import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Phone, Book, Code, Webhook, Key, Zap, Settings, Shield,
  ChevronRight, Search, Copy, CheckCircle, ExternalLink
} from "lucide-react";

const cx = "px-8 md:px-12 xl:px-20";

const sections = [
  {
    id: "getting-started",
    icon: Book,
    title: "Getting Started",
    content: {
      title: "Getting Started with VoiceQual",
      intro: "Get up and running in under 60 minutes. This guide walks you through account setup, CRM integration, and placing your first qualification call.",
      steps: [
        {
          title: "1. Create your account",
          desc: "Sign up at app.voicequal.com and complete your organization profile. You'll need your company name, primary CRM, and timezone.",
          code: null,
        },
        {
          title: "2. Connect your CRM",
          desc: "Navigate to Settings → Integrations and connect your CRM. We support native integrations with Salesforce, HubSpot, Pipedrive, and Zoho. For other CRMs, use our webhook endpoint.",
          code: null,
        },
        {
          title: "3. Configure call settings",
          desc: "Set your call window (e.g., 9 AM – 6 PM IST), retry delays, and maximum call duration. These can be changed anytime from the admin panel.",
          code: null,
        },
        {
          title: "4. Ingest your first lead",
          desc: "Use the API or manually add a lead from the dashboard. VoiceQual will automatically queue a qualification call.",
          code: `curl -X POST https://api.voicequal.com/v1/leads \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Priya Menon",
    "phone": "+91-9876543211",
    "source": "Website"
  }'`,
        },
        {
          title: "5. Monitor results",
          desc: "Watch the dashboard for real-time updates. Once the call completes, you'll see BANT scores, transcript, and the lead's bucket assignment (Hot / Warm / Cold).",
          code: null,
        },
      ],
    },
  },
  {
    id: "api-reference",
    icon: Code,
    title: "API Reference",
    content: {
      title: "REST API Reference",
      intro: "The VoiceQual API is organized around REST. All requests and responses use JSON. Authentication is via Bearer token in the Authorization header.",
      steps: [
        {
          title: "Base URL",
          desc: "All API requests are made to the following base URL:",
          code: "https://api.voicequal.com/v1",
        },
        {
          title: "Authentication",
          desc: "Include your API key in the Authorization header of every request. You can generate API keys from Settings → API Access in your dashboard.",
          code: `curl -H "Authorization: Bearer vq_live_abc123..."`,
        },
        {
          title: "POST /leads — Create a lead",
          desc: "Creates a new lead and queues a qualification call. Returns the created lead object with ID and status.",
          code: `POST /v1/leads
{
  "name": "string (required)",
  "phone": "string (required, E.164 format)",
  "source": "string (required)"
}

Response 201:
{
  "id": 42,
  "name": "Priya Menon",
  "phone": "+91-9876543211",
  "source": "Website",
  "status": "PENDING",
  "bucket": null,
  "score": null,
  "createdAt": "2024-03-15T10:30:00Z"
}`,
        },
        {
          title: "GET /leads — List leads",
          desc: "Returns a paginated list of leads with optional filters for bucket, status, and search.",
          code: `GET /v1/leads?page=1&pageSize=50&bucket=HOT&status=COMPLETED

Response 200:
{
  "leads": [...],
  "total": 342,
  "page": 1,
  "totalPages": 7
}`,
        },
        {
          title: "GET /leads/:id — Get lead detail",
          desc: "Returns full lead details including BANT scores, call history, and CRM sync status.",
          code: `GET /v1/leads/42

Response 200:
{
  "id": 42,
  "name": "Priya Menon",
  "score": 9.1,
  "bucket": "HOT",
  "bant": {
    "budget": 3,
    "authority": 3,
    "need": 3,
    "timeline": 2
  },
  "calls": [...]
}`,
        },
        {
          title: "GET /analytics/overview — Dashboard stats",
          desc: "Returns aggregate metrics for the dashboard including total leads, calls, hot leads, and conversion rate.",
          code: `GET /v1/analytics/overview

Response 200:
{
  "totalLeads": 1284,
  "callsInitiated": 986,
  "hotLeads": 342,
  "conversionRate": 34.7
}`,
        },
      ],
    },
  },
  {
    id: "webhooks",
    icon: Webhook,
    title: "Webhooks",
    content: {
      title: "Webhook Integration",
      intro: "Receive real-time notifications when events occur in your VoiceQual account. Webhooks are HTTP POST requests sent to your specified URL.",
      steps: [
        {
          title: "Supported events",
          desc: "VoiceQual sends webhooks for the following events: call.started, call.completed, call.failed, lead.qualified, lead.bucket_changed",
          code: null,
        },
        {
          title: "Payload format",
          desc: "All webhook payloads follow the same structure with event type, timestamp, and event-specific data.",
          code: `{
  "event": "call.completed",
  "timestamp": "2024-03-15T10:35:00Z",
  "data": {
    "callId": "call_abc123",
    "leadId": 42,
    "status": "COMPLETED",
    "duration": 187,
    "score": 9.1,
    "bucket": "HOT",
    "bant": {
      "budget": 3,
      "authority": 3,
      "need": 3,
      "timeline": 2
    }
  }
}`,
        },
        {
          title: "Verifying webhooks",
          desc: "Each webhook includes an X-VoiceQual-Signature header. Verify it by computing HMAC-SHA256 of the raw body with your webhook secret.",
          code: `const crypto = require('crypto');

function verify(body, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`,
        },
        {
          title: "Retry policy",
          desc: "If your endpoint returns a non-2xx status, VoiceQual retries with exponential backoff: 1 min, 5 min, 30 min, 2 hours. After 4 failures, the webhook is marked as failed and visible in your dashboard.",
          code: null,
        },
      ],
    },
  },
  {
    id: "authentication",
    icon: Key,
    title: "Authentication",
    content: {
      title: "API Authentication",
      intro: "VoiceQual uses API keys for server-to-server authentication and OAuth 2.0 for user-facing integrations.",
      steps: [
        {
          title: "API Keys",
          desc: "Generate API keys from Settings → API Access. Keys are prefixed with vq_live_ (production) or vq_test_ (sandbox). Store them securely — they grant full access to your account.",
          code: `# Production key
Authorization: Bearer vq_live_abc123...

# Sandbox key (safe for testing)
Authorization: Bearer vq_test_xyz789...`,
        },
        {
          title: "Rate limits",
          desc: "API requests are rate-limited per key: Starter plans get 100 req/min, Professional 500 req/min, Enterprise custom. Rate limit headers are included in every response.",
          code: `X-RateLimit-Limit: 500
X-RateLimit-Remaining: 498
X-RateLimit-Reset: 1710489600`,
        },
        {
          title: "Error handling",
          desc: "All errors return a consistent JSON structure with error code, message, and optional details.",
          code: `{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 30
  }
}`,
        },
      ],
    },
  },
  {
    id: "scoring",
    icon: Zap,
    title: "BANT Scoring",
    content: {
      title: "How BANT Scoring Works",
      intro: "VoiceQual scores each lead across four dimensions after every qualification call. Understanding the scoring model helps you set the right thresholds for your pipeline.",
      steps: [
        {
          title: "Scoring dimensions",
          desc: "Each dimension is scored 0–3 based on responses during the call. The composite score is a weighted average scaled to 0–10.",
          code: `Budget:    0–3 (weight: 30%)
Authority: 0–3 (weight: 20%)
Need:      0–3 (weight: 25%)
Timeline:  0–3 (weight: 25%)

Composite = ((B×0.30 + A×0.20 + N×0.25 + T×0.25) / 3) × 10`,
        },
        {
          title: "Bucket thresholds",
          desc: "Leads are automatically assigned to buckets based on their composite score. Default thresholds can be customized per account.",
          code: `HOT:  score ≥ 7.0  (high intent, ready to buy)
WARM: score ≥ 4.0  (interested, needs nurturing)
COLD: score < 4.0  (low intent or unqualified)`,
        },
        {
          title: "Score confidence",
          desc: "A confidence level (0–100%) is assigned based on call quality factors: call duration, number of BANT questions answered, audio quality, and conversation completeness.",
          code: null,
        },
      ],
    },
  },
  {
    id: "configuration",
    icon: Settings,
    title: "Configuration",
    content: {
      title: "System Configuration",
      intro: "All system settings can be managed via the admin dashboard or the configuration API endpoint.",
      steps: [
        {
          title: "Call windows",
          desc: "Define when calls can be placed. VoiceQual respects timezone-aware windows and will hold calls outside the window until the next available slot.",
          code: `{
  "callWindowStart": "09:00",
  "callWindowEnd": "18:00",
  "timezone": "Asia/Kolkata"
}`,
        },
        {
          title: "Retry configuration",
          desc: "Configure retry delays and maximum attempts. Retries are only triggered for unanswered calls or voicemail — completed calls are never retried.",
          code: `{
  "retry1DelayMinutes": 30,
  "retry2DelayMinutes": 120,
  "maxRetries": 2
}`,
        },
        {
          title: "SLA settings",
          desc: "Set the maximum time between lead ingestion and first call attempt. SLA violations are flagged in the dashboard and can trigger alerts.",
          code: `{
  "callSlaMinutes": 5,
  "slaAlertChannel": "slack"
}`,
        },
      ],
    },
  },
  {
    id: "security",
    icon: Shield,
    title: "Security",
    content: {
      title: "Security & Compliance",
      intro: "VoiceQual is built with enterprise-grade security from the ground up. Here's how we protect your data.",
      steps: [
        {
          title: "Data encryption",
          desc: "All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Database backups are encrypted and stored in geographically redundant locations.",
          code: null,
        },
        {
          title: "Compliance certifications",
          desc: "VoiceQual is SOC 2 Type II certified, GDPR compliant, and CCPA compliant. We undergo annual third-party penetration testing and publish results to Enterprise customers.",
          code: null,
        },
        {
          title: "Data retention",
          desc: "Call recordings are automatically deleted after the retention period specified in your plan (7 days for Starter, 90 days for Professional, custom for Enterprise). Transcripts and scores are retained for the duration of your subscription.",
          code: null,
        },
        {
          title: "Access controls",
          desc: "Enterprise plans include role-based access control (RBAC) with Admin, Manager, and Viewer roles. All actions are logged in an immutable audit trail.",
          code: null,
        },
      ],
    },
  },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-3 mb-4 rounded-xl overflow-hidden border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="w-2 h-2 rounded-full bg-amber-400/60" />
          <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
        </div>
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors">
          {copied ? <><CheckCircle className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      <pre className="bg-[#0D1117] text-gray-300 text-[13px] p-4 overflow-x-auto font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Docs() {
  const [active, setActive] = useState("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  const activeSection = sections.find(s => s.id === active) || sections[0];
  const filteredSections = searchQuery
    ? sections.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.content.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sections;

  return (
    <div className="w-full min-h-screen text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className={`w-full ${cx} h-16 flex items-center justify-between`}>
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1F8A70', border: '1px solid #D4AF37', boxShadow: '0 4px 12px rgba(31,138,112,0.35)' }}>
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-base text-gray-900">VoiceQual</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="/docs" className="font-semibold" style={{ color: '#1F8A70' }}>Docs</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Sign In</Link>
            <Link href="/dashboard">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-block text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer" style={{ backgroundColor: '#1F8A70', boxShadow: '0 4px 12px rgba(31,138,112,0.35)' }}>
                Get Started
              </motion.span>
            </Link>
          </div>
        </div>
      </header>

      {/* Docs layout */}
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-gray-200 bg-gray-50 p-6 hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search docs..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all" />
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Documentation</div>
          <nav className="space-y-0.5">
            {filteredSections.map(section => {
              const isActive = active === section.id;
              return (
                <button key={section.id} onClick={() => setActive(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    isActive ? "border" : "text-gray-600 hover:bg-gray-100 border border-transparent"
                  }`} style={isActive ? { backgroundColor: 'rgba(31,138,112,0.06)', color: '#0F3D3E', borderColor: 'rgba(31,138,112,0.2)' } : {}}>
                  <section.icon className={`w-4 h-4 shrink-0`} style={{ color: isActive ? '#1F8A70' : '#9CA3AF' }} />
                  <span className="flex-1">{section.title}</span>
                  {isActive && <ChevronRight className="w-3 h-3" style={{ color: '#1F8A70' }} />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto px-8 py-12">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <Link href="/docs" className="hover:text-gray-600">Docs</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-700 font-medium">{activeSection.content.title}</span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">{activeSection.content.title}</h1>
              <p className="text-gray-500 leading-relaxed text-lg mb-10 border-b border-gray-100 pb-8">{activeSection.content.intro}</p>

              <div className="space-y-8">
                {activeSection.content.steps.map((step, i) => (
                  <motion.div key={step.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    {step.code && <CodeBlock code={step.code} />}
                  </motion.div>
                ))}
              </div>

              {/* Nav footer */}
              <div className="flex items-center justify-between mt-16 pt-8 border-t border-gray-100">
                {sections.findIndex(s => s.id === active) > 0 ? (
                  <button onClick={() => setActive(sections[sections.findIndex(s => s.id === active) - 1].id)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    ← {sections[sections.findIndex(s => s.id === active) - 1].title}
                  </button>
                ) : <div />}
                {sections.findIndex(s => s.id === active) < sections.length - 1 ? (
                  <button onClick={() => setActive(sections[sections.findIndex(s => s.id === active) + 1].id)}
                    className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: '#1F8A70' }}>
                    {sections[sections.findIndex(s => s.id === active) + 1].title} →
                  </button>
                ) : <div />}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
