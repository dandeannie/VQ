import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Phone, Check, ArrowRight, Zap, ChevronDown, Shield, BarChart2, Headphones, Lock } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const } }),
};

const plans = [
  {
    name: "Starter",
    badge: null,
    price: "₹4,999",
    period: "/month",
    description: "For teams calling under 500 leads per month.",
    cta: "Start Free Trial",
    popular: false,
    color: "#0F3D3E",
    icon: BarChart2,
    features: [
      "Up to 500 leads / month",
      "BANT scoring on all calls",
      "Email + chat support",
      "1 CRM integration",
      "Basic analytics dashboard",
      "7-day call recording retention",
      "Standard call quality",
    ],
  },
  {
    name: "Professional",
    badge: "Most Popular",
    price: "₹12,999",
    period: "/month",
    description: "For teams that need volume, custom scoring, and full API access.",
    cta: "Start Free Trial",
    popular: true,
    color: "#1F8A70",
    icon: Zap,
    features: [
      "Up to 5,000 leads / month",
      "BANT scoring + custom criteria",
      "Priority support + Slack channel",
      "Unlimited CRM integrations",
      "Advanced analytics + exports",
      "90-day call recording retention",
      "HD call quality",
      "Custom calling scripts",
      "Webhook & API access",
      "Team permissions & roles",
    ],
  },
  {
    name: "Enterprise",
    badge: "Custom",
    price: "Talk to us",
    period: "",
    description: "For organizations with compliance needs and dedicated support.",
    cta: "Contact Sales",
    popular: false,
    color: "#0F172A",
    icon: Shield,
    features: [
      "Unlimited leads",
      "Fully custom scoring models",
      "Dedicated account manager",
      "SSO & SAML authentication",
      "99.99% uptime SLA",
      "Unlimited recording retention",
      "Custom voice & language",
      "On-premise deployment",
      "Audit logs & compliance",
      "Custom integrations",
      "Training & onboarding",
    ],
  },
];

