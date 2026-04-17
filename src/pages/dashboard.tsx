import { motion, AnimatePresence } from "framer-motion";
import { useGetAnalyticsOverview, useGetAnalyticsFunnel, useListLeads } from "@workspace/api-client-react";
import { Users, PhoneCall, ArrowRight, ArrowUpRight, Flame, Target, Clock, BarChart3, Crown, Gem, Award, PhoneOff, Mic, Volume2, Plus, Send, RefreshCw, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ─── 3D Tilt Card Hook ─────────────────────────────────────────────
function useTilt3D() {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || !innerRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    innerRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    // Shine position
    const shine = innerRef.current.querySelector('.tilt-shine') as HTMLElement;
    if (shine) {
      shine.style.setProperty('--shine-x', `${x}px`);
      shine.style.setProperty('--shine-y', `${y}px`);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (innerRef.current) {
      innerRef.current.style.transform = 'rotateX(0) rotateY(0) scale3d(1,1,1)';
    }
  }, []);

  return { ref, innerRef, handleMouseMove, handleMouseLeave };
}

// ─── Floating Particles Background ─────────────────────────────────
function FloatingParticles() {
  const particles = useMemo(() => (
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 60 + Math.random() * 40,
      size: 1.5 + Math.random() * 3,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      type: i % 3 === 0 ? 'gold' : i % 3 === 1 ? 'emerald' : 'diamond',
    }))
  ), []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className={`particle particle--${p.type}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── 3D Rotating Ornament Ring ─────────────────────────────────────
function OrnamentRing() {
  return (
    <div className="absolute -top-12 -right-12 w-48 h-48 pointer-events-none opacity-40">
      <div className="rotating-ring w-48 h-48" />
      <div className="rotating-ring w-36 h-36 absolute top-6 left-6" style={{ animationDirection: "reverse", animationDuration: "15s", borderColor: "rgba(31,138,112,0.12)" }} />
      <div className="rotating-ring w-24 h-24 absolute top-12 left-12" style={{ animationDuration: "25s", borderColor: "rgba(212,175,55,0.1)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(212,175,55,0.3)", boxShadow: "0 0 12px rgba(212,175,55,0.2)" }} />
    </div>
  );
}

// ─── Animated counter ──────────────────────────────────────────────
function AnimatedValue({ value, suffix = "" }: { value: number | string | undefined; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const prevRef = useRef(0);

  useEffect(() => {
    if (value === undefined) return;
    const numVal = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numVal)) { setDisplay(String(value)); return; }
    const start = prevRef.current;
    const diff = numVal - start;
    const duration = 900;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setDisplay(Number.isInteger(numVal) ? Math.round(current).toLocaleString() : current.toFixed(1));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    prevRef.current = numVal;
  }, [value]);

  return <span className="tabular-nums">{display}{suffix}</span>;
}

// ─── Mini sparkline with glow ──────────────────────────────────────
function Sparkline({ color, data }: { color: string; data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${26 - ((v - min) / range) * 24}`).join(" ");
  const fillD = `M 0,${26 - ((data[0] - min) / range) * 24} ${data.map((v, i) => `L ${(i / (data.length - 1)) * 100},${26 - ((v - min) / range) * 24}`).join(" ")} L100,26 L0,26 Z`;

  return (
    <svg viewBox="0 0 100 26" className="w-24 h-8" preserveAspectRatio="none">
      <defs>
        <filter id={`glow-${color.replace('#', '')}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={fillD} fill={color} fillOpacity="0.06" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#glow-${color.replace('#', '')})`} />
      <circle cx="100" cy={26 - ((data[data.length - 1] - min) / range) * 24} r="3" fill={color} opacity="0.8">
        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ─── 3D Tilt Stat Card ─────────────────────────────────────────────
function TiltStatCard({ card, val, delay }: { card: typeof cards[0]; val: string | number | undefined; delay: number }) {
  const { ref, innerRef, handleMouseMove, handleMouseLeave } = useTilt3D();

  return (
    <motion.div {...fadeUp(delay)}>
      <div ref={ref} className="tilt-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div ref={innerRef} className="tilt-card-inner stat-card relative p-5 cursor-default rounded-[20px] backdrop-blur-xl bg-white/40"
          style={{ background: card.bg, border: `1px solid ${card.border}` }}>
          <div className="tilt-shine rounded-[20px]" />

          {/* Decorative corner glow */}
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: card.color, opacity: 0.08, filter: "blur(20px)" }} />

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="text-[13px] font-medium text-muted-foreground">{card.label}</div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative"
              style={{
                backgroundColor: card.iconBg, border: `1px solid ${card.border}`,
                boxShadow: `0 4px 12px ${card.color}15`
              }}>
              <card.icon className="h-4 w-4" style={{ color: card.color }} />
              {/* Tiny floating diamond accent */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-sm rotate-45"
                style={{ backgroundColor: card.color, opacity: 0.2 }} />
            </div>
          </div>

          <div className="text-3xl font-bold tracking-tight text-foreground relative z-10">
            {val !== undefined ? (
              <AnimatedValue value={val} suffix={card.key === "conversionRate" ? "%" : ""} />
            ) : (
              <div className="h-8 w-20 shimmer rounded-lg" />
            )}
          </div>

          <div className="flex items-center justify-between mt-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg" style={{ backgroundColor: `${card.color}08`, border: `1px solid ${card.color}12` }}>
                <ArrowUpRight className="h-3 w-3" style={{ color: card.color }} />
                <span className="text-[11px] font-bold" style={{ color: card.color }}>{card.trend}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">vs last wk</span>
            </div>
            <Sparkline color={card.color} data={card.sparkData} />
          </div>

          {/* Gold accent line at bottom */}
          <div className="absolute bottom-0 left-4 right-4 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${card.color}20, transparent)` }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Animated donut with 3D feel ───────────────────────────────────
function BucketDonut({ hot = 0, warm = 0, cold = 0 }: { hot?: number; warm?: number; cold?: number }) {
  const total = hot + warm + cold || 1;
  const r = 38, cx = 48, cy = 48, circumference = 2 * Math.PI * r;
  const hotDash = (hot / total) * circumference;
  const warmDash = (warm / total) * circumference;
  const coldDash = (cold / total) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <div className="absolute w-[108px] h-[108px] rounded-full"
        style={{ border: "1px dashed rgba(212,175,55,0.12)" }} />
      <svg width="96" height="96" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="12" />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#1F8A70" strokeWidth="12"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${hotDash} ${circumference}` }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(31,138,112,0.3))" }} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#D4AF37" strokeWidth="12"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${warmDash} ${circumference}` }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          strokeDashoffset={-hotDash} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 4px rgba(212,175,55,0.3))" }} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#CBD5E1" strokeWidth="12"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${coldDash} ${circumference}` }}
          transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
          strokeDashoffset={-(hotDash + warmDash)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}
          className="text-xl font-bold leading-none tabular-nums">{total}</motion.div>
        <div className="text-[9px] text-muted-foreground mt-0.5 font-medium">total</div>
      </div>
    </div>
  );
}

// ─── Card config ───────────────────────────────────────────────────
const cards = [
  {
    key: "totalLeads", label: "Total Leads", icon: Users,
    color: "#0F3D3E", variant: "stat-card--teal",
    bg: "linear-gradient(135deg, rgba(15,61,62,0.06) 0%, rgba(15,61,62,0.01) 100%)", border: "rgba(15,61,62,0.15)",
    iconBg: "rgba(15,61,62,0.07)", trend: "+12%",
    sparkData: [18, 22, 19, 28, 25, 32, 30, 38, 35, 42],
  },
  {
    key: "callsInitiated", label: "Calls Made", icon: PhoneCall,
    color: "#D4AF37", variant: "stat-card--gold",
    bg: "linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.01) 100%)", border: "rgba(212,175,55,0.15)",
    iconBg: "rgba(212,175,55,0.07)", trend: "+8%",
    sparkData: [14, 16, 20, 18, 24, 22, 28, 26, 30, 34],
  },
  {
    key: "hotLeads", label: "Hot Leads", icon: Flame,
    color: "#1F8A70", variant: "stat-card--emerald",
    bg: "linear-gradient(135deg, rgba(31,138,112,0.06) 0%, rgba(31,138,112,0.01) 100%)", border: "rgba(31,138,112,0.15)",
    iconBg: "rgba(31,138,112,0.07)", trend: "+24%",
    sparkData: [8, 12, 10, 16, 14, 20, 22, 18, 26, 30],
  },
  {
    key: "conversionRate", label: "Conversion", icon: Target,
    color: "#A67C2E", variant: "stat-card--bronze",
    bg: "linear-gradient(135deg, rgba(166,124,46,0.06) 0%, rgba(166,124,46,0.01) 100%)", border: "rgba(166,124,46,0.15)",
    iconBg: "rgba(166,124,46,0.07)", trend: "+3.2 pts",
    sparkData: [28, 30, 29, 32, 31, 34, 33, 35, 34, 36],
  },
];

const bucketColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  HOT: { bg: "rgba(31,138,112,0.1)", text: "#1F8A70", border: "rgba(31,138,112,0.25)", dot: "#1F8A70" },
  WARM: { bg: "rgba(212,175,55,0.1)", text: "#A67C2E", border: "rgba(212,175,55,0.25)", dot: "#D4AF37" },
  COLD: { bg: "rgba(100,116,139,0.08)", text: "#64748B", border: "rgba(100,116,139,0.2)", dot: "#94A3B8" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: "rgba(31,138,112,0.08)", text: "#1F8A70" },
  CALLING: { bg: "rgba(212,175,55,0.08)", text: "#A67C2E" },
  FAILED: { bg: "rgba(239,68,68,0.08)", text: "#DC2626" },
  PENDING: { bg: "rgba(100,116,139,0.08)", text: "#64748B" },
  VM_LEFT: { bg: "rgba(166,124,46,0.08)", text: "#A67C2E" },
};

