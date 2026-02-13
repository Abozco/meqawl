import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import ImageUpload from "@/components/dashboard/ImageUpload";
import SubscriptionManager from "@/components/dashboard/SubscriptionManager";
import GalleryManager from "@/components/dashboard/GalleryManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { useNavigate } from "react-router-dom";

const DashboardSettings = () => {
  const { company, refetch, loading: companyLoading } = useCompany();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    logo: '',
    city: '',
    category: '',
    description: '',
    address: '',
    phone_1: '',
    phone_2: '',
    email: '',
    facebook_url: '',
    whatsapp_number: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name || '',
        logo: company.logo || '',
        city: company.city || '',
        category: (company as any).category || '',
        description: company.description || '',
        address: company.address || '',
        phone_1: company.phone_1 || '',
        phone_2: company.phone_2 || '',
        email: company.email || '',
        facebook_url: company.facebook_url || '',
        whatsapp_number: company.whatsapp_number || '',
      });
    }
  }, [company]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          company_name: formData.company_name,
          logo: formData.logo || null,
          city: formData.city || null,
          category: formData.category || null,
          description: formData.description || null,
          address: formData.address || null,
          phone_1: formData.phone_1 || null,
          phone_2: formData.phone_2 || null,
          email: formData.email || null,
          facebook_url: formData.facebook_url || null,
          whatsapp_number: formData.whatsapp_number || null,
        })
        .eq('id', company.id);

      if (error) throw error;
      toast.success("تم حفظ التغييرات بنجاح");
      refetch();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("حدث خطأ في حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;
      toast.success("تم تغيير كلمة المرور بنجاح");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("حدث خطأ في تغيير كلمة المرور");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'حذف حسابي') {
      toast.error("يرجى كتابة 'حذف حسابي' للتأكيد");
      return;
    }

    try {
      // Delete company (cascades to all related data)
      if (company) {
        const { error } = await supabase
          .from('companies')
          .delete()
          .eq('id', company.id);

        if (error) throw error;
      }

      // Sign out
      await signOut();
      toast.success("تم حذف الحساب بنجاح");
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("حدث خطأ في حذف الحساب");
    }
  };

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة بيانات الشركة والحساب</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">بيانات الشركة</TabsTrigger>
            <TabsTrigger value="gallery">المعرض</TabsTrigger>
            <TabsTrigger value="subscription">الاشتراك</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="danger">حذف الحساب</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>بيانات الشركة</CardTitle>
                <CardDescription>معلومات شركتك التي ستظهر في الصفحة العامة</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <Label>شعار الشركة</Label>
                      {company && (
                        <ImageUpload
                          companyId={company.id}
                          folder="logo"
                          currentImage={formData.logo}
                          onUpload={(url) => setFormData({ ...formData, logo: url })}
                          onRemove={() => setFormData({ ...formData, logo: '' })}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_name">اسم الشركة</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>فئة الشركة</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger><SelectValue placeholder="اختر فئة" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="عقارات">عقارات</SelectItem>
                          <SelectItem value="مقاولات">مقاولات</SelectItem>
                          <SelectItem value="محاسبة">محاسبة</SelectItem>
                          <SelectItem value="ترجمة">ترجمة</SelectItem>
                          <SelectItem value="خدمات_عامة">خدمات عامة</SelectItem>
                          <SelectItem value="استشارات">استشارات</SelectItem>
                          <SelectItem value="هندسة_مدنية">هندسة مدنية</SelectItem>
                          <SelectItem value="سيارات">سيارات</SelectItem>
                          <SelectItem value="صيانة">صيانة</SelectItem>
                          <SelectItem value="تسويق">تسويق</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_1">رقم الهاتف 1</Label>
                      <Input
                        id="phone_1"
                        value={formData.phone_1}
                        onChange={(e) => setFormData({ ...formData, phone_1: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_2">رقم الهاتف 2</Label>
                      <Input
                        id="phone_2"
                        value={formData.phone_2}
                        onChange={(e) => setFormData({ ...formData, phone_2: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp_number">رقم الواتساب</Label>
                      <Input
                        id="whatsapp_number"
                        value={formData.whatsapp_number}
                        onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                        placeholder="مثال: 218912345678"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook_url">رابط فيسبوك</Label>
                      <Input
                        id="facebook_url"
                        value={formData.facebook_url}
                        onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description">نبذة عن الشركة</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                      <Save className="w-4 h-4 ml-2" />
                    )}
                    حفظ التغييرات
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionManager />
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>تغيير كلمة المرور</CardTitle>
                <CardDescription>تأكد من استخدام كلمة مرور قوية</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                      <Save className="w-4 h-4 ml-2" />
                    )}
                    تغيير كلمة المرور
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">حذف الحساب</CardTitle>
                <CardDescription>
                  سيتم حذف جميع بياناتك بشكل نهائي ولا يمكن استرجاعها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف الحساب نهائياً
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الحساب</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>هذا الإجراء لا يمكن التراجع عنه. سيتم حذف:</p>
              <ul className="list-disc list-inside text-sm">
                <li>جميع بيانات الشركة</li>
                <li>جميع المشاريع والخدمات والأعمال</li>
                <li>جميع أعضاء الفريق</li>
                <li>جميع الاشتراكات والمدفوعات</li>
              </ul>
              <p className="font-medium">اكتب "حذف حسابي" للتأكيد:</p>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="حذف حسابي"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm('')}>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteConfirm !== 'حذف حسابي'}
            >
              حذف الحساب
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DashboardSettings;