const faqs = [
  { q: "How does the 14-day free trial work?", a: "You get full access to all Professional features for 14 days — no credit card required. At the end, choose a plan or your account pauses automatically with no surprise charges." },
  { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade at any time. Changes take effect on your next billing cycle. Upgrades are prorated so you only pay the difference." },
  { q: "Which CRMs does VoiceQual support?", a: "We natively support Salesforce, HubSpot, Pipedrive, and Zoho. For other CRMs, use our webhook API or Zapier connector to push qualified leads anywhere." },
  { q: "Are there hidden per-call charges?", a: "No. All plans include a set number of leads with unlimited call retries per lead (within your retry limit). No hidden per-minute or per-call fees." },
  { q: "How is my data kept secure?", a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II certified and GDPR compliant, with data residency options for Enterprise." },
  { q: "What happens if I exceed my lead limit?", a: "We'll notify you at 80% and 100% usage. Overages are billed at your plan's per-lead rate. Enterprise plans have no limits and never throttle." },
];

const cx = "px-6 md:px-14 xl:px-24";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50/60 transition-colors">
        <span className="font-semibold text-gray-900 text-sm">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}>
            <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Pricing() {
  return (
    <div className="w-full min-h-screen text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#FAFBFD" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b"
        style={{ background: "rgba(255,255,255,0.9)", borderColor: "rgba(0,0,0,0.06)" }}>
        <div className={`w-full ${cx} h-16 flex items-center justify-between`}>
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: "#1F8A70" }}>
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-[15px] text-gray-900">VoiceQual</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <Link href="/features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="/pricing" className="font-semibold" style={{ color: "#1F8A70" }}>Pricing</Link>
            <Link href="/docs" className="hover:text-gray-900 transition-colors">Docs</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">Sign In</Link>
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="text-white text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-sm"
                style={{ backgroundColor: "#1F8A70" }}>
                Get Started
              </motion.div>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full pt-24 pb-16 text-center relative overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-5"
            style={{ backgroundColor: "#1F8A70" }} />
        </div>
        <div className={`w-full ${cx} relative`}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full mb-8"
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#475569" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            14-day free trial · No credit card required
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-5 leading-tight">
            Predictable pricing.{" "}
            <span style={{ color: "#D4AF37" }}>
              No surprises.
            </span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Every plan includes BANT qualification, full analytics, and CRM sync. No per-call fees, no hidden overages.
          </motion.p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="w-full pb-24">
        <div className={`w-full ${cx}`}>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <motion.div key={plan.name}
                initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative rounded-3xl overflow-hidden cursor-default"
                style={plan.popular ? {
                  backgroundColor: "#051212",
                  border: "1px solid rgba(31,138,112,0.4)",
                  boxShadow: "0 20px 80px rgba(31,138,112,0.15)",
                } : {
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                }}>

                {/* Popular: animated top border */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-px"
                    style={{ backgroundColor: "#D4AF37" }} />
                )}

                {/* Popular glow orbs */}
                {plan.popular && (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 pointer-events-none"
                      style={{ backgroundColor: "#D4AF37", transform: "translate(30%, -30%)" }} />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5 pointer-events-none"
                      style={{ backgroundColor: "#1F8A70", transform: "translate(-30%, 30%)" }} />
                  </>
                )}

                {plan.badge && (
                  <div className="absolute top-5 right-5">
                    <div className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={plan.popular ? {
                        backgroundColor: "#D4AF37",
                        color: "#051212",
                      } : {
                        backgroundColor: "#F1F5F9",
                        color: "#64748B",
                      }}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="p-8 relative">
                  {/* Plan icon */}
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5"
                    style={plan.popular ? {
                      background: "rgba(31,138,112,0.25)",
                      border: "1px solid rgba(31,138,112,0.4)",
                    } : {
                      background: `${plan.color}10`,
                      border: `1px solid ${plan.color}20`,
                    }}>
                    <plan.icon className="h-5 w-5" style={{ color: plan.popular ? "#E6C76E" : plan.color }} />
                  </div>

                  <h3 className="text-lg font-bold mb-1.5" style={{ color: plan.popular ? "white" : "#0F172A" }}>{plan.name}</h3>
                  <p className="text-sm leading-relaxed mb-8" style={{ color: plan.popular ? "rgba(255,255,255,0.45)" : "#94A3B8" }}>
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <span className="text-4xl font-extrabold tracking-tight" style={{ color: plan.popular ? "white" : "#0F172A" }}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm ml-1" style={{ color: plan.popular ? "rgba(255,255,255,0.35)" : "#94A3B8" }}>
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <Link href="/dashboard">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="w-full py-3 rounded-2xl text-sm font-bold text-center cursor-pointer mb-8 transition-all shadow-md"
                      style={plan.popular ? {
                        backgroundColor: "#1F8A70",
                        color: "white",
                      } : {
                        backgroundColor: "#F1F5F9",
                        color: "#0F172A",
                      }}>
                      {plan.cta}
                    </motion.div>
                  </Link>

                  <div className="h-px mb-6" style={{ background: plan.popular ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }} />

                  <div className="space-y-3">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-start gap-3 text-[13px]">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={plan.popular ? {
                             background: "rgba(31,138,112,0.25)",
                            border: "1px solid rgba(31,138,112,0.3)",
                          } : {
                            background: `${plan.color}12`,
                            border: `1px solid ${plan.color}20`,
                          }}>
                          <Check className="h-2.5 w-2.5" style={{ color: plan.popular ? "#E6C76E" : plan.color }} />
                        </div>
                        <span style={{ color: plan.popular ? "rgba(255,255,255,0.65)" : "#475569" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust indicators */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}
            className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            {[
              { icon: Shield, text: "SOC 2 Type II Certified" },
              { icon: Headphones, text: "24/7 Priority Support" },
              { icon: Zap, text: "99.99% Uptime SLA" },
              { icon: Lock, text: "AES-256 · TLS 1.3" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" style={{ color: "#1F8A70" }} />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-24 border-t" style={{ background: "#F8FAFF", borderColor: "rgba(0,0,0,0.04)" }}>
        <div className={`w-full ${cx}`}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Frequently asked questions</h2>
            <p className="text-gray-400 text-sm">Everything you need to know about VoiceQual pricing.</p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={faq.q} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <FaqItem q={faq.q} a={faq.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20 relative overflow-hidden"
        style={{ backgroundColor: "#051212" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-5"
            style={{ backgroundColor: "#1F8A70" }} />
        </div>
        <div className={`w-full ${cx} text-center relative`}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: "#D4AF37" }}>Start for free</div>
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to qualify leads{" "}
              <span style={{ color: "#D4AF37" }}>
                10× faster?
              </span>
            </h2>
            <p className="text-white/40 mb-10 text-base max-w-md mx-auto">No setup fees. No contracts. Start your free trial in 60 seconds.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-2xl cursor-pointer shadow-lg"
                  style={{ backgroundColor: "#1F8A70", color: "white" }}>
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </motion.div>
              </Link>
              <Link href="/docs">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-3.5 rounded-2xl cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  View Docs
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-white py-10" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
        <div className={`w-full ${cx} flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400`}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center shadow-sm"
              style={{ backgroundColor: "#1F8A70" }}>
              <Phone className="h-2.5 w-2.5 text-white" />
            </div>
            <span>© 2025 VoiceQual AI. All rights reserved.</span>
          </div>
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
