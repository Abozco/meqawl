import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Briefcase, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import ImageUpload from "@/components/dashboard/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Work {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  work_type: string;
}

const workTypes = [
  { value: 'تنفيذ', label: 'تنفيذ' },
  { value: 'تشطيب', label: 'تشطيب' },
  { value: 'صيانة', label: 'صيانة' },
];

const DashboardWorks = () => {
  const { company, getLimits, canAdd, loading: companyLoading } = useCompany();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    work_type: 'تنفيذ',
  });

  useEffect(() => {
    if (company) {
      fetchWorks();
    }
  }, [company]);

  const fetchWorks = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      console.error('Error fetching works:', error);
      toast.error("حدث خطأ في جلب الأعمال");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      if (selectedWork) {
        const { error } = await supabase
          .from('works')
          .update({
            title: formData.title,
            description: formData.description || null,
            image: formData.image || null,
            work_type: formData.work_type as 'تنفيذ' | 'تشطيب' | 'صيانة',
          })
          .eq('id', selectedWork.id);

        if (error) throw error;
        toast.success("تم تحديث العمل بنجاح");
      } else {
        const { error } = await supabase
          .from('works')
          .insert({
            company_id: company.id,
            title: formData.title,
            description: formData.description || null,
            image: formData.image || null,
            work_type: formData.work_type as 'تنفيذ' | 'تشطيب' | 'صيانة',
          });

        if (error) throw error;
        toast.success("تم إضافة العمل بنجاح");
      }

      setDialogOpen(false);
      resetForm();
      fetchWorks();
    } catch (error) {
      console.error('Error saving work:', error);
      toast.error("حدث خطأ في حفظ العمل");
    }
  };

  const handleDelete = async () => {
    if (!selectedWork) return;

    try {
      const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', selectedWork.id);

      if (error) throw error;
      toast.success("تم حذف العمل بنجاح");
      setDeleteDialogOpen(false);
      setSelectedWork(null);
      fetchWorks();
    } catch (error) {
      console.error('Error deleting work:', error);
      toast.error("حدث خطأ في حذف العمل");
    }
  };

  const openEditDialog = (work: Work) => {
    setSelectedWork(work);
    setFormData({
      title: work.title,
      description: work.description || '',
      image: work.image || '',
      work_type: work.work_type,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedWork(null);
    setFormData({ title: '', description: '', image: '', work_type: 'تنفيذ' });
  };

  const limits = getLimits();
  const canAddMore = canAdd('works', works.length);

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
            <h1 className="text-2xl font-bold text-foreground">الأعمال</h1>
            <p className="text-muted-foreground">
              {works.length} من {limits.works} عمل
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            disabled={!canAddMore}
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة عمل
          </Button>
        </div>

        {!canAddMore && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لقد وصلت للحد الأقصى من الأعمال في خطتك الحالية. قم بالترقية لإضافة المزيد.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : works.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد أعمال بعد</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 ml-2" />
                أضف أول عمل
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((work) => (
              <Card key={work.id} className="overflow-hidden">
                {work.image ? (
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{work.title}</h3>
                    <Badge variant="outline">
                      {workTypes.find(t => t.value === work.work_type)?.label}
                    </Badge>
                  </div>
                  {work.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {work.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(work)}
                    >
                      <Pencil className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedWork(work);
                        setDeleteDialogOpen(true);
                      }}
                    >
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
            <DialogTitle>{selectedWork ? 'تعديل العمل' : 'إضافة عمل'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان العمل</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>صورة العمل</Label>
              {company && (
                <ImageUpload
                  companyId={company.id}
                  folder="works"
                  currentImage={formData.image}
                  onUpload={(url) => setFormData({ ...formData, image: url })}
                  onRemove={() => setFormData({ ...formData, image: '' })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>نوع العمل</Label>
              <Select
                value={formData.work_type}
                onValueChange={(value) => setFormData({ ...formData, work_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                {selectedWork ? 'حفظ التغييرات' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{selectedWork?.title}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DashboardWorks;
