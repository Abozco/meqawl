import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CreditCard, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalCompanies: number;
  activeSubscriptions: number;
  pendingPayments: number;
  verifiedCompanies: number;
  pendingTickets: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
    verifiedCompanies: 0,
    pendingTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: companiesCount },
        { count: activeSubsCount },
        { count: pendingPaymentsCount },
        { count: verifiedCount },
        { count: ticketsCount },
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('verified', true),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      ]);

      setStats({
        totalCompanies: companiesCount || 0,
        activeSubscriptions: activeSubsCount || 0,
        pendingPayments: pendingPaymentsCount || 0,
        verifiedCompanies: verifiedCount || 0,
        pendingTickets: ticketsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "إجمالي الشركات", value: stats.totalCompanies, icon: Building2, color: "text-primary" },
    { title: "الاشتراكات النشطة", value: stats.activeSubscriptions, icon: CreditCard, color: "text-green-600" },
    { title: "المدفوعات المعلقة", value: stats.pendingPayments, icon: Clock, color: "text-amber-600" },
    { title: "الشركات الموثقة", value: stats.verifiedCompanies, icon: CheckCircle, color: "text-blue-600" },
    { title: "تذاكر الدعم الجديدة", value: stats.pendingTickets, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة تحكم الأدمن</h1>
          <p className="text-muted-foreground">نظرة عامة على المنصة</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {loading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
