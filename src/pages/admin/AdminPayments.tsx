import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Payment {
  id: string;
  codes: string;
  amount: number;
  plan: string;
  duration: string;
  status: string;
  created_at: string;
  companies: {
    id: string;
    company_name: string;
    email: string;
  };
}

const planLabels: Record<string, string> = {
  basic: "أساسي",
  premium: "احترافي",
  pro: "متقدم",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  rejected: "مرفوض",
};

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          companies (
            id,
            company_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error("حدث خطأ في جلب المدفوعات");
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (payment: Payment, newStatus: 'confirmed' | 'rejected') => {
    try {
      // Update payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', payment.id);

      if (paymentError) throw paymentError;

      // If confirmed, activate the subscription
      if (newStatus === 'confirmed') {
        const endDate = new Date();
        if (payment.duration === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            plan: payment.plan as 'basic' | 'premium' | 'pro',
            duration: payment.duration as 'monthly' | 'yearly',
            price: payment.amount,
            status: 'active',
            started_at: new Date().toISOString(),
            ends_at: endDate.toISOString(),
          })
          .eq('company_id', payment.companies.id);

        if (subError) throw subError;

        // Send notification to company
        await supabase.from('notifications').insert({
          sender_type: 'subscription',
          title: 'تم تفعيل اشتراكك',
          body: `تم تأكيد الدفع وتفعيل خطة ${planLabels[payment.plan]} بنجاح.`,
          company_id: payment.companies.id,
        });
      } else {
        // Send rejection notification
        await supabase.from('notifications').insert({
          sender_type: 'subscription',
          title: 'تم رفض طلب الدفع',
          body: 'عذراً، تم رفض طلب الدفع الخاص بك. يرجى التواصل مع الدعم الفني.',
          company_id: payment.companies.id,
        });
      }

      toast.success(newStatus === 'confirmed' ? "تم تأكيد الدفع وتفعيل الاشتراك" : "تم رفض طلب الدفع");
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error("حدث خطأ في تحديث حالة الدفع");
    }
  };

  const filteredPayments = payments.filter(payment =>
    statusFilter === "all" || payment.status === statusFilter
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المدفوعات</h1>
          <p className="text-muted-foreground">مراجعة وتأكيد طلبات الدفع</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>طلبات الدفع ({filteredPayments.length})</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
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
                    <TableHead>أكواد الدفع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الخطة</TableHead>
                    <TableHead>المدة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        لا توجد طلبات دفع
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.companies?.company_name}</div>
                            <div className="text-sm text-muted-foreground">{payment.companies?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {payment.codes}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">{payment.amount} د.ل</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {planLabels[payment.plan] || payment.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.duration === 'monthly' ? 'شهري' : 'سنوي'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[payment.status] || ""}>
                            {payment.status === 'pending' && <Clock className="w-3 h-3 ml-1" />}
                            {payment.status === 'confirmed' && <CheckCircle className="w-3 h-3 ml-1" />}
                            {payment.status === 'rejected' && <XCircle className="w-3 h-3 ml-1" />}
                            {statusLabels[payment.status] || payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString('ar-LY')}
                        </TableCell>
                        <TableCell>
                          {payment.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => updatePaymentStatus(payment, 'confirmed')}
                              >
                                <CheckCircle className="w-4 h-4 ml-1" />
                                تأكيد
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => updatePaymentStatus(payment, 'rejected')}
                              >
                                <XCircle className="w-4 h-4 ml-1" />
                                رفض
                              </Button>
                            </div>
                          )}
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

export default AdminPayments;