const funnelColors = ["#1F8A70", "#D4AF37", "#0F3D3E", "#E6C76E", "#A67C2E"];

// ─── Performance Gauge ─────────────────────────────────────────────
function PerformanceGauge({ score, hotLeads }: { score: number | string; hotLeads: number }) {
  const numericScore = typeof score === "string" ? parseFloat(score) : score;
  const rotation = (numericScore / 100) * 180 - 90;

  return (
    <div className="premium-card p-5 relative overflow-hidden h-full flex flex-col justify-center items-center">
      <div className="font-semibold text-xs text-muted-foreground absolute top-4 left-5 uppercase tracking-wider">Conversion Engine</div>
      <div className="relative w-48 h-24 mt-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-emerald-500/10" />
        <motion.div
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-emerald-500 border-b-transparent border-l-transparent"
          style={{ clipPath: "polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%)", rotate: "45deg" }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="text-3xl font-bold tabular-nums text-foreground">{numericScore.toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Efficiency</div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 w-full justify-center border-t border-border/40 pt-4">
        <div className="text-center">
          <div className="text-xs font-bold text-emerald-600">{hotLeads}</div>
          <div className="text-[9px] text-muted-foreground">High Intent</div>
        </div>
        <div className="w-px h-6 bg-border/60" />
        <div className="text-center">
          <div className="text-xs font-bold text-gold-600" style={{ color: "#D4AF37" }}>Low</div>
          <div className="text-[9px] text-muted-foreground">Drop-off</div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Actions ─────────────────────────────────────────────────
function QuickActions() {
  const actions = [
    { icon: Plus, label: "Add Lead", color: "#1F8A70", bg: "rgba(31,138,112,0.08)" },
    { icon: Send, label: "Export", color: "#D4AF37", bg: "rgba(212,175,55,0.08)" },
    { icon: RefreshCw, label: "Sync CRM", color: "#0F3D3E", bg: "rgba(15,61,62,0.08)" },
    { icon: Zap, label: "Run Batch", color: "#A67C2E", bg: "rgba(166,124,46,0.08)" },
  ];

  return (
    <div className="premium-card p-5 h-full">
      <div className="font-semibold text-sm mb-4 flex items-center gap-2 text-foreground">
        <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" style={{ backgroundColor: "#D4AF37" }} />
        Quick Toolkit
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((act, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all border border-border/40 depth-shadow-sm hover:shadow-md group relative overflow-hidden"
            style={{ backgroundColor: "white" }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${act.color}05 0%, transparent 70%)` }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:rotate-12"
              style={{ backgroundColor: act.bg, border: `1px solid ${act.color}15` }}>
              <act.icon className="w-5 h-5" style={{ color: act.color }} />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">{act.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Live Call Simulator ───────────────────────────────────────────
function LiveCallSimulator() {
  const [isCalling, setIsCalling] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!isCalling) return;
    const interval = setInterval(() => setPulse(p => (p + 1) % 4), 600);
    return () => clearInterval(interval);
  }, [isCalling]);

  return (
    <div className="premium-card p-6 relative overflow-hidden h-full flex flex-col justify-center">
      <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full opacity-[0.03] pointer-events-none" style={{ backgroundColor: "#D4AF37" }} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative z-10"
              style={{ background: isCalling ? "#1F8A70" : "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}>
              <PhoneCall className={`w-6 h-6 ${isCalling ? "text-white animate-bounce" : "text-muted-foreground/40"}`} />
            </div>
            {isCalling && [1, 2, 3].map(i => (
              <div key={i} className="absolute inset-0 rounded-2xl animate-ping"
                style={{ backgroundColor: "#1F8A70", opacity: 0.2, animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{isCalling ? "Active Intelligence" : "Sarvam Engine"}</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isCalling ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
              {isCalling ? "Synthesizing Response" : "Ready for deployment"}
            </div>
          </div>
        </div>
        <motion.button
          onClick={() => setIsCalling(!isCalling)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all"
          style={{
            background: isCalling ? "#0F3D3E" : "#1F8A70",
            boxShadow: isCalling ? "0 4px 12px rgba(15,61,62,0.3)" : "0 4px 12px rgba(31,138,112,0.3)"
          }}>
          {isCalling ? "Terminate" : "Simulate Call"}
        </motion.button>
      </div>

      <div className="relative h-16 bg-black/5 rounded-2xl flex items-center justify-center gap-1 px-4 overflow-hidden border border-black/5">
        {!isCalling ? (
          <div className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-[0.2em]">Standing by...</div>
        ) : (
          [...Array(32)].map((_, i) => {
            const h = 15 + Math.random() * 35;
            return (
              <motion.div
                key={i}
                animate={{ height: [h, h * 0.4, h * 1.2, h] }}
                transition={{ duration: 0.6 + Math.random() * 0.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 rounded-full"
                style={{ backgroundColor: i % 2 === 0 ? "#1F8A70" : "#D4AF37", opacity: 0.5 + Math.random() * 0.5 }}
              />
            );
          })
        )}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <Mic className="w-3 h-3" />
          Neural Latency: <span className="text-foreground font-mono">240ms</span>
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-gold-500" style={{ color: "#D4AF37" }} />
          Confidence: <span className="text-foreground font-bold">98.2%</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: overview, isLoading: isLoadingOverview } = useGetAnalyticsOverview();
  const { data: funnel, isLoading: isLoadingFunnel } = useGetAnalyticsFunnel();
  const { data: recentLeads, isLoading: isLoadingLeads } = useListLeads({ page: 1, pageSize: 7 });

  return (
    <div className="space-y-6 relative">
      {/* Floating particles */}
      <FloatingParticles />

      {/* Ambient background orbs */}
      <div className="ambient-orb w-[300px] h-[300px] -top-20 -right-20 z-0" style={{ backgroundColor: "rgba(31,138,112,0.04)" }} />
      <div className="ambient-orb w-[200px] h-[200px] top-60 -left-10 z-0" style={{ backgroundColor: "rgba(212,175,55,0.03)", animationDelay: "3s" }} />

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-sm">Real-time lead qualification performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-xl bg-white/80 border border-border depth-shadow-sm backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5" />
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-xl bg-white/80 border border-border depth-shadow-sm backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#1F8A70", boxShadow: "0 0 8px rgba(31,138,112,0.5)" }} />
            Live
          </div>
        </div>
      </motion.div>

      {/* Royal ornament divider */}
      <motion.div {...fadeUp(0.05)} className="ornament-line text-[10px] font-medium tracking-widest uppercase relative z-10"
        style={{ color: "rgba(212,175,55,0.35)" }}>
        <Gem className="w-3 h-3" style={{ color: "rgba(212,175,55,0.3)" }} />
      </motion.div>

      {/* 3D Tilt Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 relative z-10">
        {cards.map((card, i) => {
          let val: string | number | undefined;
          if (card.key === "conversionRate") {
            val = isLoadingOverview ? undefined : `${(overview?.conversionRate ?? 0).toFixed(1)}`;
          } else {
            val = (overview as any)?.[card.key];
          }

          return <TiltStatCard key={card.key} card={card} val={val} delay={0.08 + i * 0.06} />;
        })}
      </div>

      {/* ── Interactive Row: Live Call Simulator + Quick Actions ── */}
      <div className="grid gap-5 lg:grid-cols-5 relative z-10">
        <motion.div {...fadeUp(0.25)} className="lg:col-span-3">
          <LiveCallSimulator />
        </motion.div>
        <motion.div {...fadeUp(0.3)} className="lg:col-span-2">
          <QuickActions />
        </motion.div>
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3 relative z-10">
        {/* Recent Activity */}
        <motion.div {...fadeUp(0.35)} className="lg:col-span-2 premium-card relative">
          {/* Decorative rotating rings */}
          <OrnamentRing />

          <div className="flex items-center justify-between px-6 py-4 border-b border-border relative z-10">
            <div>
              <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(31,138,112,0.08)" }}>
                  <BarChart3 className="w-3.5 h-3.5" style={{ color: "#1F8A70" }} />
                </div>
                Recent Activity
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Latest leads through the pipeline</div>
            </div>
            <Link href="/leads">
              <motion.div whileHover={{ x: 3, scale: 1.02 }}
                className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer px-3 py-1.5 rounded-lg transition-all depth-shadow-sm"
                style={{ color: "#1F8A70", backgroundColor: "rgba(31,138,112,0.06)", border: "1px solid rgba(31,138,112,0.12)" }}>
                View all <ArrowRight className="h-3 w-3" />
              </motion.div>
            </Link>
          </div>
          <div className="relative z-10">
            {isLoadingLeads ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full shimmer" />
                    <div className="space-y-2">
                      <div className="h-3.5 w-32 shimmer rounded" />
                      <div className="h-2.5 w-24 shimmer rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 shimmer rounded-full" />
                </div>
              ))
            ) : recentLeads?.leads?.map((lead, i) => {
              const bc = bucketColors[lead.bucket ?? ""] ?? bucketColors.COLD;
              const sc = statusColors[lead.status] ?? statusColors.PENDING;
              return (
                <motion.div key={lead.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(0.1 + i * 0.05, 0.35) }}
                  className="activity-row flex items-center justify-between px-6 py-3.5 group cursor-pointer border-b border-border/20 last:border-0">
                  <Link href={`/leads/${lead.id}`} className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 transition-all group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        backgroundColor: "#1F8A70", border: "1.5px solid rgba(212,175,55,0.3)",
                        boxShadow: "0 2px 8px rgba(31,138,112,0.2)"
                      }}>
                      {(lead.name || "??").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {lead.name || "Unknown Lead"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono">{lead.phone}</span>
                        {lead.score !== null && lead.score !== undefined && (
                          <>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-[10px] font-bold tabular-nums" style={{ color: (lead.score ?? 0) >= 7 ? "#1F8A70" : (lead.score ?? 0) >= 4 ? "#D4AF37" : "#94A3B8" }}>
                              {(lead.score ?? 0).toFixed(1)}/10
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {lead.bucket && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all group-hover:scale-105"
                        style={{ backgroundColor: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: bc.dot }} />
                        {lead.bucket}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: sc.bg, color: sc.text }}>
                      {lead.status}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Interactive Performance Gauge */}
          <motion.div {...fadeUp(0.4)}>
            <PerformanceGauge score={overview?.conversionRate ?? 0} hotLeads={overview?.hotLeads ?? 0} />
          </motion.div>

          {/* Bucket distribution */}
          <motion.div {...fadeUp(0.45)} className="premium-card">
            <div className="px-5 py-4 border-b border-border">
              <div className="font-semibold text-sm flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "#1F8A70" }} />
                Lead Distribution
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Current bucket breakdown</div>
            </div>
            <div className="p-5 flex items-center gap-5">
              <BucketDonut
                hot={overview?.hotLeads ?? 0}
                warm={overview?.warmLeads ?? 0}
                cold={overview?.coldLeads ?? 0}
              />
              <div className="space-y-3 flex-1">
                {[
                  { label: "Hot", value: overview?.hotLeads ?? 0, color: "#1F8A70", pct: Math.round(((overview?.hotLeads ?? 0) / ((overview?.hotLeads ?? 0) + (overview?.warmLeads ?? 0) + (overview?.coldLeads ?? 0) || 1)) * 100) },
                  { label: "Warm", value: overview?.warmLeads ?? 0, color: "#D4AF37", pct: Math.round(((overview?.warmLeads ?? 0) / ((overview?.hotLeads ?? 0) + (overview?.warmLeads ?? 0) + (overview?.coldLeads ?? 0) || 1)) * 100) },
                  { label: "Cold", value: overview?.coldLeads ?? 0, color: "#CBD5E1", pct: Math.round(((overview?.coldLeads ?? 0) / ((overview?.hotLeads ?? 0) + (overview?.warmLeads ?? 0) + (overview?.coldLeads ?? 0) || 1)) * 100) },
                ].map(b => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color, boxShadow: `0 0 6px ${b.color}40` }} />
                        <span className="text-xs font-medium text-muted-foreground">{b.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tabular-nums" style={{ color: b.color }}>{b.value}</span>
                        <span className="text-[10px] text-muted-foreground font-mono w-7 text-right">{b.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${b.color}10` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: b.color, boxShadow: `0 0 8px ${b.color}30` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Funnel */}
          <motion.div {...fadeUp(0.5)} className="premium-card">
            <div className="px-5 py-4 border-b border-border">
              <div className="font-semibold text-sm flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "#D4AF37" }} />
                Funnel Overview
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Stage-by-stage conversion</div>
            </div>
            <div className="px-5 py-4 space-y-4">
              {isLoadingFunnel ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-full shimmer rounded" />
                    <div className="h-3 w-full shimmer rounded-full" />
                  </div>
                ))
              ) : funnel?.stages?.map((stage, idx) => {
                const color = funnelColors[idx % funnelColors.length];
                return (
                  <div key={idx} className="group cursor-default">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{stage.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground tabular-nums">{stage.count}</span>
                        <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">{stage.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: `${color}10` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.percentage}%` }}
                        transition={{ duration: 1.2, delay: 0.5 + idx * 0.12, ease: "easeOut" }}
                        className="h-full rounded-full transition-all group-hover:brightness-110"
                        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}25` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
