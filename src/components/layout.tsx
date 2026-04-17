import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Activity, Mic, Zap, Settings2,
  HelpCircle, LogOut, Phone, Bell, ChevronRight, Search, Sparkles, Menu, X
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "#1F8A70", glow: "rgba(31,138,112,0.3)" },
  { href: "/leads", label: "Lead Intelligence", icon: Activity, color: "#D4AF37", glow: "rgba(212,175,55,0.3)" },
  { href: "/audio", label: "Audio Analysis", icon: Mic, color: "#1F8A70", glow: "rgba(31,138,112,0.3)" },
  { href: "/bant", label: "BANT Insights", icon: Zap, color: "#E6C76E", glow: "rgba(230,199,110,0.3)" },
  { href: "/config", label: "Team Settings", icon: Settings2, color: "#D4AF37", glow: "rgba(212,175,55,0.3)" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mouse-tracking glow for premium cards
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>('.premium-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    };
    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, []);

  const currentPage = navItems.find(n => location.startsWith(n.href))?.label ?? "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F5F5F5" }}>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`w-[260px] flex flex-col shrink-0 absolute inset-y-0 left-0 z-50 md:relative transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`} style={{
        backgroundColor: "#051212",
        borderRight: "1px solid rgba(212,175,55,0.08)",
      }}>
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ backgroundColor: "rgba(212,175,55,0.3)" }} />

        {/* Ambient sidebar glow */}
        <div className="absolute top-0 left-0 w-full h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(31,138,112,0.08) 0%, transparent 70%)" }} />

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 relative z-10 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative shadow-lg"
                style={{
                  backgroundColor: "#1F8A70",
                  border: "1.5px solid rgba(212,175,55,0.5)",
                  boxShadow: "0 4px 16px rgba(31,138,112,0.3), 0 0 0 1px rgba(31,138,112,0.2)",
                }}>
                <Phone className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <div className="text-[15px] font-bold text-white leading-none tracking-tight">VoiceQual</div>
                <div className="text-[10px] mt-1 font-semibold tracking-wider uppercase" style={{ color: "rgba(212,175,55,0.5)" }}>AI Platform</div>
              </div>
            </div>
          </Link>
          <button className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/50" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 mb-4 relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-[12px] font-medium text-white/60 placeholder:text-white/20 outline-none transition-all focus:ring-1 focus:ring-emerald-500/30"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}>⌘K</div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px mb-2" style={{ backgroundColor: "rgba(255,255,255,0.04)" }} />

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5 relative z-10">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] px-3 mb-3"
            style={{ color: "rgba(212,175,55,0.25)" }}>Navigation</div>

          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/dashboard") || (location === "/" && item.href === "/dashboard");
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="sidebar-item relative"
                  style={isActive ? {
                    backgroundColor: "rgba(31,138,112,0.12)",
                    border: `1px solid rgba(31,138,112,0.25)`,
                    color: "white",
                    boxShadow: `0 4px 16px rgba(31,138,112,0.12)`,
                  } : {
                    color: "rgba(255,255,255,0.42)",
                    border: "1px solid transparent",
                  }}>

                  {isActive && (
                    <motion.div layoutId="activeBar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.glow}` }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                    style={isActive ? {
                      backgroundColor: `${item.color}20`,
                      border: `1px solid ${item.color}35`,
                      boxShadow: `0 0 14px ${item.glow}`,
                    } : {
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                    <item.icon className="h-3.5 w-3.5" style={{ color: isActive ? item.color : "rgba(255,255,255,0.3)" }} />
                  </div>

                  <span className={isActive ? "font-semibold" : ""}>{item.label}</span>

                  {isActive && (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="ml-auto w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Release note card */}
        <div className="mx-3 mb-3 rounded-xl p-3.5 relative overflow-hidden"
          style={{ background: "rgba(31,138,112,0.06)", border: "1px solid rgba(31,138,112,0.12)" }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
            style={{ backgroundColor: "#1F8A70" }} />
          <div className="flex items-start gap-2.5 relative z-10">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(31,138,112,0.9)" }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>v2.0 Scoring Update</div>
              <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.32)" }}>BANT accuracy improved +40%</div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-1 border-t relative z-10" style={{ borderColor: "rgba(255,255,255,0.04)", paddingTop: "12px" }}>
          {[
            { icon: HelpCircle, label: "Help Center" },
            { icon: LogOut, label: "Log Out" },
          ].map(item => (
            <motion.button key={item.label} whileHover={{ x: 2 }}
              className="sidebar-item w-full text-left"
              style={{ color: "rgba(255,255,255,0.3)", border: "1px solid transparent" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <item.icon className="h-3.5 w-3.5" />
              </div>
              {item.label}
            </motion.button>
          ))}

          {/* User profile */}
          <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl cursor-pointer transition-all hover:bg-white/[0.03]"
            style={{ border: "1px solid rgba(212,175,55,0.1)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-md"
              style={{ backgroundColor: "#1F8A70", border: "1.5px solid rgba(212,175,55,0.5)", boxShadow: "0 2px 10px rgba(31,138,112,0.25)" }}>
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white/80 truncate">Admin User</div>
              <div className="text-[10px] text-white/25 truncate">admin@voicequal.ai</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" style={{ boxShadow: "0 0 8px rgba(52,211,153,0.6)" }} />
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar — glass effect */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-7 shrink-0 relative z-20 backdrop-blur-xl bg-white/70 border-b border-border/50">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted/50 text-muted-foreground mr-1">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full hidden sm:block" style={{ backgroundColor: "#1F8A70" }} />
              <span className="text-sm font-semibold text-foreground truncate">{currentPage}</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="text-xs text-muted-foreground font-medium hidden sm:block">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-muted/50"
              style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#D4AF37", boxShadow: "0 0 6px rgba(212,175,55,0.5)" }} />
            </motion.button>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
              style={{
                color: "#1F8A70",
                backgroundColor: "rgba(31,138,112,0.06)",
                border: "1px solid rgba(31,138,112,0.15)",
              }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#1F8A70", boxShadow: "0 0 6px rgba(31,138,112,0.5)" }} />
              System Live
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-md cursor-pointer"
              style={{ backgroundColor: "#1F8A70", border: "1.5px solid rgba(212,175,55,0.4)", boxShadow: "0 2px 10px rgba(31,138,112,0.2)" }}>
              AD
            </div>
          </div>
        </header>

        {/* Content area */}
        <div ref={contentRef} className="flex-1 overflow-auto admin-bg">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="p-4 sm:p-7 min-h-full">
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
