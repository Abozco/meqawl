import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FolderKanban, Users, Eye, Phone, MessageSquare } from "lucide-react";

const stats = [
  { icon: Eye, label: "زيارات الصفحة", value: "1,245", color: "text-accent" },
  { icon: FolderKanban, label: "المشاريع", value: "12", color: "text-accent" },
  { icon: Users, label: "أعضاء الفريق", value: "8", color: "text-accent" },
  { icon: Phone, label: "نقرات الاتصال", value: "87", color: "text-accent" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">مرحباً بك 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">إليك نظرة سريعة على أداء شركتك</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-5 card-elevated border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <span className="block font-heading text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-6 card-elevated border border-border">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-accent" /> آخر المشاريع
            </h3>
            <div className="space-y-3">
              {["مشروع فيلا سكنية - طرابلس", "مجمع تجاري - بنغازي", "صيانة مدرسة - مصراتة"].map((p) => (
                <div key={p} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{p}</span>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">قيد التنفيذ</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 card-elevated border border-border">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" /> آخر الإشعارات
            </h3>
            <div className="space-y-3">
              {[
                "تم تفعيل حسابك بنجاح",
                "اشتراكك سينتهي خلال 7 أيام",
                "تحديث جديد متاح للمنصة"
              ].map((n) => (
                <div key={n} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
