import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Wrench, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
}

const DashboardServices = () => {
  const { company, getLimits, canAdd, loading: companyLoading } = useCompany();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  });

  useEffect(() => {
    if (company) fetchServices();
  }, [company]);

  const fetchServices = async () => {
    if (!company) return;
    try {
      const { data, error } = await supabase
        .from('services').select('*').eq('company_id', company.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error("حدث خطأ في جلب الخدمات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        price: formData.price ? Number(formData.price) : null,
      };
      if (selectedService) {
        const { error } = await supabase.from('services').update(payload).eq('id', selectedService.id);
        if (error) throw error;
        toast.success("تم تحديث الخدمة بنجاح");
      } else {
        const { error } = await supabase.from('services').insert({ ...payload, company_id: company.id });
        if (error) throw error;
        toast.success("تم إضافة الخدمة بنجاح");
      }
      setDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error("حدث خطأ في حفظ الخدمة");
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', selectedService.id);
      if (error) throw error;
      toast.success("تم حذف الخدمة بنجاح");
      setDeleteDialogOpen(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      toast.error("حدث خطأ في حذف الخدمة");
    }
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      title: service.title,
      description: service.description || '',
      price: service.price ? String(service.price) : '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedService(null);
    setFormData({ title: '', description: '', price: '' });
  };

  const limits = getLimits();
  const canAddMore = canAdd('services', services.length);

  if (companyLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">جاري التحميل...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الخدمات</h1>
            <p className="text-muted-foreground">{services.length} من {limits.services} خدمة</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} disabled={!canAddMore}>
            <Plus className="w-4 h-4 ml-2" /> إضافة خدمة
          </Button>
        </div>

        {!canAddMore && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>لقد وصلت للحد الأقصى من الخدمات في خطتك الحالية. قم بالترقية لإضافة المزيد.</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد خدمات بعد</p>
              <Button variant="outline" className="mt-4" onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 ml-2" /> أضف أول خدمة
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{service.title}</h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                      )}
                      {service.price != null && (
                        <p className="text-sm font-bold text-accent mt-1">{service.price} د.ل</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(service)}>
                      <Pencil className="w-4 h-4 ml-1" /> تعديل
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive"
                      onClick={() => { setSelectedService(service); setDeleteDialogOpen(true); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedService ? 'تعديل الخدمة' : 'إضافة خدمة'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">اسم الخدمة</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">السعر بالدينار (اختياري)</Label>
              <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="مثال: 500" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button type="submit">{selectedService ? 'حفظ التغييرات' : 'إضافة'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف خدمة "{selectedService?.title}"؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DashboardServices;
