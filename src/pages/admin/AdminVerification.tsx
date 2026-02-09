import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Eye, Building2, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Company {
  id: string;
  company_name: string;
  email: string;
  city: string | null;
  address: string | null;
  phone_1: string | null;
  phone_2: string | null;
  description: string | null;
  facebook_url: string | null;
  whatsapp_number: string | null;
  logo: string | null;
  verified: boolean;
  created_at: string;
  slug: string | null;
}

const AdminVerification = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('verified', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error("حدث خطأ في جلب الشركات");
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (company: Company, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ verified })
        .eq('id', company.id);

      if (error) throw error;

      // Send notification
      await supabase.from('notifications').insert({
        sender_type: 'admin',
        title: verified ? 'تم توثيق شركتك' : 'تم إلغاء توثيق شركتك',
        body: verified 
          ? 'تهانينا! تم توثيق شركتك وستظهر علامة التوثيق في صفحتك العامة.'
          : 'تم إلغاء توثيق شركتك. يرجى التواصل مع الدعم الفني لمزيد من المعلومات.',
        company_id: company.id,
      });
      
      toast.success(verified ? "تم توثيق الشركة بنجاح" : "تم إلغاء التوثيق");
      fetchCompanies();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error("حدث خطأ في تحديث التوثيق");
    }
  };

  const unverifiedCompanies = companies.filter(c => !c.verified);
  const verifiedCompanies = companies.filter(c => c.verified);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">توثيق الشركات</h1>
          <p className="text-muted-foreground">إدارة طلبات التوثيق ومنح العلامة الزرقاء</p>
        </div>

        {/* Unverified Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-amber-600" />
              شركات في انتظار التوثيق ({unverifiedCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الشركة</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>المدينة</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : unverifiedCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا توجد شركات في انتظار التوثيق
                      </TableCell>
                    </TableRow>
                  ) : (
                    unverifiedCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.company_name}</TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>{company.city || "-"}</TableCell>
                        <TableCell>
                          {new Date(company.created_at).toLocaleDateString('ar-LY')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCompany(company);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 ml-1" />
                              عرض
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => toggleVerification(company, true)}
                            >
                              <CheckCircle className="w-4 h-4 ml-1" />
                              توثيق
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Verified Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              الشركات الموثقة ({verifiedCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الشركة</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>المدينة</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifiedCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا توجد شركات موثقة
                      </TableCell>
                    </TableRow>
                  ) : (
                    verifiedCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {company.company_name}
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          </div>
                        </TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>{company.city || "-"}</TableCell>
                        <TableCell>
                          {new Date(company.created_at).toLocaleDateString('ar-LY')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => toggleVerification(company, false)}
                          >
                            <XCircle className="w-4 h-4 ml-1" />
                            إلغاء التوثيق
                          </Button>
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

      {/* Company Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الشركة</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedCompany.logo ? (
                  <img 
                    src={selectedCompany.logo} 
                    alt={selectedCompany.company_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold">{selectedCompany.company_name}</h3>
                  <p className="text-muted-foreground">{selectedCompany.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedCompany.city || "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedCompany.phone_1 || "غير محدد"}</span>
                </div>
              </div>

              {selectedCompany.description && (
                <div>
                  <h4 className="font-medium mb-2">نبذة عن الشركة</h4>
                  <p className="text-sm text-muted-foreground">{selectedCompany.description}</p>
                </div>
              )}

              {selectedCompany.address && (
                <div>
                  <h4 className="font-medium mb-2">العنوان</h4>
                  <p className="text-sm text-muted-foreground">{selectedCompany.address}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                  onClick={() => {
                    toggleVerification(selectedCompany, true);
                    setDetailsOpen(false);
                  }}
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  توثيق الشركة
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminVerification;
