import { motion } from "framer-motion";
import { useGetConfig, useUpdateConfig, getGetConfigQueryKey, useCallWebhook } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Send, Clock, Zap, Webhook, Shield, Mic, Volume2, Languages, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const card = {
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.07)",
  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
};

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl overflow-hidden ${className}`} style={card}>
    {children}
  </div>
);

const SectionHeader = ({
  icon: Icon, iconColor, title, subtitle,
}: { icon: React.ElementType; iconColor: string; title: string; subtitle: string }) => (
  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: `${iconColor}14` }}>
      <Icon className="w-4 h-4" style={{ color: iconColor }} />
    </div>
    <div>
      <div className="font-semibold text-sm text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
    </div>
  </div>
);

function SarvamStatusBadge({ configured }: { configured: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${configured ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
      {configured
        ? <><CheckCircle2 className="w-3 h-3" /> Connected</>
        : <><AlertCircle className="w-3 h-3" /> API Key Required</>
      }
    </div>
  );
}

const SARVAM_CAPABILITIES = [
  { icon: Mic, label: "Speech-to-Text", desc: "Transcribe voice calls in 13 Indian languages", color: "#1F8A70", model: "saarika:v2" },
  { icon: Volume2, label: "Text-to-Speech", desc: "Natural voice synthesis for AI call scripts", color: "#D4AF37", model: "bulbul:v1" },
  { icon: Languages, label: "Translation", desc: "Real-time translation across Indian languages", color: "#10B981", model: "mayura:v1" },
];

const SARVAM_LANGUAGES = [
  { code: "hi-IN", name: "Hindi" }, { code: "en-IN", name: "English (India)" },
  { code: "bn-IN", name: "Bengali" }, { code: "ta-IN", name: "Tamil" },
  { code: "te-IN", name: "Telugu" }, { code: "mr-IN", name: "Marathi" },
  { code: "gu-IN", name: "Gujarati" }, { code: "kn-IN", name: "Kannada" },
  { code: "ml-IN", name: "Malayalam" }, { code: "pa-IN", name: "Punjabi" },
  { code: "od-IN", name: "Odia" }, { code: "ur-IN", name: "Urdu" },
  { code: "as-IN", name: "Assamese" },
];

export default function Config() {
  const { data: config, isLoading } = useGetConfig({ query: { queryKey: getGetConfigQueryKey() } });
  const updateConfig = useUpdateConfig();
  const callWebhook = useCallWebhook();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    callWindowStart: "", callWindowEnd: "",
    retry1DelayMinutes: "", retry2DelayMinutes: "",
    maxCallDurationMinutes: "", callSlaMinutes: "",
    hotScoreThreshold: "", warmScoreThreshold: "",
    crmWebhookUrl: "",
  });

  const [webhookData, setWebhookData] = useState({
    event: "call.completed", callId: "test-call-123", leadId: "",
    status: "COMPLETED", duration: "45",
    transcript: "Hello, I am interested in your product. My budget is around 5 lakhs.",
  });

  const [sarvamConfigured] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        callWindowStart: config.callWindowStart || "",
        callWindowEnd: config.callWindowEnd || "",
        retry1DelayMinutes: config.retry1DelayMinutes?.toString() || "",
        retry2DelayMinutes: config.retry2DelayMinutes?.toString() || "",
        maxCallDurationMinutes: config.maxCallDurationMinutes?.toString() || "",
        callSlaMinutes: config.callSlaMinutes?.toString() || "",
        hotScoreThreshold: config.hotScoreThreshold?.toString() || "",
        warmScoreThreshold: config.warmScoreThreshold?.toString() || "",
        crmWebhookUrl: config.crmWebhookUrl || "",
      });
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig.mutate({
      data: {
        callWindowStart: formData.callWindowStart || null,
        callWindowEnd: formData.callWindowEnd || null,
        retry1DelayMinutes: formData.retry1DelayMinutes ? Number(formData.retry1DelayMinutes) : null,
        retry2DelayMinutes: formData.retry2DelayMinutes ? Number(formData.retry2DelayMinutes) : null,
        maxCallDurationMinutes: formData.maxCallDurationMinutes ? Number(formData.maxCallDurationMinutes) : null,
        callSlaMinutes: formData.callSlaMinutes ? Number(formData.callSlaMinutes) : null,
        hotScoreThreshold: formData.hotScoreThreshold ? Number(formData.hotScoreThreshold) : null,
        warmScoreThreshold: formData.warmScoreThreshold ? Number(formData.warmScoreThreshold) : null,
        crmWebhookUrl: formData.crmWebhookUrl || null,
      }
    }, {
      onSuccess: () => { toast({ title: "Configuration saved" }); queryClient.invalidateQueries({ queryKey: getGetConfigQueryKey() }); },
      onError: () => { toast({ title: "Failed to update configuration", variant: "destructive" }); },
    });
  };

  const handleTestWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    callWebhook.mutate({
      data: {
        event: webhookData.event,
        callId: webhookData.callId,
        leadId: webhookData.leadId ? Number(webhookData.leadId) : null,
        status: webhookData.status,
        duration: webhookData.duration ? Number(webhookData.duration) : null,
        transcript: webhookData.transcript || null,
      }
    }, {
      onSuccess: () => { toast({ title: "Test webhook delivered" }); },
      onError: () => { toast({ title: "Failed to deliver webhook", variant: "destructive" }); },
    });
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-7">
      <motion.div {...fadeUp(0)} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">System configuration, AI models, and integrations.</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Call Operations */}
        <motion.div {...fadeUp(0.08)}>
          <SectionCard>
            <SectionHeader icon={Clock} iconColor="#0F3D3E" title="Call Operations" subtitle="Configure when and how calls are initiated" />
            <div className="p-6 grid md:grid-cols-2 gap-5">
              {[
                { label: "Call Window Start", name: "callWindowStart", type: "time" },
                { label: "Call Window End", name: "callWindowEnd", type: "time" },
                { label: "Retry 1 Delay (min)", name: "retry1DelayMinutes", type: "number" },
                { label: "Retry 2 Delay (min)", name: "retry2DelayMinutes", type: "number" },
                { label: "Max Call Duration (min)", name: "maxCallDurationMinutes", type: "number" },
                { label: "Call SLA (min)", name: "callSlaMinutes", type: "number" },
              ].map(field => (
                <div key={field.name} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600">{field.label}</label>
                  <Input name={field.name} type={field.type}
                    min={field.type === "number" ? "0" : undefined}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>

        {/* BANT Thresholds */}
        <motion.div {...fadeUp(0.13)}>
          <SectionCard>
            <SectionHeader icon={Zap} iconColor="#F59E0B" title="Qualification Thresholds" subtitle="Set the BANT bucket boundaries for automatic lead scoring" />
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-5 mb-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600">Hot Score Threshold <span className="text-xs text-slate-400">(0–10)</span></label>
                  <Input name="hotScoreThreshold" type="number" step="0.1" min="0" max="10"
                    value={formData.hotScoreThreshold} onChange={handleChange}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-600">Warm Score Threshold <span className="text-xs text-slate-400">(0–10)</span></label>
                  <Input name="warmScoreThreshold" type="number" step="0.1" min="0" max="10"
                    value={formData.warmScoreThreshold} onChange={handleChange}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                {[
                  { label: "HOT", color: "#10B981", desc: `≥ ${formData.hotScoreThreshold || "7"} / 10` },
                  { label: "WARM", color: "#F59E0B", desc: `${formData.warmScoreThreshold || "4"} – ${formData.hotScoreThreshold || "7"} / 10` },
                  { label: "COLD", color: "#94A3B8", desc: `< ${formData.warmScoreThreshold || "4"} / 10` },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <div>
                      <div className="text-xs font-bold" style={{ color: b.color }}>{b.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </motion.div>

        {/* Integrations / CRM */}
        <motion.div {...fadeUp(0.18)}>
          <SectionCard>
            <SectionHeader icon={Shield} iconColor="#10B981" title="Integrations" subtitle="External webhooks and CRM push connections" />
            <div className="p-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">CRM Webhook URL</label>
                <Input name="crmWebhookUrl" type="url" placeholder="https://your-crm.com/webhook"
                  value={formData.crmWebhookUrl} onChange={handleChange}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                <p className="text-[11px] text-muted-foreground">VoiceQual will POST a JSON payload here whenever a lead completes qualification.</p>
              </div>
            </div>
          </SectionCard>
        </motion.div>

        <motion.div {...fadeUp(0.22)} className="flex justify-end">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button type="submit" disabled={updateConfig.isPending} className="gap-2 px-6">
              {updateConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Configuration
            </Button>
          </motion.div>
        </motion.div>
      </form>

      {/* Sarvam.ai Integration Panel */}
      <motion.div {...fadeUp(0.26)}>
        <SectionCard>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                style={{ backgroundColor: "#FF6B35" }}>
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                  Sarvam.ai Voice Intelligence
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Multilingual Indian AI platform powering speech and language features</div>
              </div>
            </div>
            <SarvamStatusBadge configured={sarvamConfigured} />
          </div>

          {!sarvamConfigured && (
            <div className="mx-6 mt-5 p-4 rounded-xl flex items-start gap-3"
              style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-amber-700">API key not configured</div>
                <div className="text-xs text-amber-600 mt-0.5">Add <code className="font-mono bg-amber-100 px-1 rounded">SARVAM_API_KEY</code> to your environment secrets to activate voice intelligence capabilities.</div>
              </div>
            </div>
          )}

          <div className="p-6 grid md:grid-cols-3 gap-4">
            {SARVAM_CAPABILITIES.map(cap => (
              <div key={cap.label} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cap.color}14` }}>
                    <cap.icon className="w-4 h-4" style={{ color: cap.color }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cap.model}</span>
                </div>
                <div className="font-semibold text-sm text-foreground">{cap.label}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{cap.desc}</div>
                <div className="flex items-center gap-1 mt-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${sarvamConfigured ? "bg-emerald-400" : "bg-slate-300"}`} />
                  <span className="text-[10px] text-muted-foreground">{sarvamConfigured ? "Ready" : "Awaiting API key"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 pb-5">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="text-xs font-semibold text-slate-500 mb-3">Supported Languages ({SARVAM_LANGUAGES.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {SARVAM_LANGUAGES.map(lang => (
                  <span key={lang.code}
                    className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {lang.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 pb-5 flex items-center justify-between">
            <div className="text-[11px] text-muted-foreground">
              Endpoints: <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">/api/sarvam/tts</code>{" "}
              <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">/api/sarvam/stt</code>{" "}
              <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">/api/sarvam/translate</code>
            </div>
            <a href="https://www.sarvam.ai/apis" target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold hover:underline" style={{ color: '#1F8A70' }}>
              Get API Key <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </SectionCard>
      </motion.div>

      {/* Developer Tools */}
      <motion.div {...fadeUp(0.32)}>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-bold tracking-tight">Developer Tools</h2>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
        <SectionCard>
          <form onSubmit={handleTestWebhook}>
            <SectionHeader icon={Webhook} iconColor="#D4AF37" title="Test Call Webhook" subtitle="Simulate incoming events from the AI calling provider" />
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Event Type</label>
                <Select value={webhookData.event} onValueChange={v => setWebhookData(p => ({ ...p, event: v }))}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call.completed">call.completed</SelectItem>
                    <SelectItem value="call.failed">call.failed</SelectItem>
                    <SelectItem value="call.started">call.started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Status</label>
                <Select value={webhookData.status} onValueChange={v => setWebhookData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="FAILED">FAILED</SelectItem>
                    <SelectItem value="VM_LEFT">VM_LEFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Call ID</label>
                <Input value={webhookData.callId}
                  onChange={e => setWebhookData(p => ({ ...p, callId: e.target.value }))}
                  className="bg-slate-50 border-slate-200 font-mono text-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">
                  Lead ID <span className="text-[11px] text-slate-400">(optional)</span>
                </label>
                <Input type="number" value={webhookData.leadId}
                  onChange={e => setWebhookData(p => ({ ...p, leadId: e.target.value }))}
                  className="bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-600">Duration (seconds)</label>
                <Input type="number" value={webhookData.duration}
                  onChange={e => setWebhookData(p => ({ ...p, duration: e.target.value }))}
                  className="bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-600">Transcript</label>
                <Textarea className="font-mono text-sm h-24 bg-slate-50 border-slate-200"
                  value={webhookData.transcript}
                  onChange={e => setWebhookData(p => ({ ...p, transcript: e.target.value }))} />
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button type="submit" variant="secondary" disabled={callWebhook.isPending} className="gap-2">
                  {callWebhook.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Test Event
                </Button>
              </motion.div>
            </div>
          </form>
        </SectionCard>
      </motion.div>
    </div>
  );
}
