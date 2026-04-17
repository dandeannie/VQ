import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2, Copy, Key, Zap, BookOpen, Shield } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const endpoints = [
  {
    method: "GET",
    path: "/api/leads",
    description: "List all leads with optional filtering by bucket, status, and search query",
    params: "?page=1&pageSize=50&bucket=HOT&status=COMPLETED&search=name",
  },
  {
    method: "POST",
    path: "/api/leads",
    description: "Ingest a new lead for AI qualification",
    params: '{ "name": "string", "phone": "string", "source": "string" }',
  },
  {
    method: "GET",
    path: "/api/leads/:id",
    description: "Retrieve a single lead with BANT scores and call history",
    params: "",
  },
  {
    method: "POST",
    path: "/api/leads/:id/retry",
    description: "Retry an AI qualification call for a specific lead",
    params: "",
  },
  {
    method: "GET",
    path: "/api/analytics/overview",
    description: "Get dashboard overview stats: total leads, hot/warm leads, conversion rate",
    params: "",
  },
  {
    method: "GET",
    path: "/api/analytics/funnel",
    description: "Retrieve the lead qualification funnel with stage-by-stage breakdown",
    params: "",
  },
  {
    method: "GET",
    path: "/api/analytics/daily",
    description: "Daily leads and calls created over the past N days",
    params: "?days=30",
  },
  {
    method: "GET",
    path: "/api/analytics/sources",
    description: "Lead source distribution with counts and percentages",
    params: "",
  },
  {
    method: "POST",
    path: "/api/calls/webhook",
    description: "Receive call completion events from your AI calling provider",
    params: '{ "event": "call.completed", "callId": "string", "leadId": 1, "status": "COMPLETED", "duration": 45, "transcript": "string" }',
  },
  {
    method: "GET",
    path: "/api/config",
    description: "Retrieve current system configuration settings",
    params: "",
  },
  {
    method: "PUT",
    path: "/api/config",
    description: "Update system configuration: thresholds, retry delays, call windows",
    params: '{ "hotScoreThreshold": 7, "retry1DelayMinutes": 30 }',
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POST: "bg-green-100 text-green-700 border-green-200",
  PUT: "bg-amber-100 text-amber-700 border-amber-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
};

export default function ApiAccess() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Access</h1>
          <p className="text-sm text-gray-500 mt-1">Integrate VoiceQual AI into your systems via REST API</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Full Documentation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(31,138,112,0.06)' }}>
              <Key className="h-5 w-5" style={{ color: '#1F8A70' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Authentication</p>
              <p className="text-xs text-gray-500 mt-0.5">Bearer token via Authorization header</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Rate Limit</p>
              <p className="text-xs text-gray-500 mt-0.5">1,000 requests / minute per API key</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Base URL</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">/api</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5" style={{ color: '#1F8A70' }} />
            <CardTitle className="text-base font-semibold text-gray-900">Endpoints Reference</CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-500">All available API endpoints and their usage</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {endpoints.map((ep, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Badge className={`text-[11px] font-bold px-2 py-0.5 border rounded shrink-0 mt-0.5 ${methodColors[ep.method] || "bg-gray-100 text-gray-700"}`}>
                      {ep.method}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono font-semibold text-gray-800">{ep.path}</code>
                      <p className="text-xs text-gray-500 mt-1">{ep.description}</p>
                      {ep.params && (
                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded px-3 py-1.5">
                          <code className="text-[11px] font-mono text-gray-600 break-all">{ep.params}</code>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(ep.path, idx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 rounded hover:bg-gray-200"
                    title="Copy path"
                  >
                    <Copy className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md" style={{ backgroundColor: '#0F3D3E' }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-semibold text-base">Need a Webhook Integration?</h3>
              <p className="text-sm mt-1 max-w-md" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Configure your AI calling provider to POST events to our webhook endpoint. BANT scores are automatically computed when a call completes.
              </p>
            </div>
            <Button variant="secondary" className="shrink-0 mt-1" style={{ backgroundColor: 'white', color: '#0F3D3E' }}>
              Configure Webhooks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
