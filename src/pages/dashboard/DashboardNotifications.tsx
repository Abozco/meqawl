import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DashboardNotifications = () => {
  const { companyId } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`company_id.eq.${companyId},company_id.is.null`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!companyId) return;
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("company_id", companyId)
        .eq("is_read", false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const senderLabels: Record<string, string> = {
    admin: "إدارة",
    support: "دعم فني",
    subscription: "اشتراك",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="w-6 h-6 text-accent" /> الإشعارات
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : "لا توجد إشعارات جديدة"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="w-4 h-4 ml-2" /> تحديد الكل كمقروء
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-card rounded-xl p-12 card-elevated border border-border text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-card rounded-xl p-4 border transition-colors ${
                  notif.is_read ? "border-border" : "border-accent/30 bg-accent/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground text-sm">{notif.title}</h3>
                    {!notif.is_read && <Badge className="bg-accent-gradient text-xs">جديد</Badge>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {senderLabels[notif.sender_type] || notif.sender_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.created_at).toLocaleDateString("ar-LY")}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{notif.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardNotifications;
