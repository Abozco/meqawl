import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Users, AlertCircle, User } from "lucide-react";
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

interface TeamMember {
  id: string;
  name: string;
  position: string;
  photo: string | null;
}

const DashboardTeam = () => {
  const { company, getLimits, canAdd, loading: companyLoading } = useCompany();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    photo: '',
  });

  useEffect(() => {
    if (company) {
      fetchTeam();
    }
  }, [company]);

  const fetchTeam = async () => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeam(data || []);
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error("حدث خطأ في جلب فريق العمل");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      if (selectedMember) {
        const { error } = await supabase
          .from('team_members')
          .update({
            name: formData.name,
            position: formData.position,
            photo: formData.photo || null,
          })
          .eq('id', selectedMember.id);

        if (error) throw error;
        toast.success("تم تحديث العضو بنجاح");
      } else {
        const { error } = await supabase
          .from('team_members')
          .insert({
            company_id: company.id,
            name: formData.name,
            position: formData.position,
            photo: formData.photo || null,
          });

        if (error) throw error;
        toast.success("تم إضافة العضو بنجاح");
      }

      setDialogOpen(false);
      resetForm();
      fetchTeam();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error("حدث خطأ في حفظ العضو");
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', selectedMember.id);

      if (error) throw error;
      toast.success("تم حذف العضو بنجاح");
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      fetchTeam();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error("حدث خطأ في حذف العضو");
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      photo: member.photo || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedMember(null);
    setFormData({ name: '', position: '', photo: '' });
  };

  const limits = getLimits();
  const canAddMore = canAdd('team', team.length);

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
            <h1 className="text-2xl font-bold text-foreground">فريق العمل</h1>
            <p className="text-muted-foreground">
              {team.length} من {limits.team} عضو
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
            إضافة عضو
          </Button>
        </div>

        {!canAddMore && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لقد وصلت للحد الأقصى من أعضاء الفريق في خطتك الحالية. قم بالترقية لإضافة المزيد.
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : team.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا يوجد أعضاء في الفريق بعد</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 ml-2" />
                أضف أول عضو
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {team.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4 text-center">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{member.position}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(member)}
                    >
                      <Pencil className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedMember(member);
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
            <DialogTitle>{selectedMember ? 'تعديل العضو' : 'إضافة عضو'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>صورة العضو</Label>
              {company && (
                <ImageUpload
                  companyId={company.id}
                  folder="team"
                  currentImage={formData.photo}
                  onUpload={(url) => setFormData({ ...formData, photo: url })}
                  onRemove={() => setFormData({ ...formData, photo: '' })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">المنصب</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                {selectedMember ? 'حفظ التغييرات' : 'إضافة'}
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
              هل أنت متأكد من حذف "{selectedMember?.name}"؟
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

export default DashboardTeam;
