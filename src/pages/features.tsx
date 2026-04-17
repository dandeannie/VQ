import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { useRef } from "react";
import {
  Phone, BarChart2, RefreshCw, TrendingUp, Settings, Shield,
  ArrowRight, Zap, Clock, Users, CheckCircle, Globe, Database,
  Mic, FileText, Lock, Bell, Layers, GitBranch
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};
const slideLeft = { hidden: { opacity: 0, x: -48 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const slideRight = { hidden: { opacity: 0, x: 48 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

const cx = "px-8 md:px-12 xl:px-20";

const heroFeatures = [
  { icon: Phone, title: "Automated Outbound Calling", desc: "Every inbound lead gets a qualification call within minutes — day or night. VoiceQual handles scheduling, retries, timezone-aware call windows, and voicemail detection. No manual dialing, no missed contacts.", color: "from-blue-500 to-blue-600" },
  { icon: BarChart2, title: "BANT Qualification Scoring", desc: "Each call produces a composite score across Budget, Authority, Need, and Timeline. Leads are automatically bucketed as Hot, Warm, or Cold with fully auditable scoring breakdowns.", color: "from-violet-500 to-violet-600" },
  { icon: RefreshCw, title: "Real-Time CRM Sync", desc: "The moment a call ends, enriched lead data is pushed to Salesforce, HubSpot, Pipedrive, or any webhook endpoint. Score, transcript, call duration, and bucket — all synced instantly.", color: "from-emerald-500 to-emerald-600" },
  { icon: TrendingUp, title: "Pipeline Analytics", desc: "Track conversion rates, call volumes, qualification trends, and source performance from a unified dashboard. Drill into daily, weekly, or monthly views with export capabilities.", color: "from-amber-500 to-amber-600" },
  { icon: Settings, title: "Configurable Rules Engine", desc: "Set call windows, retry delays, score thresholds, SLA targets, and routing rules through a simple admin interface. Changes take effect immediately — no engineering work required.", color: "from-sky-500 to-sky-600" },
  { icon: Shield, title: "Enterprise Compliance", desc: "DND registry checks, consent management, call time restrictions, recording auto-deletion, and SOC 2 Type II certification. Compliance is built into every layer.", color: "from-rose-500 to-rose-600" },
];

const detailSections = [
  {
    badge: "Core Engine",
    title: "AI-powered qualification that sounds human",
    desc: "VoiceQual's calling engine uses conversational AI to guide natural BANT qualification calls. Leads don't know they're talking to a machine — the conversation flows like a real SDR call.",
    features: [
      { icon: Mic, text: "Natural conversational flow with dynamic responses" },
      { icon: Globe, text: "Multi-language support (12 languages including Hindi, Spanish, Mandarin)" },
      { icon: Clock, text: "Average call completion in under 4 minutes" },
      { icon: FileText, text: "Full real-time transcription with speaker labels" },
    ],
    align: "left" as const,
  },
  {
    badge: "Data & Integrations",
    title: "Connected to your entire sales stack",
    desc: "VoiceQual doesn't replace your tools — it plugs into them. Push scored leads directly to your CRM, trigger Slack alerts, fire webhooks, or use our REST API for custom workflows.",
    features: [
      { icon: Database, text: "Native Salesforce, HubSpot, Pipedrive, Zoho integrations" },
      { icon: GitBranch, text: "Zapier connector for 5,000+ apps" },
      { icon: Bell, text: "Real-time Slack/Teams alerts for Hot leads" },
      { icon: Layers, text: "REST API with webhooks for custom workflows" },
    ],
    align: "right" as const,
  },
  {
    badge: "Security & Compliance",
    title: "Enterprise-grade security from day one",
    desc: "Your data is protected at every layer. End-to-end encryption, SOC 2 certification, GDPR compliance, and granular access controls ensure your organization stays secure and compliant.",
    features: [
      { icon: Lock, text: "AES-256 encryption at rest, TLS 1.3 in transit" },
      { icon: Shield, text: "SOC 2 Type II certified, GDPR and CCPA compliant" },
      { icon: Users, text: "Role-based access control with audit logging" },
      { icon: CheckCircle, text: "99.99% uptime SLA with automated failover" },
    ],
    align: "left" as const,
  },
];

function DetailSection({ section, index }: { section: typeof detailSections[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const content = (
    <motion.div initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={section.align === "left" ? slideLeft : slideRight}>
      <div className="inline-flex items-center gap-2 text-xs font-semibold border rounded-full px-3 py-1 mb-4" style={{ color: '#0F3D3E', backgroundColor: 'rgba(31,138,112,0.06)', borderColor: 'rgba(31,138,112,0.2)' }}>
        {section.badge}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">{section.title}</h3>
      <p className="text-gray-500 leading-relaxed mb-8">{section.desc}</p>
      <div className="space-y-4">
        {section.features.map((f, i) => (
          <motion.div key={f.text} initial={{ opacity: 0, x: section.align === "left" ? -20 : 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(31,138,112,0.06)', borderColor: 'rgba(31,138,112,0.15)' }}>
              <f.icon className="w-4 h-4" style={{ color: '#1F8A70' }} />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed pt-1">{f.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const visual = (
    <motion.div initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={section.align === "left" ? slideRight : slideLeft}
      className="rounded-2xl border border-gray-200 bg-gray-50 p-8 flex items-center justify-center min-h-[320px]">
      <div className="grid grid-cols-2 gap-3 w-full">
        {section.features.map((f, i) => (
          <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}} transition={{ delay: 0.4 + i * 0.12 }}
            whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
            className="bg-white border border-gray-200 rounded-xl p-4 text-center transition-shadow">
            <div className="w-10 h-10 rounded-lg border flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(31,138,112,0.06)', borderColor: 'rgba(31,138,112,0.15)' }}>
              <f.icon className="w-5 h-5" style={{ color: '#1F8A70' }} />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{f.text.split(" ").slice(0, 4).join(" ")}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div ref={ref} className={`grid md:grid-cols-2 gap-16 items-center ${index > 0 ? "pt-20 border-t border-gray-100" : ""}`}>
      {section.align === "left" ? <>{content}{visual}</> : <>{visual}{content}</>}
    </div>
  );
}

export default function Features() {
  return (
    <div className="w-full min-h-screen text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className={`w-full ${cx} h-16 flex items-center justify-between`}>
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: '#1F8A70' }}>
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-base text-gray-900">VoiceQual</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/features" className="font-semibold" style={{ color: '#1F8A70' }}>Features</Link>
            <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-gray-900 transition-colors">Docs</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Sign In</Link>
            <Link href="/dashboard">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-block text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer shadow-sm" style={{ backgroundColor: '#1F8A70' }}>
                Get Started
              </motion.span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full py-20 bg-[#F5F5F5]">
        <div className={`w-full ${cx} text-center`}>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Stop routing unqualified leads<br />
            <span style={{ color: '#D4AF37' }}>
              to your sales team.
            </span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
            VoiceQual calls every inbound lead, scores them on BANT, and syncs only verified opportunities to your CRM. Your reps engage — not qualify.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm cursor-pointer shadow-lg" style={{ backgroundColor: '#1F8A70' }}>
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
            <Link href="/pricing">
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 text-gray-700 font-medium text-sm border border-gray-300 px-6 py-3 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                View Pricing
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="w-full py-20 bg-white">
        <div className={`w-full ${cx}`}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {heroFeatures.map((f, i) => (
              <motion.div key={f.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp} custom={i}
                whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
                className="bg-white border border-gray-200 rounded-2xl p-7 cursor-default transition-shadow">
                <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center mb-5">
                  <f.icon className="w-4.5 h-4.5 text-gray-700" style={{ width: 18, height: 18 }} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail sections */}
      <section className="w-full py-20 bg-gray-50 border-t border-gray-100">
        <div className={`w-full ${cx} space-y-20`}>
          {detailSections.map((section, i) => (
            <DetailSection key={section.title} section={section} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-16" style={{ backgroundColor: '#051212' }}>
        <div className={`w-full ${cx} text-center`}>
          <h2 className="text-3xl font-bold text-white mb-4">See VoiceQual in action</h2>
          <p className="text-emerald-100 mb-8 text-base">Start qualifying leads automatically in under an hour.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-white font-bold px-7 py-3.5 rounded-xl text-sm cursor-pointer shadow-xl" style={{ color: '#0F3D3E' }}>
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
            <Link href="/pricing">
              <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-medium px-7 py-3.5 rounded-xl text-sm cursor-pointer transition-colors">
                View Pricing
              </motion.span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 bg-white py-10">
        <div className={`w-full ${cx} flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400`}>
          <div>© 2024 VoiceQual AI. All rights reserved.</div>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Security"].map(l => (
              <a key={l} href="#" className="hover:text-gray-700 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
