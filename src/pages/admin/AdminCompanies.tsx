import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, Eye, Trash2, MoreHorizontal, Ban, ShieldOff, Shield, ShieldCheck, Lock, Unlock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompanyWithSub {
  id: string;
  company_name: string;
  email: string;
  city: string | null;
  verified: boolean;
  banned: boolean;
  restricted: boolean;
  created_at: string;
  slug: string | null;
  subscriptions: { plan: string; duration: string; status: string }[];
  payments: { codes: string; status: string }[];
}

const planLabels: Record<string, string> = { basic: "أساسي", premium: "مميز", pro: "احترافي" };
const paymentStatusLabels: Record<string, string> = { pending: "قيد المراجعة", confirmed: "مؤكد", rejected: "مرفوض" };

const AdminCompanies = () => {
  const [companies, setCompanies] = useState<CompanyWithSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithSub | null>(null);

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*, subscriptions(plan, duration, status), payments(codes, status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCompanies((data || []) as any);
    } catch {
      toast.error("حدث خطأ في جلب الشركات");
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (id: string, updates: Record<string, any>, successMsg: string) => {
    try {
      const { error } = await supabase.from("companies").update(updates).eq("id", id);
      if (error) throw error;
      toast.success(successMsg);
      fetchCompanies();
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    try {
      const { error } = await supabase.from("companies").delete().eq("id", selectedCompany.id);
      if (error) throw error;
      toast.success("تم حذف الشركة بنجاح");
      setDeleteDialogOpen(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch {
      toast.error("حدث خطأ في حذف الشركة");
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الشركات</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع شركات المقاولات</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>قائمة الشركات ({filteredCompanies.length})</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الشركة</TableHead>
                    <TableHead>البريد</TableHead>
                    <TableHead>الخطة</TableHead>
                    <TableHead>المدة</TableHead>
                    <TableHead>حالة الدفع</TableHead>
                    <TableHead>كود الدفع</TableHead>
                    <TableHead>التوثيق</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
                  ) : filteredCompanies.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">لا توجد شركات</TableCell></TableRow>
                  ) : (
                    filteredCompanies.map((company) => {
                      const sub = company.subscriptions?.[0];
                      const payment = company.payments?.[0];
                      return (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1">
                              {company.company_name}
                              {company.verified && <CheckCircle className="w-4 h-4 text-blue-600" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{company.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{planLabels[sub?.plan] || "-"}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{sub?.duration === "yearly" ? "سنوي" : "شهري"}</TableCell>
                          <TableCell>
                            {payment?.status && (
                              <Badge className={
                                payment.status === "confirmed" ? "bg-green-100 text-green-800" :
                                payment.status === "rejected" ? "bg-red-100 text-red-800" :
                                "bg-amber-100 text-amber-800"
                              }>
                                {paymentStatusLabels[payment.status] || payment.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{payment?.codes || "-"}</code>
                          </TableCell>
                          <TableCell>
                            {company.verified ? (
                              <Badge className="bg-blue-100 text-blue-800">موثق</Badge>
                            ) : (
                              <Badge variant="secondary">غير موثق</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {company.banned ? (
                              <Badge className="bg-red-100 text-red-800">محظور</Badge>
                            ) : company.restricted ? (
                              <Badge className="bg-amber-100 text-amber-800">مقيد</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">نشط</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <a href={`/company/${company.slug}`} target="_blank" rel="noopener noreferrer">
                                    <Eye className="w-4 h-4 ml-2" /> عرض الصفحة
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => updateCompany(company.id, { verified: !company.verified }, company.verified ? "تم إلغاء التوثيق" : "تم توثيق الشركة")}>
                                  {company.verified ? <><ShieldOff className="w-4 h-4 ml-2" /> إلغاء التوثيق</> : <><ShieldCheck className="w-4 h-4 ml-2" /> توثيق الشركة</>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateCompany(company.id, { restricted: !company.restricted }, company.restricted ? "تم إلغاء التقييد" : "تم تقييد الحساب")}>
                                  {company.restricted ? <><Unlock className="w-4 h-4 ml-2" /> إلغاء التقييد</> : <><Lock className="w-4 h-4 ml-2" /> تقييد الحساب</>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateCompany(company.id, { banned: !company.banned }, company.banned ? "تم إلغاء الحظر" : "تم حظر الحساب")}>
                                  {company.banned ? <><Shield className="w-4 h-4 ml-2" /> إلغاء الحظر</> : <><Ban className="w-4 h-4 ml-2 text-destructive" /> حظر الحساب</>}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedCompany(company); setDeleteDialogOpen(true); }}>
                                  <Trash2 className="w-4 h-4 ml-2" /> حذف الشركة
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف شركة "{selectedCompany?.company_name}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCompanies;
