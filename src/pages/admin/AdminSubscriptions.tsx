import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Subscription {
  id: string;
  plan: string;
  duration: string;
  price: number;
  status: string;
  started_at: string | null;
  ends_at: string | null;
  created_at: string;
  companies: {
    company_name: string;
    email: string;
  };
}

const planLabels: Record<string, string> = {
  basic: "أساسي",
  premium: "احترافي",
  pro: "متقدم",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  expired: "منتهي",
  cancelled: "ملغي",
  pending: "معلق",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  pending: "bg-amber-100 text-amber-800",
};

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          companies (
            company_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error("حدث خطأ في جلب الاشتراكات");
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'active') {
        updateData.started_at = new Date().toISOString();
        // Set end date based on duration
        const sub = subscriptions.find(s => s.id === subscriptionId);
        if (sub) {
          const endDate = new Date();
          if (sub.duration === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }
          updateData.ends_at = endDate.toISOString();
        }
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId);

      if (error) throw error;
      
      toast.success("تم تحديث حالة الاشتراك");
      fetchSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error("حدث خطأ في تحديث الاشتراك");
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    statusFilter === "all" || sub.status === statusFilter
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الاشتراكات</h1>
          <p className="text-muted-foreground">عرض وإدارة اشتراكات الشركات</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>قائمة الاشتراكات ({filteredSubscriptions.length})</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الشركة</TableHead>
                    <TableHead>الخطة</TableHead>
                    <TableHead>المدة</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        لا توجد اشتراكات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subscription.companies?.company_name}</div>
                            <div className="text-sm text-muted-foreground">{subscription.companies?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {planLabels[subscription.plan] || subscription.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscription.duration === 'monthly' ? 'شهري' : 'سنوي'}
                        </TableCell>
                        <TableCell>{subscription.price} د.ل</TableCell>
                        <TableCell>
                          <Badge className={statusColors[subscription.status] || ""}>
                            {statusLabels[subscription.status] || subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscription.ends_at 
                            ? new Date(subscription.ends_at).toLocaleDateString('ar-LY')
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={subscription.status}
                            onValueChange={(value) => updateSubscriptionStatus(subscription.id, value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">تفعيل</SelectItem>
                              <SelectItem value="pending">تعليق</SelectItem>
                              <SelectItem value="expired">إنهاء</SelectItem>
                              <SelectItem value="cancelled">إلغاء</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
