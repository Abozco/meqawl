import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  new: { label: "جديدة", variant: "default" },
  replied: { label: "تم الرد", variant: "secondary" },
  closed: { label: "مغلقة", variant: "outline" },
};

const AdminSupport = () => {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin_tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, companies(company_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, companyId }: { ticketId: string; companyId: string }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ reply: reply.trim(), status: "replied" as const })
        .eq("id", ticketId);
      if (error) throw error;

      await supabase.from("notifications").insert({
        sender_type: "support" as const,
        title: "تم الرد على رسالتك",
        body: "تم الرد على رسالة الدعم الفني الخاصة بك. اطلع على الرد من صفحة الدعم الفني.",
        company_id: companyId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_tickets"] });
      setReply("");
      toast.success("تم إرسال الرد بنجاح");
    },
    onError: () => toast.error("حدث خطأ"),
  });

  const closeTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: "closed" as const })
        .eq("id", ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_tickets"] });
      toast.success("تم إغلاق التذكرة");
    },
  });

  const filtered = tickets.filter(t => statusFilter === "all" || t.status === statusFilter);
  const active = tickets.find(t => t.id === selectedTicket);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-6 h-6" /> إدارة الدعم الفني
            </h1>
            <p className="text-muted-foreground">الرد على رسائل الشركات</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="new">جديدة</SelectItem>
              <SelectItem value="replied">تم الرد</SelectItem>
              <SelectItem value="closed">مغلقة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
              {filtered.map((ticket: any) => {
                const st = statusMap[ticket.status] || statusMap.new;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => { setSelectedTicket(ticket.id); setReply(ticket.reply || ""); }}
                    className={`w-full text-right bg-card rounded-xl p-4 border transition-colors ${
                      selectedTicket === ticket.id ? "border-destructive ring-1 ring-destructive/30" : "border-border hover:border-destructive/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={st.variant} className="text-xs">{st.label}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString("ar-LY")}</span>
                    </div>
                    <p className="text-xs font-medium text-foreground">{ticket.companies?.company_name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ticket.message}</p>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">لا توجد تذاكر</p>
              )}
            </div>

            <div className="lg:col-span-2">
              {active ? (
                <div className="bg-card rounded-xl p-6 border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{(active as any).companies?.company_name}</p>
                      <p className="text-xs text-muted-foreground">{(active as any).companies?.email}</p>
                    </div>
                    <Badge variant={statusMap[active.status]?.variant || "default"}>
                      {statusMap[active.status]?.label}
                    </Badge>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground font-medium mb-1">رسالة الشركة</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{active.message}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">الرد</p>
                    <Textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="اكتب ردك هنا..."
                      rows={4}
                      className="resize-none"
                      maxLength={1000}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => replyMutation.mutate({ ticketId: active.id, companyId: active.company_id })}
                      disabled={!reply.trim() || replyMutation.isPending}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      <Send className="w-4 h-4 ml-2" />
                      {replyMutation.isPending ? "جاري الإرسال..." : "إرسال الرد"}
                    </Button>
                    {active.status !== "closed" && (
                      <Button variant="outline" onClick={() => closeTicket.mutate(active.id)}>
                        <XCircle className="w-4 h-4 ml-2" /> إغلاق التذكرة
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl p-12 border border-border text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">اختر تذكرة لعرضها</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
