// Real API client hooks using @tanstack/react-query
import { useQuery, useMutation } from "@tanstack/react-query";

const API_BASE = "/api";

async function fetchJSON(url: string) {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJSON(url: string, data: unknown) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function putJSON(url: string, data: unknown) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Leads List ──────────────────────────────────────────────────────
export type ListLeadsBucket = "HOT" | "WARM" | "COLD";

interface ListLeadsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  bucket?: ListLeadsBucket;
  status?: string;
}

export function useListLeads(params: ListLeadsParams = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.search) qs.set("search", params.search);
  if (params.bucket) qs.set("bucket", params.bucket);
  if (params.status) qs.set("status", params.status);

  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => fetchJSON(`/leads?${qs.toString()}`),
  });
}

export function useCreateLead() {
  return useMutation({
    mutationFn: ({ data }: { data: { name: string; phone: string; source: string } }) =>
      postJSON("/leads", data),
  });
}

export function getListLeadsQueryKey() {
  return ["leads"];
}

// ── Single Lead (lead-detail.tsx calls: useGetLead(leadId, { query: { enabled, queryKey } })) ──
export function useGetLead(leadId: number, opts?: { query?: { enabled?: boolean; queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: opts?.query?.queryKey || ["lead", leadId],
    queryFn: () => fetchJSON(`/leads/${leadId}`),
    enabled: opts?.query?.enabled ?? !!leadId,
  });
}

export function useRetryLead() {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      postJSON(`/leads/${id}/retry`, {}),
  });
}

export function getGetLeadQueryKey(leadId?: number) {
  return leadId ? ["lead", leadId] : ["lead"];
}

// ── Single Call (lead-detail.tsx calls: useGetCall(callId, { query: { enabled, queryKey } })) ──
export function useGetCall(callId: number, opts?: { query?: { enabled?: boolean; queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: opts?.query?.queryKey || ["call", callId],
    queryFn: () => fetchJSON(`/leads/0/calls/${callId}`),
    enabled: opts?.query?.enabled ?? !!callId,
  });
}

// ── Analytics ───────────────────────────────────────────────────────
export function useGetAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => fetchJSON("/analytics/overview"),
  });
}

export function useGetAnalyticsFunnel() {
  return useQuery({
    queryKey: ["analytics", "funnel"],
    queryFn: () => fetchJSON("/analytics/funnel"),
  });
}

export function useGetAnalyticsDaily(params: { days?: number } = {}) {
  return useQuery({
    queryKey: ["analytics", "daily", params.days],
    queryFn: () => fetchJSON(`/analytics/daily?days=${params.days || 30}`),
  });
}

export function useGetAnalyticsSources() {
  return useQuery({
    queryKey: ["analytics", "sources"],
    queryFn: () => fetchJSON("/analytics/sources"),
  });
}

// ── Config ──────────────────────────────────────────────────────────
export function useGetConfig(opts?: { query?: { queryKey?: string[] } }) {
  return useQuery({
    queryKey: opts?.query?.queryKey || ["config"],
    queryFn: () => fetchJSON("/config"),
  });
}

export function useUpdateConfig() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, unknown> }) =>
      putJSON("/config", data),
  });
}

export function getGetConfigQueryKey() {
  return ["config"];
}

export function useCallWebhook() {
  return useMutation({
    mutationFn: ({ data }: { data: Record<string, unknown> }) =>
      postJSON("/webhook/test", data),
  });
}
