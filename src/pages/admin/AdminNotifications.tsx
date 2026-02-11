import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Send, Users, Building2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type NotificationSender = Database["public"]["Enums"]["notification_sender"];

const senderOptions: { value: NotificationSender; label: string }[] = [
  { value: "admin", label: "الإدارة" },
  { value: "support", label: "الدعم الفني" },
  { value: "subscription", label: "الاشتراكات" },
];

const AdminNotifications = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [senderType, setSenderType] = useState<NotificationSender>("admin");
  const [targetType, setTargetType] = useState<"all" | "single">("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const { data: companies = [] } = useQuery({
    queryKey: ["admin-companies-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, company_name").order("company_name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*, companies(company_name)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const sendNotification = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !body.trim()) throw new Error("يرجى ملء جميع الحقول");

      if (targetType === "all") {
        // Send to all companies (company_id = null means broadcast)
        const { error } = await supabase.from("notifications").insert({
          title: title.trim(),
          body: body.trim(),
          sender_type: senderType,
          company_id: null,
        });
        if (error) throw error;
      } else {
        if (!selectedCompanyId) throw new Error("يرجى اختيار شركة");
        const { error } = await supabase.from("notifications").insert({
          title: title.trim(),
          body: body.trim(),
          sender_type: senderType,
          company_id: selectedCompanyId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("تم إرسال الإشعار بنجاح");
      setTitle("");
      setBody("");
      setSelectedCompanyId("");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف الإشعار");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: () => toast.error("فشل حذف الإشعار"),
  });

  const senderLabels: Record<string, string> = {
    admin: "الإدارة",
    support: "الدعم الفني",
    subscription: "الاشتراكات",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-destructive" /> إدارة الإشعارات
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إرسال إشعارات للشركات</p>
        </div>

        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-5 h-5" /> إرسال إشعار جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الإرسال إلى</label>
                <Select value={targetType} onValueChange={(v) => setTargetType(v as "all" | "single")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> جميع الشركات
                      </div>
                    </SelectItem>
                    <SelectItem value="single">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> شركة محددة
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sender Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">توقيع القسم المرسل</label>
                <Select value={senderType} onValueChange={(v) => setSenderType(v as NotificationSender)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {senderOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Company Select (if single) */}
            {targetType === "single" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">اختر الشركة</label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر شركة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">عنوان الإشعار</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان الإشعار..."
                maxLength={100}
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">نص الإشعار</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="أدخل نص الإشعار..."
                rows={4}
                maxLength={500}
              />
            </div>

            <Button
              onClick={() => sendNotification.mutate()}
              disabled={sendNotification.isPending || !title.trim() || !body.trim()}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Send className="w-4 h-4 ml-2" />
              {sendNotification.isPending ? "جاري الإرسال..." : "إرسال الإشعار"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">سجل الإشعارات المرسلة</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>لا توجد إشعارات مرسلة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif: any) => (
                  <div key={notif.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-foreground text-sm">{notif.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {senderLabels[notif.sender_type] || notif.sender_type}
                        </Badge>
                        <Badge variant={notif.company_id ? "secondary" : "default"} className="text-xs">
                          {notif.company_id ? (notif.companies?.company_name || "شركة محددة") : "الجميع"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.body}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notif.created_at).toLocaleDateString("ar-LY", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف الإشعار</AlertDialogTitle>
                            <AlertDialogDescription>هل أنت متأكد من حذف هذا الإشعار؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteNotification.mutate(notif.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
