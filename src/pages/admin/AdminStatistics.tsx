import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Building2, Users, Eye, Phone, MessageCircle, Facebook, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminStatistics = () => {
  const [period, setPeriod] = useState("30");

  const { data: platformStats } = useQuery({
    queryKey: ["admin-platform-stats"],
    queryFn: async () => {
      const [
        { count: totalCompanies },
        { count: verifiedCompanies },
        { count: activeSubscriptions },
        { count: totalProjects },
        { count: totalServices },
        { count: totalWorks },
      ] = await Promise.all([
        supabase.from("companies").select("*", { count: "exact", head: true }),
        supabase.from("companies").select("*", { count: "exact", head: true }).eq("verified", true),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("works").select("*", { count: "exact", head: true }),
      ]);
      return {
        totalCompanies: totalCompanies || 0,
        verifiedCompanies: verifiedCompanies || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalProjects: totalProjects || 0,
        totalServices: totalServices || 0,
        totalWorks: totalWorks || 0,
      };
    },
  });

  const { data: stats = [] } = useQuery({
    queryKey: ["admin-statistics", period],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));
      const { data, error } = await supabase
        .from("statistics")
        .select("*")
        .gte("date", daysAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Aggregate stats by date across all companies
  const chartData = useMemo(() => {
    const grouped: Record<string, { visits: number; phone: number; whatsapp: number; facebook: number }> = {};
    stats.forEach((s) => {
      const date = s.date;
      if (!grouped[date]) grouped[date] = { visits: 0, phone: 0, whatsapp: 0, facebook: 0 };
      grouped[date].visits += s.visits || 0;
      grouped[date].phone += s.phone_clicks || 0;
      grouped[date].whatsapp += s.whatsapp_clicks || 0;
      grouped[date].facebook += s.facebook_clicks || 0;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date: new Date(date).toLocaleDateString("ar-LY", { month: "short", day: "numeric" }),
        زيارات: d.visits,
        هاتف: d.phone,
        واتساب: d.whatsapp,
        فيسبوك: d.facebook,
      }));
  }, [stats]);

  const totals = useMemo(() => {
    return stats.reduce(
      (acc, s) => ({
        visits: acc.visits + (s.visits || 0),
        phone: acc.phone + (s.phone_clicks || 0),
        whatsapp: acc.whatsapp + (s.whatsapp_clicks || 0),
        facebook: acc.facebook + (s.facebook_clicks || 0),
      }),
      { visits: 0, phone: 0, whatsapp: 0, facebook: 0 }
    );
  }, [stats]);

  const cards = [
    { title: "إجمالي الشركات", value: platformStats?.totalCompanies ?? 0, icon: Building2, color: "text-primary" },
    { title: "الشركات الموثقة", value: platformStats?.verifiedCompanies ?? 0, icon: Users, color: "text-green-600" },
    { title: "الاشتراكات النشطة", value: platformStats?.activeSubscriptions ?? 0, icon: BarChart3, color: "text-blue-600" },
    { title: "إجمالي الزيارات", value: totals.visits, icon: Eye, color: "text-accent" },
    { title: "نقرات الهاتف", value: totals.phone, icon: Phone, color: "text-accent" },
    { title: "نقرات واتساب", value: totals.whatsapp, icon: MessageCircle, color: "text-accent" },
    { title: "نقرات فيسبوك", value: totals.facebook, icon: Facebook, color: "text-accent" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-destructive" /> إحصائيات المنصة
            </h1>
            <p className="text-muted-foreground text-sm mt-1">نظرة شاملة على أداء جميع الشركات</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">آخر 7 أيام</SelectItem>
              <SelectItem value="30">آخر 30 يوم</SelectItem>
              <SelectItem value="90">آخر 3 أشهر</SelectItem>
              <SelectItem value="365">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString("ar-LY")}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visits Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الزيارات الإجمالية</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="adminVisitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "13px" }} />
                  <Area type="monotone" dataKey="زيارات" stroke="hsl(var(--destructive))" fill="url(#adminVisitGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات لهذه الفترة</div>
            )}
          </CardContent>
        </Card>

        {/* Clicks Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">النقرات حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "13px" }} />
                  <Bar dataKey="هاتف" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="واتساب" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="فيسبوك" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminStatistics;
