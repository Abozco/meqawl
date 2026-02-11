import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Send, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  new: { label: "جديدة", variant: "default", icon: Clock },
  replied: { label: "تم الرد", variant: "secondary", icon: CheckCircle2 },
  closed: { label: "مغلقة", variant: "outline", icon: XCircle },
};

const DashboardSupport = () => {
  const { companyId } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["support_tickets", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      if (!companyId || !message.trim()) return;
      const { error } = await supabase.from("support_tickets").insert({
        company_id: companyId,
        message: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
      setMessage("");
      setDialogOpen(false);
      toast.success("تم إرسال الرسالة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الإرسال"),
  });

  const active = tickets.find((t) => t.id === selectedTicket);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-accent" /> الدعم الفني
            </h1>
            <p className="text-sm text-muted-foreground mt-1">أرسل رسالة لفريق الدعم وتابع الردود</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent-gradient text-accent-foreground hover:opacity-90">
                <Plus className="w-4 h-4 ml-2" /> رسالة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إرسال رسالة للدعم الفني</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="اكتب رسالتك هنا..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-left">{message.length}/1000</p>
                <Button
                  className="w-full bg-accent-gradient text-accent-foreground hover:opacity-90"
                  onClick={() => createTicket.mutate()}
                  disabled={!message.trim() || createTicket.isPending}
                >
                  <Send className="w-4 h-4 ml-2" />
                  {createTicket.isPending ? "جاري الإرسال..." : "إرسال"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-card rounded-xl p-12 card-elevated border border-border text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد رسائل حتى الآن</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Tickets List */}
            <div className="lg:col-span-1 space-y-2">
              {tickets.map((ticket) => {
                const st = statusMap[ticket.status] || statusMap.new;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket.id)}
                    className={`w-full text-right bg-card rounded-xl p-4 border transition-colors ${
                      selectedTicket === ticket.id ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant={st.variant} className="text-xs flex-shrink-0">
                        {st.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString("ar-LY")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{ticket.message}</p>
                  </button>
                );
              })}
            </div>

            {/* Ticket Detail */}
            <div className="lg:col-span-2">
              {active ? (
                <div className="bg-card rounded-xl p-6 card-elevated border border-border space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge variant={statusMap[active.status]?.variant || "default"}>
                      {statusMap[active.status]?.label || active.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(active.created_at).toLocaleDateString("ar-LY", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {/* User Message */}
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                    <p className="text-xs text-accent font-medium mb-1">رسالتك</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{active.message}</p>
                  </div>

                  {/* Admin Reply */}
                  {active.reply ? (
                    <div className="bg-muted/50 border border-border rounded-lg p-4">
                      <p className="text-xs text-muted-foreground font-medium mb-1">رد فريق الدعم</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{active.reply}</p>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      في انتظار الرد من فريق الدعم
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card rounded-xl p-12 card-elevated border border-border text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">اختر رسالة لعرض تفاصيلها</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardSupport;
