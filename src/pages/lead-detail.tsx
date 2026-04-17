import { useParams } from "wouter";
import { motion } from "framer-motion";
import { useGetLead, useRetryLead, getGetLeadQueryKey, useGetCall } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { PhoneForwarded, Loader2, PlayCircle, Clock, Info, ArrowLeft, Globe, RefreshCw, Database } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const bucketConfig: Record<string, { bg: string; text: string; border: string }> = {
  HOT: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  WARM: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  COLD: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
};

const bantColors = ["#1F8A70", "#D4AF37", "#0F3D3E", "#E6C76E"];

function CallDetailDialog({ callId, open, onOpenChange }: { callId: number | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: call, isLoading } = useGetCall(callId || 0, { query: { enabled: !!callId && open, queryKey: ['call', callId] } });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Call Details</DialogTitle></DialogHeader>
        {isLoading ? (
          <div className="h-40 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : call ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline">{call.status}</Badge></div>
              <div><span className="text-muted-foreground">Duration:</span> {call.duration || 0}s</div>
              <div><span className="text-muted-foreground">Started:</span> {call.startedAt ? new Date(call.startedAt).toLocaleString() : "-"}</div>
              <div><span className="text-muted-foreground">External ID:</span> <span className="font-mono text-xs">{call.externalId || "-"}</span></div>
            </div>
            {call.recordingUrl && (
              <div className="pt-2 border-t"><p className="text-sm font-medium mb-2">Recording</p><audio controls className="w-full h-10" src={call.recordingUrl} /></div>
            )}
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">Transcript</p>
              <ScrollArea className="h-60 rounded-xl border bg-muted/30 p-4">
                {call.transcript ? <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{call.transcript}</div> : <p className="text-muted-foreground italic">No transcript available.</p>}
              </ScrollArea>
            </div>
          </div>
        ) : <div className="text-destructive">Failed to load call details.</div>}
      </DialogContent>
    </Dialog>
  );
}

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const leadId = Number(id);
  const { data: lead, isLoading } = useGetLead(leadId, { query: { enabled: !!id, queryKey: getGetLeadQueryKey(leadId) } });
  const retryLead = useRetryLead();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);

  const handleRetry = () => {
    retryLead.mutate({ id: leadId }, {
      onSuccess: () => { toast({ title: "Retry initiated", description: "A new call has been scheduled." }); queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(leadId) }); },
      onError: () => { toast({ title: "Failed to retry", variant: "destructive" }); },
    });
  };

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!lead) return (
    <div className="p-12 text-center border border-dashed rounded-2xl bg-card">
      <h2 className="text-xl font-bold mb-2">Lead Not Found</h2>
      <p className="text-muted-foreground">The lead you are looking for does not exist or has been removed.</p>
    </div>
  );

  const bc = bucketConfig[lead.bucket ?? ""] ?? bucketConfig.COLD;

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-3 h-3" /> Back to leads
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-md"
              style={{ backgroundColor: "#1F8A70", border: "1px solid #D4AF37" }}>
              {(lead.name || "??").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{lead.name || "Unknown Lead"}</h1>
                {lead.bucket && (
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${bc.bg} ${bc.text} ${bc.border}`}>{lead.bucket}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-muted-foreground text-xs font-mono">
                <span>{lead.phone}</span><span>·</span><span>{lead.source}</span><span>·</span>
                <span>Created {new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground">{lead.status}</span>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={handleRetry} disabled={retryLead.isPending || lead.status === "CALLING"} variant="secondary" size="sm" className="gap-2">
                {retryLead.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PhoneForwarded className="h-3.5 w-3.5" />}
                Retry Call
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* BANT */}
        <motion.div {...fadeUp(0.1)} className="md:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="font-semibold text-sm">BANT Qualification</div>
            {lead.score !== null && (
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold" style={{ color: "#1F8A70" }}>
                  {(lead.score ?? 0).toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
            )}
          </div>
          <div className="p-6">
            {lead.bant ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { key: "budget", label: "Budget", val: lead.bant.budget },
                  { key: "authority", label: "Authority", val: lead.bant.authority },
                  { key: "need", label: "Need", val: lead.bant.need },
                  { key: "timeline", label: "Timeline", val: lead.bant.timeline },
                ].map((item, idx) => (
                  <div key={item.key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">{item.label}</span>
                      <span className="font-mono font-bold">{item.val}/3</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${((item.val || 0) / 3) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: bantColors[idx], boxShadow: `0 0 8px ${bantColors[idx]}40` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <Info className="h-8 w-8 mb-2 opacity-50" />
                <p className="font-medium">No BANT data yet</p>
                <p className="text-sm mt-1">Scores will appear here after a successful call.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-5">
          <motion.div {...fadeUp(0.15)} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <div className="font-semibold text-sm">System Metadata</div>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              {[
                { icon: Globe, label: "Language", value: lead.language || "Unknown" },
                { icon: RefreshCw, label: "Retry Count", value: String(lead.retryCount || 0) },
                { icon: Database, label: "CRM Sync", value: lead.crmPushed ? "PUSHED" : "PENDING", badge: true },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      lead.crmPushed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground border-border"
                    }`}>{item.value}</span>
                  ) : <span className="font-mono font-medium">{item.value}</span>}
                </div>
              ))}
              {lead.crmPushedAt && (
                <div className="flex justify-between py-1.5 text-xs">
                  <span className="text-muted-foreground">Sync Time</span>
                  <span className="font-mono">{new Date(lead.crmPushedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="font-semibold text-sm">Call Activity</div>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-full">{lead.calls.length}</span>
            </div>
            <div className="px-4 py-3">
              {lead.calls.length === 0 ? (
                <p className="text-sm text-muted-foreground italic px-2 py-4 text-center">No calls initiated.</p>
              ) : (
                <div className="space-y-2">
                  {lead.calls.map((call, i) => (
                    <motion.div key={call.id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      onClick={() => setSelectedCallId(call.id)}
                      className="border border-border rounded-xl p-3 hover:bg-muted/30 cursor-pointer transition-colors group">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          call.status === "COMPLETED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          call.status === "FAILED" ? "bg-red-50 text-red-600 border-red-200" :
                          "bg-muted text-muted-foreground border-border"
                        }`}>{call.status}</span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(call.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>{call.duration ? `${call.duration}s` : "—"}</span>
                        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-3 h-3" /> View
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <CallDetailDialog callId={selectedCallId} open={selectedCallId !== null} onOpenChange={(open) => !open && setSelectedCallId(null)} />
    </div>
  );
}
