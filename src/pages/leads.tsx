import { useState } from "react";
import { motion } from "framer-motion";
import { useListLeads, useCreateLead, getListLeadsQueryKey, ListLeadsBucket } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, ArrowRight } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const bucketStyles: Record<string, string> = {
  HOT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WARM: "bg-amber-50 text-amber-700 border-amber-200",
  COLD: "bg-slate-50 text-slate-500 border-slate-200",
};

const statusStyles: Record<string, string> = {
  COMPLETED: "border-emerald-200 text-emerald-700 bg-emerald-50",
  CALLING: "border-amber-200 text-amber-700 bg-amber-50 animate-pulse",
  FAILED: "border-red-200 text-red-600 bg-red-50",
  PENDING: "border-gray-200 text-gray-500 bg-gray-50",
  VM_LEFT: "border-amber-200 text-amber-600 bg-amber-50",
};

export default function Leads() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [bucket, setBucket] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useListLeads({
    page,
    pageSize: 50,
    search: search || undefined,
    bucket: bucket !== "ALL" ? (bucket as ListLeadsBucket) : undefined,
    status: status !== "ALL" ? status : undefined,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createLead = useCreateLead();

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createLead.mutate(
      { data: { name: formData.get("name") as string, phone: formData.get("phone") as string, source: formData.get("source") as string } },
      {
        onSuccess: () => { setIsCreateOpen(false); toast({ title: "Lead created successfully" }); queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() }); },
        onError: () => { toast({ title: "Failed to create lead", variant: "destructive" }); },
      }
    );
  };

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Intelligence</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and review all incoming leads.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Ingest Lead</Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ingest New Lead</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input name="name" required /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input name="phone" required placeholder="+91-9876543211" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Source</label><Input name="source" required placeholder="e.g. Website, LinkedIn" /></div>
              <Button type="submit" className="w-full" disabled={createLead.isPending}>
                {createLead.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Lead"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div {...fadeUp(0.1)} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl"
        style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={bucket} onValueChange={setBucket}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Bucket" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Buckets</SelectItem>
            <SelectItem value="HOT">Hot</SelectItem>
            <SelectItem value="WARM">Warm</SelectItem>
            <SelectItem value="COLD">Cold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CALLING">Calling</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="VM_LEFT">VM Left</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div {...fadeUp(0.2)} className="rounded-2xl bg-white"
        style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="font-semibold">Bucket</TableHead>
              <TableHead className="font-semibold">Score</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  {[75, 60, 55, 40, 50, 45, 65, 30].map((w, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${w}%` }} /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : !data || data.leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">No leads found matching your criteria.</TableCell>
              </TableRow>
            ) : (
              data.leads.map((lead, i) => (
                <motion.tr key={lead.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(0.03 * i, 0.18), duration: 0.25 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors group">
                  <TableCell>
                    <Link href={`/leads/${lead.id}`} className="font-medium text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: "#1F8A70", border: "1px solid #D4AF37" }}>
                        {(lead.name || "Unknown Lead").slice(0, 2).toUpperCase()}
                      </div>
                      {lead.name || "Unknown Lead"}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{lead.phone}</TableCell>
                  <TableCell className="text-sm">{lead.source}</TableCell>
                  <TableCell>
                    {lead.bucket ? (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${bucketStyles[lead.bucket] || ""}`}>{lead.bucket}</span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    {lead.score !== null && lead.score !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(lead.score / 10) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * i }}
                            className={`h-full rounded-full ${lead.score >= 7 ? 'bg-emerald-500' : lead.score >= 4 ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        </div>
                        <span className="text-xs font-mono font-bold">{(lead.score ?? 0).toFixed(1)}</span>
                      </div>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusStyles[lead.status] || ""}`}>{lead.status}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link href={`/leads/${lead.id}`}>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </motion.div>

      {data && data.totalPages > 1 && (
        <motion.div {...fadeUp(0.3)} className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-3 font-mono">Page {page} of {data.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>Next</Button>
        </motion.div>
      )}
    </div>
  );
}
