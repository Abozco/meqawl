import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FolderKanban, Users, Eye, Phone, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";

const Dashboard = () => {
  const { company } = useCompany();
  const [stats, setStats] = useState({ visits: 0, projects: 0, team: 0, phoneClicks: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!company) return;

    const fetchData = async () => {
      // Fetch counts
      const [projectsRes, teamRes, statsRes] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("company_id", company.id),
        supabase.from("team_members").select("id", { count: "exact", head: true }).eq("company_id", company.id),
        supabase.from("statistics").select("visits, phone_clicks").eq("company_id", company.id),
      ]);

      const totalVisits = statsRes.data?.reduce((s, r) => s + (r.visits || 0), 0) || 0;
      const totalPhone = statsRes.data?.reduce((s, r) => s + (r.phone_clicks || 0), 0) || 0;

      setStats({
        visits: totalVisits,
        projects: projectsRes.count || 0,
        team: teamRes.count || 0,
        phoneClicks: totalPhone,
      });

      // Recent projects
      const { data: proj } = await supabase
        .from("projects").select("title, project_status").eq("company_id", company.id)
        .order("created_at", { ascending: false }).limit(3);
      setRecentProjects(proj || []);

      // Notifications
      const { data: notifs } = await supabase
        .from("notifications").select("title, body")
        .or(`company_id.eq.${company.id},company_id.is.null`)
        .order("created_at", { ascending: false }).limit(3);
      setNotifications(notifs || []);
    };

    fetchData();
  }, [company]);

  const statCards = [
    { icon: Eye, label: "زيارات الصفحة", value: stats.visits.toLocaleString(), color: "text-accent" },
    { icon: FolderKanban, label: "المشاريع", value: String(stats.projects), color: "text-accent" },
    { icon: Users, label: "أعضاء الفريق", value: String(stats.team), color: "text-accent" },
    { icon: Phone, label: "نقرات الاتصال", value: stats.phoneClicks.toLocaleString(), color: "text-accent" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">مرحباً بك 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">إليك نظرة سريعة على أداء شركتك</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-6 card-elevated border border-border">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-accent" /> آخر المشاريع
            </h3>
            <div className="space-y-3">
              {recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد مشاريع بعد</p>
              ) : recentProjects.map((p) => (
                <div key={p.title} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{p.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.project_status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-accent/10 text-accent'}`}>
                    {p.project_status === 'قيد_التنفيذ' ? 'قيد التنفيذ' : p.project_status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 card-elevated border border-border">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" /> آخر الإشعارات
            </h3>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد إشعارات</p>
              ) : notifications.map((n) => (
                <div key={n.title} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">{n.title}</span>
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
