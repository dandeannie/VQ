import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Activity, Volume2, BarChart2, Waves, Brain, TrendingUp, Clock } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function WaveformVisualizer() {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 60 }, () => 20 + Math.random() * 80));

  useEffect(() => {
    let visible = true;
    const onVis = () => { visible = document.visibilityState === "visible"; };
    document.addEventListener("visibilitychange", onVis);

    const interval = setInterval(() => {
      if (!visible) return;
      setBars(prev => prev.map((v) => {
        const target = 15 + Math.random() * 85;
        return v + (target - v) * 0.3;
      }));
    }, 250);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  return (
    <div className="flex items-end gap-[2px] h-24 w-full">
      {bars.map((h, i) => (
        <motion.div key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${h}%`,
            backgroundColor: "#1F8A70",
            opacity: 0.1 + (h / 100) * 0.9,
          }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.15 }}
        />
      ))}
    </div>
  );
}

function SentimentTimeline() {
  const segments = Array.from({ length: 40 }, (_, i) => ({
    time: i * 5,
    sentiment: Math.sin(i * 0.4) * 0.5 + 0.5 + Math.random() * 0.2 - 0.1,
    label: i === 8 ? "Budget discussed" : i === 18 ? "Authority confirmed" : i === 28 ? "Need identified" : i === 35 ? "Timeline agreed" : null,
  }));

  return (
    <div className="relative h-32 w-full">
      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d={`M 0 ${120 - segments[0].sentiment * 100} ${segments.map((s, i) => `L ${(i / (segments.length - 1)) * 400} ${120 - s.sentiment * 100}`).join(" ")} L 400 120 L 0 120 Z`}
          fill="rgba(31,138,112,0.1)" />
        <path d={`M 0 ${120 - segments[0].sentiment * 100} ${segments.map((s, i) => `L ${(i / (segments.length - 1)) * 400} ${120 - s.sentiment * 100}`).join(" ")}`}
          fill="none" stroke="#1F8A70" strokeWidth="2" />
      </svg>
      {segments.filter(s => s.label).map((s, i) => (
        <div key={i} className="absolute top-0" style={{ left: `${(segments.indexOf(s) / (segments.length - 1)) * 100}%`, transform: "translateX(-50%)" }}>
           <div className="w-px h-full absolute left-1/2" style={{ backgroundColor: 'rgba(31,138,112,0.2)' }} />
          <div className="text-[9px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap" style={{ backgroundColor: 'rgba(31,138,112,0.06)', border: '1px solid rgba(31,138,112,0.2)', color: '#0F3D3E' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AudioAnalysis() {
  const metrics = [
     { icon: Volume2, label: "Avg. Call Volume", value: "72 dB", trend: "+3%",
      color: "#0F3D3E", bg: "rgba(15,61,62,0.04)", border: "rgba(15,61,62,0.1)", glowClass: "card-glow-blue" },
    { icon: Clock, label: "Avg. Duration", value: "3m 42s", trend: "+12%",
      color: "#D4AF37", bg: "rgba(212,175,55,0.04)", border: "rgba(212,175,55,0.1)", glowClass: "card-glow-gold" },
    { icon: Brain, label: "Sentiment Score", value: "7.4/10", trend: "+0.8",
      color: "#1F8A70", bg: "rgba(31,138,112,0.04)", border: "rgba(31,138,112,0.1)", glowClass: "card-glow-emerald" },
    { icon: TrendingUp, label: "Engagement Rate", value: "84%", trend: "+5%",
      color: "#A67C2E", bg: "rgba(166,124,46,0.04)", border: "rgba(166,124,46,0.1)", glowClass: "card-glow-amber" },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-bold tracking-tight">Audio Analysis</h1>
        <p className="text-muted-foreground text-sm mt-1">Voice intent patterns, sentiment mapping, and acoustic insights.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} {...fadeUp(0.05 + i * 0.05)}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl p-5 cursor-default ${m.glowClass} transition-all duration-300`}
            style={{ background: m.bg, border: `1px solid ${m.border}` }}>
            <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full"
              style={{ backgroundColor: `${m.color}15` }} />
            <div className="flex items-start justify-between mb-4 relative">
              <div className="text-sm font-medium text-muted-foreground">{m.label}</div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${m.color}18`, border: `1px solid ${m.border}` }}>
                <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-foreground relative">{m.value}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[11px] font-bold" style={{ color: m.color }}>{m.trend}</span>
              <span className="text-[11px] text-muted-foreground">vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div {...fadeUp(0.3)} className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                <Waves className="w-4 h-4" style={{ color: '#1F8A70' }} /> Live Waveform Preview
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Real-time audio pattern visualization</div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
            </div>
          </div>
          <div className="p-6">
            <WaveformVisualizer />
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.35)} className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-border">
            <div className="font-semibold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: '#D4AF37' }} /> Sentiment Timeline
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Buyer engagement during a sample call</div>
          </div>
          <div className="p-6">
            <SentimentTimeline />
          </div>
        </motion.div>
      </div>

      <motion.div {...fadeUp(0.4)} className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
        <div className="px-6 py-4 border-b border-border">
          <div className="font-semibold text-sm flex items-center gap-2">
             <Mic className="w-4 h-4" style={{ color: '#0F3D3E' }} /> Keyword Detection
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Most frequently detected qualification signals across all calls</div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {[
              { word: "budget approved", count: 342, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { word: "decision maker", count: 287, color: "bg-amber-50 text-amber-700 border-amber-200" },
              { word: "timeline Q2", count: 234, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { word: "urgent need", count: 198, color: "bg-amber-50 text-amber-700 border-amber-200" },
              { word: "board approval", count: 156, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { word: "comparing vendors", count: 143, color: "bg-amber-50 text-amber-700 border-amber-200" },
              { word: "implementation", count: 128, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { word: "pricing inquiry", count: 112, color: "bg-amber-50 text-amber-700 border-amber-200" },
              { word: "ROI expected", count: 98, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { word: "team size", count: 87, color: "bg-amber-50 text-amber-700 border-amber-200" },
              { word: "contract terms", count: 76, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { word: "integration needs", count: 65, color: "bg-amber-50 text-amber-700 border-amber-200" },
            ].map((kw, i) => (
              <motion.div key={kw.word}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium cursor-default ${kw.color}`}>
                {kw.word}
                <span className="text-[10px] opacity-70 font-mono">{kw.count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
