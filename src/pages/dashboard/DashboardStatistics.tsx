import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, Phone, MessageCircle, Facebook, TrendingUp, Calendar } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DashboardStatistics = () => {
  const { companyId } = useAuth();
  const [period, setPeriod] = useState("30");

  const { data: stats = [] } = useQuery({
    queryKey: ["statistics", companyId, period],
    queryFn: async () => {
      if (!companyId) return [];
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      const { data, error } = await supabase
        .from("statistics")
        .select("*")
        .eq("company_id", companyId)
        .gte("date", daysAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

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

  const chartData = useMemo(() => {
    return stats.map((s) => ({
      date: new Date(s.date).toLocaleDateString("ar-LY", { month: "short", day: "numeric" }),
      زيارات: s.visits || 0,
      هاتف: s.phone_clicks || 0,
      واتساب: s.whatsapp_clicks || 0,
      فيسبوك: s.facebook_clicks || 0,
    }));
  }, [stats]);

  const pieData = [
    { name: "الهاتف", value: totals.phone, color: "hsl(var(--accent))" },
    { name: "واتساب", value: totals.whatsapp, color: "hsl(142, 71%, 45%)" },
    { name: "فيسبوك", value: totals.facebook, color: "hsl(221, 83%, 53%)" },
  ].filter((d) => d.value > 0);

  const summaryCards = [
    { icon: Eye, label: "إجمالي الزيارات", value: totals.visits, color: "text-accent" },
    { icon: Phone, label: "نقرات الهاتف", value: totals.phone, color: "text-accent" },
    { icon: MessageCircle, label: "نقرات واتساب", value: totals.whatsapp, color: "text-accent" },
    { icon: Facebook, label: "نقرات فيسبوك", value: totals.facebook, color: "text-accent" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accent" /> الإحصائيات
            </h1>
            <p className="text-sm text-muted-foreground mt-1">تابع أداء صفحتك ومعدل التفاعل</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-card rounded-xl p-5 card-elevated border border-border">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="block font-heading text-2xl font-bold text-foreground">{card.value.toLocaleString("ar-LY")}</span>
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
          ))}
        </div>

        {/* Visits Area Chart */}
        <div className="bg-card rounded-xl p-6 card-elevated border border-border">
          <h3 className="font-heading text-lg font-bold text-foreground mb-4">الزيارات اليومية</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Area type="monotone" dataKey="زيارات" stroke="hsl(var(--accent))" fill="url(#visitGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات لهذه الفترة</div>
          )}
        </div>

        {/* Clicks Bar Chart + Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-xl p-6 card-elevated border border-border">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4">النقرات حسب النوع</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="هاتف" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="واتساب" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="فيسبوك" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </div>

          <div className="bg-card rounded-xl p-6 card-elevated border border-border">
            <h3 className="font-heading text-lg font-bold text-foreground mb-4">توزيع النقرات</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardStatistics;
