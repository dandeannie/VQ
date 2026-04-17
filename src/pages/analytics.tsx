import { useState } from "react";
import { motion } from "framer-motion";
import { useGetAnalyticsFunnel, useGetAnalyticsDaily, useGetAnalyticsSources } from "@workspace/api-client-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const COLORS = ["#1F8A70", "#D4AF37", "#0F3D3E", "#E6C76E", "#A67C2E"];

export default function Analytics() {
  const [days, setDays] = useState("30");
  const { data: funnel, isLoading: isLoadingFunnel } = useGetAnalyticsFunnel();
  const { data: daily, isLoading: isLoadingDaily } = useGetAnalyticsDaily({ days: Number(days) });
  const { data: sources, isLoading: isLoadingSources } = useGetAnalyticsSources();

  return (
    <div className="space-y-7">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">BANT Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">Deep dive into funnel metrics and call volume.</p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Timeframe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2">
        <motion.div {...fadeUp(0.1)} className="md:col-span-2 bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-border">
            <div className="font-semibold text-sm">Daily Call Volume & Leads</div>
            <div className="text-xs text-muted-foreground mt-0.5">Trend over the selected period</div>
          </div>
          <div className="p-6">
            {isLoadingDaily ? (
              <div className="h-[300px] flex items-center justify-center"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : daily && daily.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="leadsCreated" stroke="#1F8A70" fill="#1F8A70" fillOpacity={0.1} strokeWidth={2} name="Leads Created" />
                    <Area type="monotone" dataKey="callsCompleted" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.1} strokeWidth={2} name="Calls Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No data for this period</div>
            )}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-border">
            <div className="font-semibold text-sm">Funnel Conversion</div>
            <div className="text-xs text-muted-foreground mt-0.5">Stage-by-stage drop-off</div>
          </div>
          <div className="px-6 py-5">
            {isLoadingFunnel ? (
              <div className="h-[280px] flex items-center justify-center"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : funnel?.stages ? (
              <div className="space-y-5">
                {funnel.stages.map((stage, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-muted-foreground">{stage.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono">{stage.count}</span>
                        <span className="text-xs text-muted-foreground w-10 text-right">{stage.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${COLORS[idx % COLORS.length]}14` }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${stage.percentage}%` }}
                        transition={{ duration: 1.1, delay: 0.3 + idx * 0.15, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: COLORS[idx % COLORS.length],
                          boxShadow: `0 0 10px ${COLORS[idx % COLORS.length]}30`
                        }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No funnel data</div>
            )}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.3)} className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-4 border-b border-border">
            <div className="font-semibold text-sm">Lead Sources</div>
            <div className="text-xs text-muted-foreground mt-0.5">Where your leads come from</div>
          </div>
          <div className="p-6">
            {isLoadingSources ? (
              <div className="h-[280px] flex items-center justify-center"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : sources && sources.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="h-[220px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sources} dataKey="count" nameKey="source" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                        {sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 shrink-0">
                  {sources.map((s, i) => (
                    <div key={s.source} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{s.source}</span>
                      <span className="font-mono font-bold ml-1">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">No source data</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
