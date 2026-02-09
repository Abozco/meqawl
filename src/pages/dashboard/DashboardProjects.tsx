import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FolderKanban, AlertCircle } from "lucide-react";
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

interface Project {
  id: string;
  title: string;
  image: string | null;
  project_type: string;
  project_status: string;
}

const projectTypes = [
  { value: 'سكني', label: 'سكني' },
  { value: 'تجاري', label: 'تجاري' },
  { value: 'صناعي', label: 'صناعي' },
  { value: 'بنية_تحتية', label: 'بنية تحتية' },
];

const projectStatuses = [
  { value: 'قيد_التنفيذ', label: 'قيد التنفيذ' },
  { value: 'مكتمل', label: 'مكتمل' },
];

const DashboardProjects = () => {
  const { company, getLimits, canAdd, loading: companyLoading } = useCompany();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    project_type: 'سكني',
    project_status: 'قيد_التنفيذ',
  });

  useEffect(() => {
    if (company) {
      fetchProjects();
    }
  }, [company]);

  const fetchProjects = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("حدث خطأ في جلب المشاريع");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      if (selectedProject) {
        // Update
        const { error } = await supabase
          .from('projects')
          .update({
            title: formData.title,
            image: formData.image || null,
            project_type: formData.project_type as 'سكني' | 'تجاري' | 'صناعي' | 'بنية_تحتية',
            project_status: formData.project_status as 'قيد_التنفيذ' | 'مكتمل',
          })
          .eq('id', selectedProject.id);

        if (error) throw error;
        toast.success("تم تحديث المشروع بنجاح");
      } else {
        // Create
        const { error } = await supabase
          .from('projects')
          .insert({
            company_id: company.id,
            title: formData.title,
            image: formData.image || null,
            project_type: formData.project_type as 'سكني' | 'تجاري' | 'صناعي' | 'بنية_تحتية',
            project_status: formData.project_status as 'قيد_التنفيذ' | 'مكتمل',
          });

        if (error) throw error;
        toast.success("تم إضافة المشروع بنجاح");
      }

      setDialogOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error("حدث خطأ في حفظ المشروع");
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id);

      if (error) throw error;
      toast.success("تم حذف المشروع بنجاح");
      setDeleteDialogOpen(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error("حدث خطأ في حذف المشروع");
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      image: project.image || '',
      project_type: project.project_type,
      project_status: project.project_status,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedProject(null);
    setFormData({
      title: '',
      image: '',
      project_type: 'سكني',
      project_status: 'قيد_التنفيذ',
    });
  };

  const limits = getLimits();
  const canAddMore = canAdd('projects', projects.length);

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
            <h1 className="text-2xl font-bold text-foreground">المشاريع</h1>
            <p className="text-muted-foreground">
              {projects.length} من {limits.projects} مشروع
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
            إضافة مشروع
          </Button>
        </div>

        {!canAddMore && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لقد وصلت للحد الأقصى من المشاريع في خطتك الحالية. قم بالترقية لإضافة المزيد.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد مشاريع بعد</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 ml-2" />
                أضف أول مشروع
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <FolderKanban className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{project.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      {projectTypes.find(t => t.value === project.project_type)?.label}
                    </Badge>
                    <Badge className={project.project_status === 'مكتمل' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                      {projectStatuses.find(s => s.value === project.project_status)?.label}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(project)}
                    >
                      <Pencil className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedProject(project);
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProject ? 'تعديل المشروع' : 'إضافة مشروع'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">اسم المشروع</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>صورة المشروع</Label>
              {company && (
                <ImageUpload
                  companyId={company.id}
                  folder="projects"
                  currentImage={formData.image}
                  onUpload={(url) => setFormData({ ...formData, image: url })}
                  onRemove={() => setFormData({ ...formData, image: '' })}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع المشروع</Label>
                <Select
                  value={formData.project_type}
                  onValueChange={(value) => setFormData({ ...formData, project_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>حالة المشروع</Label>
                <Select
                  value={formData.project_status}
                  onValueChange={(value) => setFormData({ ...formData, project_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                {selectedProject ? 'حفظ التغييرات' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف مشروع "{selectedProject?.title}"؟
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

export default DashboardProjects;
